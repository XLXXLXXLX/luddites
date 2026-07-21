import esbuild from "esbuild"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { Processor, unified } from "unified"
import { Root as MDRoot } from "remark-parse/lib"
import { Element, Root as HTMLRoot } from "hast"
import { MarkdownContent, ProcessedContent } from "../plugins/vfile"
import { PerfTimer } from "../util/perf"
import { read } from "to-vfile"
import {
  FilePath,
  FullSlug,
  QUARTZ,
  RelativeURL,
  resolveRelative,
  simplifySlug,
  slugifyFilePath,
  stripSlashes,
} from "../util/path"
import path from "path"
import workerpool, { Promise as WorkerPromise } from "workerpool"
import { QuartzLogger } from "../util/log"
import { trace } from "../util/trace"
import { BuildCtx, WorkerSerializableBuildCtx } from "../util/ctx"
import { styleText } from "util"
import { visit } from "unist-util-visit"

function isExternalOrAnchor(url: string): boolean {
  return url.startsWith("#") || url.startsWith("//") || /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url)
}

function resolveTargetFromUrl(
  url: string,
  sourceSlug: FullSlug,
): { slug: FullSlug; suffix: string } {
  const sourceBase = stripSlashes(simplifySlug(sourceSlug), true)
  const parsed = new URL(url, `https://base.invalid/${sourceBase}`)
  let target = decodeURIComponent(stripSlashes(parsed.pathname, true))
  if (target.endsWith("/")) target += "index"
  return { slug: target as FullSlug, suffix: parsed.search + parsed.hash }
}

function canonicalTarget(slugMap: Record<string, FullSlug>, slug: FullSlug): FullSlug {
  return slugMap[slug] ?? slug
}

function rebaseInternalUrl(
  url: string,
  sourceSlug: FullSlug,
  pageSlug: FullSlug,
  slugMap: Record<string, FullSlug>,
  knownTarget?: FullSlug,
): { url: RelativeURL; target: FullSlug } | undefined {
  if (isExternalOrAnchor(url)) return undefined
  const resolved = resolveTargetFromUrl(url, sourceSlug)
  const target = canonicalTarget(slugMap, knownTarget ?? resolved.slug)
  return {
    url: (resolveRelative(pageSlug, simplifySlug(target)) + resolved.suffix) as RelativeURL,
    target,
  }
}

function applyCanonicalSlug(
  tree: HTMLRoot,
  file: MarkdownContent[1],
  sourceSlug: FullSlug,
  pageSlug: FullSlug,
  slugMap: Record<string, FullSlug>,
) {
  visit(tree, "element", (node: Element) => {
    const properties = node.properties
    if (!properties) return

    if (node.tagName === "a" && typeof properties.href === "string") {
      const knownTarget =
        typeof properties["data-slug"] === "string"
          ? (properties["data-slug"] as FullSlug)
          : undefined
      const rebased = rebaseInternalUrl(properties.href, sourceSlug, pageSlug, slugMap, knownTarget)
      if (rebased) {
        properties.href = rebased.url
        properties["data-slug"] = rebased.target
      }
    }

    for (const property of ["src", "data"] as const) {
      if (typeof properties[property] !== "string") continue
      const rebased = rebaseInternalUrl(properties[property], sourceSlug, pageSlug, slugMap)
      if (rebased) properties[property] = rebased.url
    }
  })

  const links = file.data.links
  if (Array.isArray(links)) {
    file.data.links = links.map((link) => {
      if (typeof link !== "string") return link
      return simplifySlug(canonicalTarget(slugMap, link as unknown as FullSlug))
    })
  }

  if (pageSlug !== sourceSlug) {
    const aliases = new Set<FullSlug>(((file.data.aliases as FullSlug[] | undefined) ?? []).flat())
    aliases.add(sourceSlug)
    file.data.aliases = [...aliases]
    file.data.slug = pageSlug
  }
}

export type QuartzMdProcessor = Processor<MDRoot, MDRoot, MDRoot>
export type QuartzHtmlProcessor = Processor<undefined, MDRoot, HTMLRoot>

export function createMdProcessor(ctx: BuildCtx): QuartzMdProcessor {
  const transformers = ctx.cfg.plugins.transformers

  return (
    unified()
      // base Markdown -> MD AST
      .use(remarkParse)
      // MD AST -> MD AST transforms
      .use(
        transformers.flatMap((plugin) => plugin.markdownPlugins?.(ctx) ?? []),
      ) as unknown as QuartzMdProcessor
    //  ^ sadly the typing of `use` is not smart enough to infer the correct type from our plugin list
  )
}

export function createHtmlProcessor(ctx: BuildCtx): QuartzHtmlProcessor {
  const transformers = ctx.cfg.plugins.transformers
  return (
    unified()
      // MD AST -> HTML AST
      .use(remarkRehype, { allowDangerousHtml: true })
      // HTML AST -> HTML AST transforms
      .use(transformers.flatMap((plugin) => plugin.htmlPlugins?.(ctx) ?? []))
  )
}

function* chunks<T>(arr: T[], n: number) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n)
  }
}

