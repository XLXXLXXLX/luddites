import fs from 'node:fs/promises';
const ART = 'file:///C:/Users/xlx/AppData/Local/Temp/codex-presentations/manual-after-machines/tmp/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const { Presentation, PresentationFile } = await import(ART);

const ROOT='C:/Users/xlx/Documents/antigravity/luddites-quartz';
const OUT=`${ROOT}/outputs/砸机器之后_卢德运动的力量、失败与劳动政治.pptx`;
const QA='C:/Users/xlx/AppData/Local/Temp/codex-presentations/manual-after-machines/tmp/qa';
const ASSET=`${ROOT}/quartz/static/slides/assets/after-machines`;
const C={coal:'#11110F',dark:'#1B1A17',paper:'#EEE3C8',pale:'#CDBF9F',rust:'#C65335',gold:'#D3AA47',cyan:'#79D6FF',muted:'#A7A18F',line:'#4A463D',white:'#F7F2E8',ai:'#071116'};
const deck=Presentation.create({slideSize:{width:1280,height:720}});

function rect(s,x,y,w,h,fill='none',stroke='none',width=0){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width}})}
function tx(s,v,x,y,w,h,size=24,color=C.white,bold=false,align='left',font='Microsoft YaHei'){
  const o=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{style:'solid',fill:'none',width:0}});o.text=v;o.text.style={fontSize:size,color,bold,alignment:align,fontFamily:font};return o;
}
function slide(bg=C.coal){const s=deck.slides.add();s.background.fill=bg;return s}
function head(s,k,t,n){tx(s,k.toUpperCase(),64,38,750,28,16,C.rust,true);tx(s,t,64,82,1120,118,48,C.white,true);tx(s,String(n).padStart(2,'0'),1160,38,56,28,20,'#666157',false,'right','Georgia')}
function foot(s,v){rect(s,64,680,1152,1,C.line);tx(s,v,64,688,1152,18,11,'#77766E')}
async function img(){ return; }
function cards(s,items,y=245,h=300){const gap=18,w=(1152-gap*(items.length-1))/items.length;items.forEach((a,i)=>{const x=64+i*(w+gap);rect(s,x,y,w,h,C.dark,C.line,1);rect(s,x,y,w,5,a[2]||C.rust);tx(s,a[0],x+22,y+28,w-44,62,27,C.white,true);tx(s,a[1],x+22,y+105,w-44,h-128,20,C.pale)})}
function table(s,rows,y=220,cols=[260,430,462]){rows.forEach((r,i)=>{const yy=y+i*78;rect(s,64,yy,1152,1,C.line);let x=64;r.forEach((v,j)=>{tx(s,v,x,yy+15,cols[j]-18,52,j===0?21:19,j===0?C.gold:(j===2?'#E99179':C.pale),j===0);x+=cols[j]})})}
function convert(s,rows,y=220){rows.forEach((r,i)=>{const yy=y+i*88;rect(s,64,yy,1152,1,C.line);tx(s,r[0],64,yy+17,360,52,24,C.pale);tx(s,'→',440,yy+15,80,52,30,C.rust,true,'center');tx(s,r[1],540,yy+15,650,54,26,C.white,true)})}

