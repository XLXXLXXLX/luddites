import YAML from "yaml"
import { slugifyFilePath } from "@quartz-community/utils"
import type { FilePath, FullSlug } from "@quartz-community/utils"

/**
 * Read an explicit, root-relative `slug` from YAML frontmatter.
 *
 * Filenames remain the source of truth when the field is absent or invalid.
 * A valid value may be written with or without a leading slash and `.md`.
 */
export function getFrontmatterSlug(source: string): FullSlug | undefined {
  const normalized = source.replace(/^\uFEFF/, "")
  const match = normalized.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) return undefined

  let data: unknown
  try {
    data = YAML.parse(match[1] ?? "")
  } catch {
    return undefined
  }

  if (data === null || typeof data !== "object") return undefined
  const value = (data as Record<string, unknown>).slug
  if (typeof value !== "string" && typeof value !== "number") return undefined

  const raw = String(value)
    .trim()
    .replace(/^\/+|\/+$/g, "")
  if (
    raw.length === 0 ||
    raw.includes("?") ||
    raw.includes("#") ||
    raw.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    return undefined
  }

  const filePath = (raw.toLowerCase().endsWith(".md") ? raw : `${raw}.md`) as FilePath
  return slugifyFilePath(filePath)
}
