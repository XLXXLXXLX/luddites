import fs from 'node:fs/promises';
const ART='file:///C:/Users/xlx/AppData/Local/Temp/codex-presentations/manual-after-machines/tmp/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const {Presentation,PresentationFile}=await import(ART);
const R='C:/Users/xlx/Documents/antigravity/luddites-quartz',A=R+'/quartz/static/slides/assets/after-machines',L=R+'/quartz/static/slides/assets/luddism-ai';
const OUT=R+'/outputs/砸机器之后_卢德运动的力量、失败与劳动政治_重构版.pptx',QA=process.env.AFTER_MACHINES_QA_DIR||R+'/.tmp/after-machines-rebuild';
const C={coal:'#11110F',paper:'#EEE3C8',pale:'#CDBF9F',ink:'#191713',rust:'#B94A31',red:'#792C20',gold:'#D3AA47',cyan:'#79D6FF',ai:'#071116',muted:'#A7A18F',line:'#4D493E',white:'#F7F2E8',blue:'#B9D4DD',beige:'#E8DDBF'};
const deck=Presentation.create({slideSize:{width:1280,height:720}});
function rect(s,x,y,w,h,fill='none',stroke='none',width=0){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width}})}
function tx(s,v,x,y,w,h,size=24,color=C.white,bold=false,align='left',font='Microsoft YaHei'){const o=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{style:'solid',fill:'none',width:0}});o.text=v;o.text.style={fontSize:size,color,bold,alignment:align,fontFamily:font};return o}
function base(bg=C.coal,light=false){const s=deck.slides.add();s.background.fill=bg;for(let x=42;x<1280;x+=48)rect(s,x,0,1,720,light?'#D2C4A4':'#1E211F');rect(s,42,24,2,672,light?C.rust:'#713121');return s}
function head(s,k,t,n,light=false){tx(s,k,66,35,850,25,15,light?C.red:C.rust,true);tx(s,t,66,74,1120,112,42,light?C.ink:C.white,true);tx(s,String(n).padStart(2,'0'),1160,35,54,25,18,light?'#8A7F68':'#6D685D',false,'right','Georgia')}
function foot(s,v,light=false){rect(s,66,676,1148,1,light?'#9E927B':C.line);tx(s,v,66,684,1148,18,10.5,light?'#726957':'#77766E')}
function band(s,v,color=C.rust,light=false){rect(s,66,606,1148,54,light?'#D7C9A9':'#171612');rect(s,66,606,6,54,color);tx(s,v,88,618,1090,28,19,light?C.ink:C.paper,true)}
async function image(s,path,x,y,w,h,alt){const b=await fs.readFile(path),e=path.toLowerCase().split('.').pop();return s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:e==='png'?'image/png':'image/jpeg',alt,fit:'cover',position:{left:x,top:y,width:w,height:h}})}
function cols(s,items,y=225,h=330,light=false){const gap=28,w=(1148-gap*(items.length-1))/items.length;items.forEach((a,i)=>{const x=66+i*(w+gap);rect(s,x,y,w,4,a[2]||C.rust);tx(s,a[0],x,y+22,w-8,60,24,light?C.ink:C.white,true);tx(s,a[1],x,y+92,w-8,h-98,18.5,light?'#574F40':C.pale)})}
function rows(s,items,y=205,light=false,label=200){items.forEach((a,i)=>{const yy=y+i*72;rect(s,66,yy,1148,1,light?'#978B73':C.line);tx(s,a[0],66,yy+15,label-18,44,20,light?C.red:C.gold,true);tx(s,a[1],66+label,yy+14,1148-label,49,19,light?C.ink:C.pale)})}
function sideRows(s,items,x,y,w,light=false,label=145){items.forEach((a,i)=>{const yy=y+i*86;rect(s,x,yy,w,1,light?'#978B73':C.line);tx(s,a[0],x,yy+15,label-12,56,18.5,light?C.red:C.gold,true);tx(s,a[1],x+label,yy+14,w-label,62,17.5,light?C.ink:C.pale)})}
function steps(s,items,y=225,light=false){const gap=18,w=(1148-gap*(items.length-1))/items.length;items.forEach((a,i)=>{const x=66+i*(w+gap);tx(s,String(i+1).padStart(2,'0'),x,y,w,31,19,light?C.red:C.cyan,true,'left','Georgia');rect(s,x,y+37,w,3,light?C.red:C.cyan);tx(s,a[0],x,y+56,w,52,21,light?C.ink:C.white,true);tx(s,a[1],x,y+118,w,142,17,light?'#574F40':C.blue);if(i<items.length-1)tx(s,'→',x+w+2,y+75,16,25,16,light?C.red:C.cyan,true,'center')})}
function placeholder(s,x,y,w,h){rect(s,x,y,w,h,'#181714',C.rust,2);rect(s,x+18,y+18,w-36,h-36,'none','#5D3B31',1);tx(s,'受版权限制图像占位',x+30,y+48,w-60,42,16,C.rust,true);tx(s,'Rawfolds Mill 夜袭 / 设防磨坊',x+30,y+105,w-60,74,25,C.white,true);tx(s,'建议 4:3 历史版画或遗址图；突出高墙、门窗、攻击者与防守者。',x+30,y+205,w-60,100,16,C.pale)}
function section(n,title,sub,bg=C.coal){const s=base(bg);tx(s,String(n).padStart(2,'0'),955,92,260,230,175,bg===C.ai?'#102630':'#22211D',true,'right','Georgia');tx(s,title,66,220,1000,100,56,C.white,true);tx(s,sub,66,365,1040,82,25,bg===C.ai?C.blue:C.pale);foot(s,'生产档案 · 经线从织物转化为数据流');}
function make(n,k,t,items,opt={}){const light=!!opt.light,s=base(opt.bg||(light?C.beige:C.coal),light);head(s,k,t,n,light);if(opt.image){image(s,opt.image,66,205,430,365,opt.alt||t);cols(s,items,535,330,light)}else if(opt.rows)rows(s,items,opt.y||205,light,opt.label||200);else if(opt.steps)steps(s,items,opt.y||225,light);else cols(s,items,opt.y||225,opt.h||330,light);if(opt.band)band(s,opt.band,opt.accent||(light?C.red:C.rust),light);foot(s,opt.source||'讲稿正文与附录材料卡；页面标题可独立复原论证。',light);return s}

