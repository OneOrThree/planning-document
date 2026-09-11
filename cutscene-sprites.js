/* sprite-gen의 합성 아틀라스와 명시적인 frame_layout만 소비한다. */
(() => {
  const collections={},directories={base:'black',reach:'black-reach',paddle:'black-paddle'};
  const ready=Promise.all(Object.entries(directories).map(async([key,dir])=>{
    const base='assets/cutscenes/sprites/'+dir+'/',record={};collections[key]=record;
    await Promise.all([
      fetch(base+'manifest.json').then(r=>{if(!r.ok)throw Error('고양이 동작 명세 로드 실패: '+dir);return r.json();}).then(m=>{record.manifest=m;}),
      new Promise((resolve,reject)=>{record.atlas=new Image();record.atlas.onload=resolve;record.atlas.onerror=()=>reject(Error('고양이 동작 이미지 로드 실패: '+dir));record.atlas.src=base+'sprite-sheet-alpha.png';}),
    ]);
  }));
  const source=state=>collections[state==='reach'||state==='paddle'?state:'base'];
  function index(state,time){
    const row=source(state).manifest.animation.rows[state];if(!row)throw Error('알 수 없는 고양이 동작: '+state);
    const durations=row.durations_ms,total=durations.reduce((a,b)=>a+b,0);
    let ms=row.loop?((time*1000%total)+total)%total:Math.min(total-.001,Math.max(0,time*1000));
    for(let i=0;i<durations.length;i++){if(ms<durations[i])return i;ms-=durations[i];}return durations.length-1;
  }
  function draw(c,x,foot,size,state,time,{frame,lean=0,alpha=1}={}){
    const {manifest:m,atlas:a}=source(state),n=frame===undefined?index(state,time):frame,rect=m.frame_layout.rows[state]?.[n];
    if(!rect)throw Error('없는 고양이 동작 프레임: '+state+'/'+n);
    const scale=size/m.cell.width;c.save();c.globalAlpha*=alpha;c.translate(x,foot);c.rotate(lean);c.scale(scale,scale);
    c.drawImage(a,rect.x,rect.y,rect.w,rect.h,-m.cell.width/2,-(m.cell.height-m.cell.safe_margin_y),rect.w,rect.h);c.restore();
    return{state,frame:n};
  }
  function texture(state,time,frame){const s=source(state);return{image:s.atlas,rect:s.manifest.frame_layout.rows[state][frame??index(state,time)]};}
  window.CutsceneSprites={ready,draw,index,texture,get manifest(){return collections.base.manifest;},get manifests(){return Object.values(collections).map(x=>x.manifest);}};
})();