async function transpileWorkerScript() {
  // transpile worker script
  const cacheFile = "./.quartz-cache/transpiled-worker.mjs"
  const fp = "./quartz/worker.ts"
  return esbuild.build({
    entryPoints: [fp],
    outfile: path.join(QUARTZ, cacheFile),
    bundle: true,
    keepNames: true,
    platform: "node",
    format: "esm",
    packages: "external",
    sourcemap: true,
    sourcesContent: false,
    plugins: [
      {
        name: "css-and-scripts-as-text",
        setup(build) {
          build.onLoad({ filter: /\.scss$/ }, (_) => ({
            contents: "",
            loader: "text",
          }))
          build.onLoad({ filter: /\.inline\.(ts|js)$/ }, (_) => ({
            contents: "",
            loader: "text",
          }))
        },
      },
    ],
  })
}

export function createFileParser(ctx: BuildCtx, fps: FilePath[]) {
  const { argv, cfg } = ctx
  return async (processor: QuartzMdProcessor) => {
    const res: MarkdownContent[] = []
    for (const fp of fps) {
      try {
        const perf = new PerfTimer()
        const file = await read(fp)

        // strip leading and trailing whitespace
        file.value = file.value.toString().trim()

        // Text -> Text transforms
        for (const plugin of cfg.plugins.transformers.filter((p) => p.textTransform)) {
          file.value = plugin.textTransform!(ctx, file.value.toString())
        }

        // base data properties that plugins may use
        file.data.filePath = file.path as FilePath
        file.data.relativePath = path.posix.relative(argv.directory, file.path) as FilePath
        file.data.slug = slugifyFilePath(file.data.relativePath)

        const ast = processor.parse(file)
        const newAst = await processor.run(ast, file)
        res.push([newAst, file])

        if (argv.verbose) {
          console.log(`[markdown] ${fp} -> ${file.data.slug} (${perf.timeSince()})`)
        }
      } catch (err) {
        trace(`\nFailed to process markdown \`${fp}\``, err as Error)
      }
    }

    return res
  }
}

export function createMarkdownParser(ctx: BuildCtx, mdContent: MarkdownContent[]) {
  return async (processor: QuartzHtmlProcessor) => {
    const res: ProcessedContent[] = []
    for (const [ast, file] of mdContent) {
      try {
        const perf = new PerfTimer()

        const sourceSlug = file.data.slug as FullSlug
        const newAst = await processor.run(ast as MDRoot, file)
        const pageSlug = ctx.slugMap[sourceSlug] ?? sourceSlug
        applyCanonicalSlug(newAst, file, sourceSlug, pageSlug, ctx.slugMap)
        res.push([newAst, file])

        if (ctx.argv.verbose) {
          console.log(`[html] ${file.data.slug} (${perf.timeSince()})`)
        }
      } catch (err) {
        trace(`\nFailed to process html \`${file.data.filePath}\``, err as Error)
      }
    }

    return res
  }
}

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(Math.round(num), min), max)

export async function parseMarkdown(ctx: BuildCtx, fps: FilePath[]): Promise<ProcessedContent[]> {
  const { argv } = ctx
  const perf = new PerfTimer()
  const log = new QuartzLogger(argv.verbose)

  // rough heuristics: 128 gives enough time for v8 to JIT and optimize parsing code paths
  const CHUNK_SIZE = 128
  const concurrency = ctx.argv.concurrency ?? clamp(fps.length / CHUNK_SIZE, 1, 4)

  let res: ProcessedContent[] = []
  log.start(`Parsing input files using ${concurrency} threads`)
  if (concurrency === 1) {
    try {
      const mdRes = await createFileParser(ctx, fps)(createMdProcessor(ctx))
      res = await createMarkdownParser(ctx, mdRes)(createHtmlProcessor(ctx))
    } catch (error) {
      log.end()
      throw error
    }
  } else {
    await transpileWorkerScript()
    const pool = workerpool.pool("./quartz/bootstrap-worker.mjs", {
      minWorkers: "max",
      maxWorkers: concurrency,
      workerType: "thread",
    })
    const serializableCtx: WorkerSerializableBuildCtx = {
      buildId: ctx.buildId,
      argv: ctx.argv,
      allSlugs: ctx.allSlugs,
      allFiles: ctx.allFiles,
      slugMap: ctx.slugMap,
      incremental: ctx.incremental,
      virtualPages: [],
    }

    try {
      const textToMarkdownPromises: WorkerPromise<MarkdownContent[]>[] = []
      let processedFiles = 0
      for (const chunk of chunks(fps, CHUNK_SIZE)) {
        textToMarkdownPromises.push(pool.exec("parseMarkdown", [serializableCtx, chunk]))
      }

      const mdResults: Array<MarkdownContent[]> = await Promise.all(
        textToMarkdownPromises.map(async (promise) => {
          const result = await promise
          processedFiles += result.length
          log.updateText(`text->markdown ${styleText("gray", `${processedFiles}/${fps.length}`)}`)
          return result
        }),
      )

      const markdownToHtmlPromises: WorkerPromise<ProcessedContent[]>[] = []
      processedFiles = 0
      for (const mdChunk of mdResults) {
        markdownToHtmlPromises.push(pool.exec("processHtml", [serializableCtx, mdChunk]))
      }
      const results: ProcessedContent[][] = await Promise.all(
        markdownToHtmlPromises.map(async (promise) => {
          const result = await promise
          processedFiles += result.length
          log.updateText(`markdown->html ${styleText("gray", `${processedFiles}/${fps.length}`)}`)
          return result
        }),
      )

      res = results.flat()
    } finally {
      await pool.terminate()
    }
  }

  log.end(`Parsed ${res.length} Markdown files in ${perf.timeSince()}`)
  return res
}
