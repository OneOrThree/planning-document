/* 기존 /diagram 오프라인 번들로 원본·벡터·이미지·편집본을 재생성한다. */
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const browse=process.env.GSTACK_BROWSE;
if(!browse)throw new Error('다이어그램 재생성에는 GSTACK_BROWSE에 gstack browse 실행 파일 경로가 필요합니다. 배포·일반 검증에는 필요하지 않습니다.');
let tab=process.argv[2];
if(tab&&!/^\d+$/.test(tab))throw new Error('사용법: node render-user-journey.cjs [전용 탭 ID]');
const invoke=(...args)=>execFileSync(browse,args,{cwd:__dirname,encoding:'utf8',timeout:60000,maxBuffer:32*1024*1024}).trim();
const ownTab=!tab;
if(ownTab){
  const bundle=path.resolve(path.dirname(browse),'../../lib/diagram-render/dist/diagram-render.html');
  const data=fs.readFileSync(bundle);
  const digest=createHash('sha256').update(data).digest('hex').slice(0,16);
  const staged=path.join(os.tmpdir(),`gstack-diagram-render-${digest}.html`);
  if(!fs.existsSync(staged)||createHash('sha256').update(fs.readFileSync(staged)).digest('hex').slice(0,16)!==digest)fs.copyFileSync(bundle,staged);
  tab=String(JSON.parse(invoke('newtab','--json')).tabId);
  console.log(invoke('load-html',staged,'--tab-id',tab));
  console.log(invoke('wait','#done','--tab-id',tab));
}
// 의미와 연결은 Mermaid에서 읽고, 배치는 고정 그리드로 다듬는다.
// 자동 배치의 역방향 연결이 행 정렬을 무너뜨리지 않도록 좌표를 명시한다.
const layouts={
  'gachisup-user-journey':{
    size:[244,144],
    nodes:[[0,0],[288,0],[576,0],[864,0],[1152,0]],
    colors:['entry','shared','shared','shared','rest'],
    edges:[
      {p:[[244,72],[288,72]]},
      {p:[[532,72],[576,72]]},
      {p:[[820,72],[864,72]]},
      {p:[[1108,72],[1152,72]]},
      {p:[[1274,144],[1274,222],[410,222],[410,144]],label:[842,244],dashed:true}
    ]
  },
  'gachisup-participation-flow':{
    size:[280,96],
    nodes:[[0,0],[410,0],[820,0],[410,170],[410,340],[410,525],[820,525],[410,710],[410,895]],
    colors:['entry','entry','entry','entry','shared','shared','rest','shared','shared'],
    edges:[
      {p:[[140,96],[140,218],[410,218]]},
      {p:[[550,96],[550,170]]},
      {p:[[960,96],[960,375],[690,375]]},
      {p:[[550,266],[550,340]],label:[613,303]},
      {p:[[550,436],[550,525]]},
      {p:[[550,621],[550,710]],label:[602,666]},
      {p:[[550,806],[550,895]]},
      {p:[[410,943],[280,943],[280,388],[410,388]],label:[212,664],dashed:true},
      {p:[[690,573],[820,573]],label:[755,551],dashed:true},
      {p:[[1100,573],[1170,573],[1170,416],[690,416]],label:[914,438],dashed:true}
    ]
  }
};
function normalizeScene(scene,source,layout){
  const labels=[...source.matchAll(/^\s*\w+\["(.*?)"\]/gm)].map(m=>m[1].replace(/<br\s*\/?\s*>/gi,'\n'));
  const nodes=scene.elements.filter(e=>e.type==='rectangle');
  const arrows=scene.elements.filter(e=>e.type==='arrow');
  if(nodes.length!==layout.nodes.length||arrows.length!==layout.edges.length||labels.length!==nodes.length)throw new Error('Mermaid와 배치의 노드·연결 수가 다릅니다.');
  const palette={entry:['#F5F8F7','#9BAEAA','#243D40'],shared:['#E4F0EB','#527E70','#1F493C'],rest:['#F4EEE2','#A3916D','#564831']};
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d');
  const setText=(e,text,cx,cy,fontSize,color)=>{
    Object.assign(e,{text,originalText:text,fontFamily:2,fontSize,lineHeight:1.5,autoResize:true,strokeColor:color,textAlign:'center',verticalAlign:'middle'});
    ctx.font=`${fontSize}px Helvetica, "Apple SD Gothic Neo", sans-serif`;
    e.width=Math.ceil(Math.max(...text.split('\n').map(line=>ctx.measureText(line).width)))+2;
    e.height=text.split('\n').length*fontSize*1.5;
    e.x=cx-e.width/2;e.y=cy-e.height/2;
  };
  for(const e of scene.elements)Object.assign(e,{roughness:0,roundness:null,strokeWidth:1.5});
  nodes.forEach((e,i)=>{
    const [x,y]=layout.nodes[i], [width,height]=layout.size;
    const [backgroundColor,strokeColor,color]=palette[layout.colors[i]];
    Object.assign(e,{x,y,width,height,backgroundColor,strokeColor,strokeWidth:layout.colors[i]==='shared'?1.8:1.3});
    const text=scene.elements.find(t=>t.type==='text'&&t.containerId===e.id);
    if(!text)throw new Error('노드의 편집 가능한 텍스트를 찾을 수 없습니다.');
    setText(text,labels[i],x+width/2,y+height/2,20,color);
    if(text.width>width-20)throw new Error('노드 텍스트가 박스를 넘습니다: '+labels[i]);
  });
  arrows.forEach((e,i)=>{
    const {p,label,dashed}=layout.edges[i];
    const [x,y]=p[0];
    Object.assign(e,{x,y,points:p.map(([px,py])=>[px-x,py-y]),width:Math.max(...p.map(q=>q[0]))-Math.min(...p.map(q=>q[0])),height:Math.max(...p.map(q=>q[1]))-Math.min(...p.map(q=>q[1])),strokeColor:dashed?'#8B9F98':'#527E70',strokeStyle:dashed?'dashed':'solid',endArrowhead:'triangle',startArrowhead:null,elbowed:false});
    // 접점은 유지하고, 기존 자동 배치에서 계산된 focus 값은 재계산한다.
    const binding=(old,point)=>{
      if(!old)return null;
      const n=nodes.find(n=>n.id===old.elementId);
      const dx=point[0]-(n.x+n.width/2),dy=point[1]-(n.y+n.height/2);
      const horizontal=Math.abs(dx/(n.width/2))>=Math.abs(dy/(n.height/2));
      return {...old,gap:1,focus:horizontal?dy/(n.height/2):dx/(n.width/2)};
    };
    e.startBinding=binding(e.startBinding,p[0]);e.endBinding=binding(e.endBinding,p[p.length-1]);
    const text=scene.elements.find(t=>t.type==='text'&&t.containerId===e.id);
    if(text){
      if(!label)throw new Error('연결선 라벨의 배치가 없습니다.');
      setText(text,text.originalText.replace(/<br\s*\/?\s*>/gi,'\n'),label[0],label[1],15,'#596F68');
      // 화살표에 귀속된 라벨은 export 과정에서 중간점으로 강제 이동된다.
      // 독립 텍스트로 두어 분기선·귀환선에 지정한 여백을 보존한다.
      text.containerId=null;
      e.boundElements=(e.boundElements||[]).filter(b=>b.id!==text.id);
    }
  });
  scene.appState={...scene.appState,viewBackgroundColor:'#FFFFFF'};
  return scene;
}
try{for(const slug of ['gachisup-user-journey','gachisup-participation-flow']){
  const stem=path.join(__dirname,'diagrams',slug);
  const encoded=fs.readFileSync(stem+'.mmd').toString('base64');
  const source=`decodeURIComponent(escape(atob('${encoded}')))`;
  console.log(invoke('js','--tab-id',tab,`window.__renderMermaid('${slug}',${source}).then(s=>'MERMAID 검증 '+s.length)`));
  console.log(invoke('js','--tab-id',tab,`window.__mermaidToExcalidraw(${source}).then(j=>{const scene=(${normalizeScene.toString()})(JSON.parse(j),${source},${JSON.stringify(layouts[slug])});window.__scene=JSON.stringify(scene);return 'EDITABLE '+scene.elements.length})`));
  console.log(invoke('js','--tab-id',tab,'window.__scene','--out',stem+'.excalidraw'));
  console.log(invoke('js','--tab-id',tab,`window.__excalidrawToSvg(window.__scene).then(s=>{window.__svg=s;return 'SVG '+s.length})`));
  console.log(invoke('js','--tab-id',tab,'window.__svg','--out',stem+'.svg'));
  console.log(invoke('js','--tab-id',tab,'window.__rasterize(window.__svg,2400)','--out',stem+'.png'));
}}finally{if(ownTab)console.log(invoke('closetab',tab));}