// 01
{const s=base();await image(s,A+'/luddite-small.jpg',790,0,490,720,'1812 年卢德派领袖版画');rect(s,0,0,835,720,C.coal);tx(s,'1811—1813 · 劳动、机器与政治',66,67,670,25,16,C.rust,true);tx(s,'砸机器之后',66,148,650,88,67,C.white,true);tx(s,'卢德运动的力量、失败\n与劳动政治',66,265,670,100,32,C.paper,true);tx(s,'从三地劳动制度，到 AI 部署中的调查、杠杆与制度条款',66,420,650,76,22,C.pale);foot(s,'图：The Leader of the Luddites（1812），公共领域。');}
// 02
{const s=base(C.beige,true);head(s,'先把人放回历史','1811 年的英国：战争、粮价与多种生产方式同时存在',2,true);await image(s,A+'/england-wales-map-public-domain.jpg',780,190,434,410,'英格兰与威尔士地图');rows(s,[['战争','拿破仑战争、贸易受阻与高粮价加重生计压力。'],['生产','家庭作坊、转包网络与集中工厂同时存在。'],['冲突','工价、技能、产品质量和机器用途一起成为争议。'],['参与者','框架针织工、剪绒工、手织工、棉纺工及社区支持者。']],205,true,138);foot(s,'地图：A. J. Johnson, England and Wales（1867），公共领域。',true);}
// 03
make(3,'基本事件线','从诺丁汉毁架，到驻军、特别审判与公开处决',[['1811 秋','诺丁汉郡毁坏针织机架。'],['1812 春','约克郡袭击设防磨坊；兰开夏发生冲突。'],['1812','议会扩大刑罚；军队、密探与悬赏进入工业区。'],['1813','约克特别巡回法庭审判、处决与流放。']],{light:true,steps:true,band:'先理解运动怎样发生，再问“为什么机器成为目标”。'});
// 04
{const s=base(C.beige,true);head(s,'参与者与行动','这不是一群人拿着锤子的单一场景',4,true);await image(s,A+'/shearing-machine-public-domain.jpg',66,207,430,365,'剪绒机器剖面');sideRows(s,[['公开行动','会议、请愿、行业调查、工价谈判与代表选举。'],['隐蔽行动','暗号、誓约、匿名通信、筹款、夺枪与夜袭。'],['共同目标','对雇主施压，也争夺谁有权规定生产规则。']],535,215,679,true,140);foot(s,'图：剪绒机技术图（1914），公共领域。',true);}
// 05
{const s=base(C.beige,true);head(s,'三个工业地区','同一个名字下面，是三套劳动制度与三种政治能力',5,true);await image(s,A+'/england-wales-map-public-domain.jpg',66,190,470,430,'英格兰与威尔士地图');rows(s,[['诺丁汉','框架针织：争工价、产品规则与行业代表。'],['约克郡','熟练剪绒：秘密纪律、武装行动与设防生产。'],['兰开夏','手织与棉纺：机器、工资、粮价、改革交错。']],230,true,145);foot(s,'地理位置为示意；重点是三套劳动制度。',true);}
// 06
{const s=base(C.beige,true);head(s,'核心问题由此出现','机器正在重新分配工资、技能、风险与决定权',6,true);await image(s,A+'/power-loom-small.jpg',720,185,494,385,'早期动力织机');rows(s,[['工资','效率收益进入工价，还是成为压价依据？'],['技能','机器替代技能，还是把技能转移给校对与照管？'],['风险','失业、事故、错误与波动由谁承担？'],['权威','谁可以改变任务、产品标准与劳动纪律？']],210,true,125);band(s,'机器成为目标，因为它是生产权力的可见节点。',C.red,true);foot(s,'图：早期动力织机，开放馆藏图像。',true);}
section(1,'三种劳动制度，三种卢德主义','差异不是背景；差异决定行动能力，也决定失败方式。');
// 08-16
make(8,'地区比较','三地不是同一运动的三个舞台',[['诺丁汉','家庭作坊与框架针织\n行业治理与代表政治\n失败：协议难覆盖全部雇主',C.gold],['约克郡','熟练剪绒与集中磨坊\n秘密纪律与武装强制\n失败：设防、军力与司法',C.rust],['兰开夏','手织、棉纺与城市群众\n议题扩张与群众政治\n失败：联盟异质与内部排除',C.cyan]]);
make(9,'诺丁汉 · 劳动制度','机器按它怎样重组生产，而不是按“新／旧”被选择',[['工价','低价生产的机架成为目标；毁架迫使袜商重回谈判。'],['产品','宽幅织物裁剪缝合引发质量、价格与规则争论。'],['资格','技能保护也是排除新人和女性的边界。'],['支付','实物工资、机架租金与转包共同塑造依附。']],{rows:true,label:145});
make(10,'诺丁汉 · 行动组合','毁机不是谈判的反面，而是让协议具有约束力的手段',[['公开代表政治','会议广告、具名秘书、行业调查、工价谈判、议会请愿。',C.gold],['隐蔽直接行动','匿名委员会、遮字通信、威胁信、夜间小队、定点毁架。',C.rust]],{band:'政治能力：把分散作坊的劳动知识转译成行业规则。',accent:C.gold});
make(11,'诺丁汉 · 代表试验','106 名代表已经在尝试一种准行业治理',[['调查','收集工价、产品与雇佣做法。'],['代表','地区与行业代表形成共同说法。'],['谈判','把标准施加给袜商与承包网络。'],['约束','以纪律和毁架威胁执行协议。']],{steps:true,band:'局限：代表网络、财政和执行范围仍高度地方化。'});
{const s=base('#100F0E');head(s,'约克郡西区 · Rawfolds','工厂已成为资本、厂卫与国家军力共同构成的设防空间',12);placeholder(s,690,190,524,395);rows(s,[['劳动制度','熟练剪绒工面对集中生产和剪绒机械。'],['行动组合','誓约、夺枪、队列、警戒、夜袭与沉默。'],['失败方式','加固门窗、厂卫、驻军、情报、悬赏与追诉。']],230,false,150);foot(s,'1812 年 4 月袭击未能破门；关键是能力不对称。');}
make(13,'约克特别巡回法庭 · 1813','国家不必驳倒一个运动；它可以把运动拆成个体罪名',[['谋杀','把政治升级重构为普通刑事暴力。'],['抢劫／入室','把筹枪与准备拆成财产犯罪。'],['暴动拆毁','把共同目标还原为个体行为。'],['非法宣誓','直接打击秘密纪律与联系。']],{band:'66 名被告；18 人获资本刑；17 人被处决。'});
{const s=base('#171510');head(s,'兰开夏 · 异质群众政治','机器、面包、工资与政治改革没有整齐合成一种诉求',14);await image(s,A+'/cotton-mill-1837-public-domain.jpg',66,205,465,380,'1837 年棉纺厂');sideRows(s,[['参与者','手织工、棉纺工、工厂劳动者、妇女、青年与城市贫民。'],['诉求叠加','动力织机、失业、工资、粮价、战争与政治改革互相放大。'],['政治能力','规模扩大，却更难形成稳定、可问责的共同纲领。']],550,220,664,false,130);foot(s,'图：Barton Hill Cotton Mill（1837），公共领域。');}
make(15,'共同规范也会排除','劳动抵抗可以反对资本，同时排斥另一群劳动者',[['内部边界','一些男性工人把“保卫劳动”表达为解雇女性劳动者。',C.rust],['分析要求','任何“道德经济”都要问：谁被承认为合法劳动者？',C.gold]],{band:'共同体不是天然民主的。'});
make(16,'三地小结','不同、且无法自动合并的能力',[['地方知识','诺丁汉能辨认工价、产品、资格和支付规则。'],['秘密纪律','约克郡能在镇压下动员，却难获得公开授权。'],['群众扩张','兰开夏能扩大议题，也放大联盟与排除问题。'],['共同局限','地方胜利难保存为跨地区制度与国家约束。']],{rows:true,label:160});
// 17-20
section(2,'四次力量转换','卢德派不是没有组织；难题是力量怎样保存、扩大并受约束。');
make(18,'转换一至四','每次转换都需要新制度，也会产生新权力',[['地方知识 → 共同纲领','行业细节进入跨地区协调，又不被抽象口号抹平。'],['秘密纪律 → 公开授权','行动安全连接代表范围、批准、撤换和信息回流。'],['扰乱杠杆 → 持久制度','短期让步保存为财政、记忆、谈判和可执行条款。'],['工作场所 → 国家政治','地方要求进入法律与政策，仍受基层反向约束。']],{rows:true,label:245});
make(19,'国家不是外部裁判','技术变化由所有权、强制与分类共同建构',[['所有权','谁拥有机器、订单、工厂、数据与投资决定权？',C.gold],['强制','谁能设防、驻军、监视、悬赏并保护证人？',C.rust],['分类','谁能把危机拆成毁机、抢劫、宣誓与谋杀？',C.cyan]],{band:'局部胜利若不能约束国家尺度，就会被法律与市场抵消。'});
make(20,'史学争论','谈判工具、阶级形成，还是地方行业斗争？',[['霍布斯鲍姆','“集体谈判”揭示毁机的工具性；可能压低共同体规范。'],['汤普森','阶级在经验与斗争中形成；可能读出过于完整的全国故事。'],['托米斯等','行业、地区与目标差异是核心；也可能缩回行业纠纷。'],['兰德尔／纳维卡斯','抗争连续体与神话组织行动；象征统一不等于实体统一。']],{rows:true,label:205});
// 21-31
section(3,'后来形式不只是替代毁机','它们分别解决持续、规模、战略、代表与国家入口，也制造新风险。');
make(22,'没有线性进化','秘密结社、停工、请愿、群众平台与政党长期并存',[['1810s','秘密网络与行业请愿。'],['1819','Peterloo：群众集会与国家镇压。'],['1820s–30s','工会、停工与跨行业组织实验。'],['1838–48','宪章运动：全国请愿、报刊与平台。'],['其后','群众政党与先锋队争论。']],{steps:true});
make(23,'组织问题矩阵','每一种扩大力量的形式，也会制造新的代表关系',[['秘密结社','保密与行动｜风险：地区隔绝、财政与问责。'],['工会','保存经验与谈判｜风险：行业主义、排除、官僚化。'],['群众罢工／委员会','直接参与｜风险：难长期再生产。'],['群众政党','全国聚合与国家入口｜风险：代表独立化。'],['先锋队','连续性与战略集中｜风险：解释权垄断。']],{rows:true,label:245,y:185});
make(24,'难题一：地方知识怎样扩大','马克思—考茨基的张力不是“自发／组织”二选一',[['自我解放','共同处境经过交往、斗争与组织才形成主体；组织不能代替工人行动。',C.gold],['规模与持续','会费、报刊、教育、纲领和政党让地方力量进入国家尺度；也可能重画谁是工人。',C.rust]]);
make(25,'难题二：秘密行动怎样获得授权','群众行动需要战略，但战略不能替代群众',[['群众罢工','经济与政治斗争相互转化；组织既是前提，也是结果。',C.gold],['战略组织','高压环境需要连续性、协调、保密与国家视野；也可能垄断正确解释。',C.rust]],{band:'公开授权范围、批准程序、信息回流、否决与撤换。',accent:C.cyan});
make(26,'难题三：扰乱怎样保存为制度','夺取国家、改变所有权与劳动者控制生产不是一件事',[['夺取国家','谁掌握强制、法律与总体政治方向？',C.gold],['改变所有权','国有化改变财产关系，却不自动规定劳动过程。',C.rust],['劳动者控制生产','工厂委员会权力不会因国有化自动保存。',C.cyan]]);
make(27,'难题四：工作场所怎样进入国家政治','组织通过联盟、分类与代表制造阶级',[['分散劳动者','行业、性别、技能、地区和身份并不天然统一。',C.gold],['名称与纲领','使群体公共存在，也可能垄断共同利益的定义。',C.rust],['社会领导','文化连接制度与国家战略；战略必须受基层约束。',C.cyan]]);
{const s=base('#161411');head(s,'群众政治的历史实验','Peterloo 展示公共集会的规模，也展示国家如何回应',28);await image(s,A+'/peterloo-public-domain.png',610,178,604,420,'彼得卢屠杀版画');rows(s,[['解决了什么','把地方不满变成可见的群众政治与改革要求。'],['产生什么','现场代表、报刊叙事与全国舆论成为新中介。'],['没有解决','国家强制仍能以秩序名义打断和平集会。']],220,false,155);foot(s,'图：Peterloo Massacre，Richard Carlile（1819），公共领域。');}
{const s=base('#171510');head(s,'群众请愿与全国平台','宪章运动把请愿、报刊、地方协会与集会连接起来',29);await image(s,A+'/chartist-meeting-public-domain.jpg',610,180,604,418,'肯宁顿公地宪章派集会');rows(s,[['能力','全国纲领、政治教育、重复动员与国家入口。'],['张力','签名、代表与讲坛让群众可见，也可能压缩地方差异。'],['遗产','失败不等于无效；组织技术进入后来的工会与政党。']],220,false,155);foot(s,'图：Chartist Meeting, Kennington Common（1848），公共领域。');}
make(30,'政党与先锋队','连续性和战略集中是真问题；替代群众也是真风险',[['群众政党','全国聚合、教育、联盟与国家入口。\n风险：选票逻辑、职业代表与基层被动化。',C.gold],['先锋队','镇压下的连续性、保密、集中资源与国家视野。\n风险：解释权垄断、党替代群众机构。',C.rust]]);
{const s=base();head(s,'组织的悖论','问题不是“要不要组织”，而是力量怎样扩大且仍可被纠正',31);tx(s,'没有组织，地方抵抗容易被隔离。\n\n没有群众问责，组织可能从形成阶级\n滑向替代阶级。',66,220,1100,270,40,C.white,true);band(s,'把问责写进组织结构，而不是留作善意承诺。',C.gold);foot(s,'从历史实验进入当代技术冲突。');}
// 32-40
section(4,'回到 AI','AI 不是卢德机器的重演；它是一条跨越数据、算力、劳动过程与国家的制度链。',C.ai);
make(33,'AI 不是一台机器','先把“AI”拆成一条劳动链',[['算力能源','芯片、数据中心与基础设施。'],['数据作品','授权、公共信息与行为数据。'],['研究与隐形劳动','模型人员、标注、审核、外包。'],['部署管理','任务、定额、裁员、评价、责任。'],['国家','采购、劳动法、知识产权与产业政策。']],{steps:true,bg:C.ai});
{const s=base(C.ai);head(s,'四个行动尺度','个人拒用、员工拒绝、集体谈判与国家政策不是替代选项',34);await image(s,A+'/programmer-small.jpg',775,185,439,390,'程序员工作场景');sideRows(s,[['工作场所','部署、考核、裁员、强度｜协商、谈判、暂停。'],['行业／职业','标准、署名、责任、作品｜行业协议与专业组织。'],['社会联盟','公共服务、歧视、信息秩序｜用户与跨群体联盟。'],['国家／跨国','劳动法、采购、福利、产业政策｜立法与监管。']],66,200,670,false,150);foot(s,'图：现代软件劳动场景，开放图库素材。');}
make(35,'四个权力问题','比“支持／反对 AI”更具体',[['谁知情并能叫停','部署前能否取得信息、协商并拒绝危险用途？',C.cyan],['谁承担成本','收益变成缩短工时，还是裁员与劳动强化？',C.rust],['谁能跨职业协调','高技能拒绝怎样连接外包、辅助劳动与公共用户？',C.gold],['谁决定长期方向','要求能否进入劳动法、采购、福利与产业政策？',C.cyan]],{bg:C.ai});
{const s=base(C.ai);head(s,'从一次普通部署冲突开始','系统明天上线：先把“效率承诺”拆成劳动变化',36);await image(s,L+'/punch-clock.jpg',66,205,430,375,'工时与考核装置');tx(s,'机构宣布用生成式 AI 制作初稿、分配任务、评价绩效，并据此调整人员。',550,210,635,80,24,C.white,true);sideRows(s,[['数据','怎样收集、训练、留存与外供？'],['责任','错误、合规与申诉由谁承担？'],['岗位','减少任务，还是增加校对与隐形劳动？'],['时间','节省时间归劳动者，还是变成新定额？']],550,312,664,false,92);foot(s,'此时“支持／反对 AI”还不能形成共同要求。');}
make(37,'行动阶梯 01','调查劳动过程：形成一张劳动影响图',[['任务变化','哪些步骤自动化，哪些只是转移给人校对？',C.cyan],['数据与知识','谁提供训练材料、经验与隐性知识？',C.cyan],['风险承担','错误、合规、情绪劳动和岗位风险落到谁？',C.cyan],['决定节点','谁批准、谁复核，哪里可以暂停部署？',C.cyan]],{bg:C.ai,band:'产出一：任务、决定者、数据、受影响人群、风险与可暂停节点。',accent:C.cyan});
make(38,'行动阶梯 02—03','共同要求必须和现实杠杆一起形成',[['最低共同要求','部署前披露与协商；不得仅凭系统处分或裁员；人工复核与申诉；收益进入工资、工时、培训谈判。',C.cyan],['杠杆清单','数据与材料、专业签字、校对责任、流程接入、用户信任、公共声誉；写明风险与升级条件。',C.gold]],{bg:C.ai,band:'产出二：最低共同要求　｜　产出三：杠杆清单',accent:C.cyan});
make(39,'行动阶梯 04—06','把局部胜利固定、扩展，并约束代表者',[['稳定制度','书面条款、民选技术委员会、独立评估、暂停权、申诉与定期复议。',C.cyan],['跨出机构','条款推进到行业协议、专业标准、公共采购与劳动法规。',C.gold],['代表问责','公开授权；基层保留信息、替代方案、否决、撤换与少数表达。',C.rust]],{bg:C.ai,band:'产出四：制度条款草案；不声称存在统一路线。',accent:C.cyan});
{const s=base('#0B1113');head(s,'判断进展的五种能力','技术是否成为受其影响者能够共同决定的对象？',40);steps(s,[['知情调查','理解任务、评价、数据与责任变化。'],['协商叫停','能谈判、修改、暂停或拒绝部署。'],['成本收益','决定工时、工资、风险与培训安排。'],['跨职业协调','连接专业、外包、辅助与服务对象。'],['代表问责','取得信息、否决、撤换与纠错。']],215);band(s,'从个人态度到共同调查，从一次行动到可复议制度。',C.cyan);foot(s,'史料：英国国家档案馆、Hansard；图像：Wikimedia 公共领域；研究清单见讲稿附录。');}

await fs.mkdir(QA,{recursive:true});
for(const [i,s] of deck.slides.items.entries()){const stem='slide-'+String(i+1).padStart(2,'0'),p=await deck.export({slide:s,format:'png',scale:.5});await fs.writeFile(QA+'/'+stem+'.png',new Uint8Array(await p.arrayBuffer()));const l=await s.export({format:'layout'});await fs.writeFile(QA+'/'+stem+'.layout.json',await l.text())}
const montage=await deck.export({format:'webp',montage:true,scale:1});await fs.writeFile(QA+'/montage.webp',new Uint8Array(await montage.arrayBuffer()));
await fs.mkdir(R+'/outputs',{recursive:true});const pptx=await PresentationFile.exportPptx(deck);await pptx.save(OUT);console.log('saved '+OUT+' ('+deck.slides.items.length+' slides)');
