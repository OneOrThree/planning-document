const {chromium}=require('playwright');
const path=require('node:path');
(async()=>{const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1220,height:680}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/red-panda-walk-qa.html'));await page.waitForSelector('body[data-ready="true"]');const result=await page.evaluate(()=>redPandaWalkQaRigs.map(r=>({loaded:r.loaded,error:r.error,direction:r.direction,view:r.view,flip:r.flip,bones:r.names.length,stride:r.stride,leftLift:r.footLift?.L,rightLift:r.footLift?.R,finite:Array.from(r.positions).every(Number.isFinite),weightError:Math.max(...r.meshes[r.view].weights.map(w=>Math.abs(w.reduce((a,b)=>a+b,0)-1))),exportBones:Object.keys(JSON.parse(JSON.stringify(r.exportRig())).bones).length})));await page.screenshot({path:path.join(__dirname,'red-panda-walk-qa-states.png')});
const cycle=await page.evaluate(()=>{
  const rig=redPandaWalkQaRigs[0],report={};
  const area=(p,a,b,c)=>(p[b*2]-p[a*2])*(p[c*2+1]-p[a*2+1])-(p[b*2+1]-p[a*2+1])*(p[c*2]-p[a*2]);
  for(const direction of ['sw','ne']){
    rig.setDirection(direction);rig.setWalking(true);let minRatio=Infinity,inversions=0,minLocation=null;const stance={L:[],R:[]},lifted={L:[],R:[]};
    const soles=direction==='sw'?{L:[313,938],R:[560,968]}:{L:[433,938],R:[650,961]};
    for(let step=0;step<=64;step++){
      rig.seek(step/64);const mesh=rig.meshes[rig.view],indices=mesh.indices;
      for(let i=0;i<indices.length;i+=3){const ratio=area(rig.positions,indices[i],indices[i+1],indices[i+2])/area(mesh.positions,indices[i],indices[i+1],indices[i+2]);if(ratio<minRatio){minRatio=ratio;minLocation={cycle:step/64,point:[mesh.positions[indices[i]*2],mesh.positions[indices[i]*2+1]],weights:mesh.weights[indices[i]].map((w,j)=>[rig.names[j],+w.toFixed(3)]).filter(w=>w[1]>.001)}}if(ratio<=0)inversions++;}
      for(const side of ['L','R']){const m=rig.matrices['foot'+side],[x,y]=soles[side],actualY=m[1]*x+m[3]*y+m[5];(rig.footLift[side]<.001?stance:lifted)[side].push(actualY);}
    }
    const span=values=>+(Math.max(...values)-Math.min(...values)).toFixed(3);
    report[direction]={minTriangleAreaRatio:+minRatio.toFixed(5),inversions,minLocation,stanceVerticalRange:{L:span(stance.L),R:span(stance.R)},sampledPoses:65};
  }
  rig.setDirection('sw');rig.distance=0;rig.advance(18.5,1,1);const quarter=+(rig.distance/rig.stride).toFixed(4);rig.advance(55.5,1,1);report.distance={quarter,total:rig.distance,cycle:+((rig.distance/rig.stride)%1).toFixed(4)};
  return report;
});
console.log(JSON.stringify({errors,result,cycle},null,2));if(errors.length||result.some(r=>!r.loaded||!r.finite||r.weightError>1e-9)||cycle.sw.inversions||cycle.ne.inversions)process.exitCode=1;await browser.close();})().catch(e=>{console.error(e);process.exitCode=1});