// 1 title
{const s=slide();await img(s,`${ASSET}/luddite-small.jpg`,760,0,520,720);rect(s,0,0,830,720,C.coal);rect(s,830,0,450,720,'#211612');tx(s,'1811\n→\nAI',930,155,260,360,66,C.rust,true,'center','Georgia');tx(s,'劳动史 · 组织政治 · AI',68,82,620,30,18,C.rust,true);tx(s,'砸机器之后',68,165,650,88,70,C.white,true);tx(s,'卢德运动的力量、失败与劳动政治',68,280,650,80,33,C.paper,true);tx(s,'从工匠秘密结社、群众政治到 AI 时代',68,400,620,45,23,C.pale);foot(s,'《The Leader of the Luddites》，1812 · Public Domain')}
// 2 paradox
{const s=slide();tx(s,'开场的悖论',64,60,400,30,17,C.rust,true);tx(s,'他们会调查工价、组织代表、募集经费，\n会使用暗号，也敢于直接行动。',64,165,1120,140,48,C.white,true);tx(s,'为什么还是输了？',64,390,980,80,60,C.rust,true);foot(s,'纠正刻板印象之后，真正的问题才开始。')}
// 3 facts
{const s=slide();head(s,'三个事实','不能用善意神话替换“愚昧反技术”',3);cards(s,[['不是没有组织','地方网络、通信、资金、纪律和行动能力真实存在。',C.gold],['不是统一组织','General Ludd 是共享名字与战略迷雾，不是全国总司令。',C.rust],['也不是无辜受害者','请愿与谈判之外，还有夺枪、纵火、刺杀和威慑。',C.cyan]]);foot(s,'问题：地方正当性与扰乱能力，怎样成为持久政治力量？')}
// 4 regions
{const s=slide('#151410');head(s,'三种卢德主义','三种劳动制度，形成三种政治能力',4);cards(s,[['诺丁汉','框架针织、家庭作坊、袜商转包\n\n行业治理与代表政治',C.gold],['约克郡西区','熟练剪绒、集中磨坊、设防生产\n\n秘密纪律与武装强制',C.rust],['兰开夏','手织、棉纺厂、城市群众并存\n\n异质的群众政治',C.cyan]],235,330);foot(s,'差异不是背景；差异决定他们能做什么，也决定怎样失败。')}
// 5 Nottingham
{const s=slide('#151410');head(s,'诺丁汉','机器按它怎样重组生产，而不是按“新／旧”被选择',5);table(s,[['工价','压低计件报酬','破坏接受低价者使用的机架'],['产品','宽幅织物裁剪缝合','争论何为合格产品'],['资格','非学徒进入生产','保护技能，也排除新人和女性'],['支付','实物工资与机架租金','要求现金、公平价格与规制']],220,[180,420,552]);foot(s,'机器、工价、产品、技能与权威，是同一场生产政治。')}
// 6 forms
{const s=slide('#151410');head(s,'谈判与威胁并存','毁机不是谈判的反面，\n而是让协议具有约束力的手段',6);cards(s,[['公开代表政治','会议广告 · 具名秘书\n工价谈判 · 行业调查\n议会请愿 · 准规制',C.gold],['隐蔽直接行动','匿名委员会 · 遮字通信\n威胁信 · 夜间小队\n定点毁架 · 行动纪律',C.rust]],250,300);foot(s,'谁代表工人？协议能约束多少雇主？')}
// 7 Rawfolds
{const s=slide();await img(s,`${ASSET}/power-loom-small.jpg`,0,0,1280,720);rect(s,0,0,1280,720,{color:C.coal,transparency:16000});tx(s,'RAWFOLDS',860,440,330,80,42,'#6B3023',true,'right','Georgia');tx(s,'约克郡西区 · RAWFOLDS',64,42,650,30,17,C.rust,true);tx(s,'生产空间已经设防',64,92,900,70,52,C.white,true);cards(s,[['地方行动能力','誓约 · 夺枪 · 队列\n骑马警戒 · 夜袭\n社区沉默',C.gold],['设防生产能力','加固门窗 · 厂卫 · 驻军\n情报 · 悬赏 · 追诉',C.rust]],245,300);foot(s,'1812 年 4 月：攻击者未能破门，资本与国家的军事优势显现。')}
// 8 court
{const s=slide();head(s,'约克特别巡回法庭 · 1813','国家可以把一个共同危机拆成个体罪名',8);cards(s,[['谋杀','把政治升级重构为普通刑事暴力。'],['抢劫／入室','把筹枪与准备拆成财产犯罪。'],['暴动拆毁','把共同目标还原为个体行为。'],['非法宣誓','直接打击秘密纪律与联系。']],250,270);tx(s,'66 名被告 · 18 人获资本刑 · 17 人被处决',64,580,1120,40,23,C.pale,true);foot(s,'并非“17 名砸机者因同一罪名被绞死”。')}
// 9 Lancashire
{const s=slide('#171510');head(s,'兰开夏','机器、面包、工资与政治改革\n没有整齐合成一种诉求',9);cards(s,[['群众扩张','动力织机、工资、失业、粮价、战争和政治改革相互叠加。',C.cyan],['内部排除','一些男性工人要求解雇女性；“合法工人”的边界本身成为斗争。',C.rust],['国家分案','大规模人群被拆解为在场、破窗、取燃料与纵火等责任。',C.gold]],245,310);foot(s,'共同规范能提供团结，也能规定谁不属于“我们”。')}
// 10 conversions
{const s=slide();head(s,'力量转换','卢德派不是没有组织；他们没有完成四次转换',10);convert(s,[['地方信任与行业知识','跨地域、跨行业协调'],['秘密纪律与行动安全','公开授权与内部问责'],['破坏性杠杆','财政、记忆与持续谈判'],['对个别雇主施压','改造法律、制度与国家']]);foot(s,'这是比较历史的推论，不是“缺少先锋队”的反事实判决。')}
// 11 state
{const s=slide();head(s,'国家不是外部裁判','技术变化由所有权、强制与分类共同建构',11);cards(s,[['生产','谁拥有机器、订单、工厂和投资决定权？',C.gold],['强制','谁可以设防、驻军、悬赏、监视和保护证人？',C.rust],['分类','谁能把危机拆成毁机、抢劫、宣誓和谋杀？',C.cyan]],255,285);foot(s,'局部胜利若不能进入法律与国家尺度，随时可能被抵消。')}
// 12 historiography
{const s=slide();head(s,'史学争论','理论不是四副互补眼镜',12);table(s,[['霍布斯鲍姆','以骚乱进行集体谈判','压低共同体规范与政治想象'],['汤普森','经验、斗争与阶级形成','可能读出过于完整的全国故事'],['托米斯等','行业、地区与目标差异','可能把政治化缩回行业纠纷'],['兰德尔／纳维卡斯','抗争连续体；神话组织行动','象征统一不等于实体统一']],220);foot(s,'运动为什么有力、又为什么不足，正来自这些解释的内在张力。')}
// 13 organization matrix
{const s=slide();head(s,'砸机器之后','每一种扩大力量的形式，也会制造新的代表关系',13);table(s,[['秘密结社','信任、保密、直接行动','地区隔绝、财政与问责'],['工会','保存经验、持续谈判','行业主义、排除、官僚化'],['群众罢工／委员会','直接参与，重接经济与政治','依赖危机，难长期再生产'],['群众政党','全国聚合、教育与国家入口','选票逻辑、代表独立化'],['先锋队','镇压下连续性与战略集中','解释权垄断、党替代群众']],205);foot(s,'没有一种形式自动提供杠杆、持续、战略、代表、国家改造和民主。')}
// 14 Marx/Kautsky
{const s=slide();head(s,'马克思—考茨基','局部斗争必须积累；中介却不会自动顺畅连接',14);cards(s,[['自我解放','共同处境只有经过交往、斗争与组织，才形成政治主体。\n\n组织不能代替工人自己行动。',C.gold],['规模与持续性','会费、报刊、教育、纲领与群众政党，让地方力量进入国家尺度。\n\n也可能重画“谁是工人”。',C.rust]],250,310);foot(s,'自我行动与政治代表，是必须同时处理的张力。')}
// 15 Luxemburg/Lenin
{const s=slide();head(s,'卢森堡—列宁','群众行动怎样获得战略，而不被战略替代？',15);cards(s,[['群众罢工','经济与政治相互转化。组织既是行动前提，也是行动结果。\n\n领导不能从外部制造群众运动。',C.gold],['战略组织','高压环境需要连续性、全国协调、保密与国家视野。\n\n党可能垄断“正确解释”。',C.rust]],250,310);foot(s,'真正的问题不是“自发还是组织”，而是二者怎样相互生产。')}
// 16 Petrograd + representation
{const s=slide();head(s,'彼得格勒与代表问题','夺权、国有化和劳动者控制生产不是同一件事',16);cards(s,[['夺取国家','谁掌握强制、法律与总体政治方向？',C.gold],['改变所有权','国有化改变财产关系，却不自动规定劳动过程。',C.rust],['劳动者控制生产','工厂委员会权力没有因国有化自动保存。',C.cyan]],250,280);foot(s,'代表使群体公共存在，也可能垄断群体定义。')}
// 17 paradox
{const s=slide();tx(s,'组织的悖论',64,62,500,30,18,C.rust,true);tx(s,'没有组织，地方抵抗容易被隔离。',64,170,1120,80,48,C.white,true);tx(s,'没有群众问责，组织可能从\n形成阶级滑向替代阶级。',64,330,1120,145,46,C.gold,true);foot(s,'组织是必要的，但不是无辜的。')}
// 18 AI
{const s=slide('#123442');await img(s,`${ASSET}/programmer-small.jpg`,0,0,500,720);rect(s,0,0,465,720,'#123442');tx(s,'AI',100,245,260,120,82,C.cyan,true,'center','Georgia');rect(s,465,0,815,720,C.ai);tx(s,'回到 AI',550,64,500,28,18,C.cyan,true);tx(s,'问题不是要不要砸，\n而是谁能组织技术方向',550,135,650,150,50,C.white,true);tx(s,'这是一条由算力、数据、资本、平台、劳动分工\n和国家政策构成的制度链。',550,370,600,120,25,'#B8D5DF');foot(s,'个人态度不能替代工作场所、行业、社会联盟与国家尺度的政治。')}
// 19 scales
{const s=slide(C.ai);head(s,'AI 的四个尺度','不同组织形式不是同一尺度上的替代选项',19);table(s,[['工作场所','部署、考核、裁员与强度','工会、职工委员会与否决权'],['行业／职业','标准、署名、责任与作品','行业工会、专业协会与跨企业协议'],['社会联盟','教育、公共服务与信息秩序','社会运动、用户组织与跨群体联盟'],['国家／跨国','劳动法、知识产权、采购与福利','政党纲领、立法、监管与国际协调']],220);foot(s,'工作场所抵抗不足以单独决定技术长期方向。')}
// 20 questions
{const s=slide(C.ai);head(s,'比“支持／反对 AI”更具体','技术政治必须回答四个权力问题',20);cards(s,[['谁拥有否决权','部署前能否取得信息、协商并拒绝危险用途？',C.cyan],['谁承担成本','生产率收益成为缩短工时，还是裁员与劳动强化？',C.rust],['谁能跨职业协调','高技能拒绝怎样连接外包、平台劳动者与公共用户？',C.gold],['谁决定长期方向','技术是否进入所有权、劳动法、采购、税收与产业政策？',C.cyan]],245,315);foot(s,'AI 时代的阶级形成，是把分散劳动位置组合成共同纲领。')}
// 21 conclusions
{const s=slide();head(s,'四个明确结论','文化说明为什么反抗；组织、联盟与国家战略决定可能怎样取胜',21);convert(s,[['没有持久组织','地方反抗容易被隔离、镇压、收编或遗忘'],['没有群众问责','组织可能从形成阶级滑向替代阶级'],['没有国家战略','工作场所抵抗不足以决定技术长期方向'],['没有具体劳动知识','理论会制造抽象主体并覆盖真实劳动者']]);foot(s,'群众自治与问责，决定胜利是否仍属于劳动者自己。')}
// 22 ending
{const s=slide();tx(s,'砸机器之后',64,62,500,30,18,C.rust,true);tx(s,'能否建立一种政治：',64,170,1100,65,46,C.white,true);tx(s,'既有能力中断不公正的技术秩序，',64,290,1120,70,45,C.rust,true);tx(s,'也有能力共同治理替代它的制度？',64,410,1120,70,45,C.cyan,true);foot(s,'卢德运动的力量、失败与劳动政治')}

await fs.mkdir(QA,{recursive:true});
for(const [i,s] of deck.slides.items.entries()){
  const stem=`slide-${String(i+1).padStart(2,'0')}`;
  const p=await deck.export({slide:s,format:'png',scale:.5});await fs.writeFile(`${QA}/${stem}.png`,new Uint8Array(await p.arrayBuffer()));
  const l=await s.export({format:'layout'});await fs.writeFile(`${QA}/${stem}.layout.json`,await l.text());
}
const m=await deck.export({format:'webp',montage:true,scale:1});await fs.writeFile(`${QA}/montage.webp`,new Uint8Array(await m.arrayBuffer()));
const pptx=await PresentationFile.exportPptx(deck);await pptx.save(OUT);
console.log(`saved ${OUT} (${deck.slides.items.length} slides)`);
