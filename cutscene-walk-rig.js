/* 보행 접지 비교 실험: 원본 머리·몸체와 분리한 발 레이어. 기본 채택 전 비교한다. */
(() => {
  const base='assets/cutscenes/poses-black/',images={};
  const ready=Promise.all(Object.entries({body:'walk-body-base-v2.png',leg:'walk-leg-soft-root-v2.png',farLeg:'walk-front-paw-layer-v1.png'}).map(([key,file])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(Error('보행 레이어 로드 실패: '+file));im.src=base+file;})));
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{const p=clamp(x);return p*p*(3-2*p);},mix=(a,b,p)=>a+(b-a)*p;
  const legs=[{id:'far-front',sourceX:862,toeY:-16,phase:0,scale:.78},{id:'near-hind',sourceX:462,toeY:-32,phase:.25,scale:.78},{id:'near-front',sourceX:650,toeY:0,phase:.5,scale:.85}];
  function targets(x,y,size,options={}){
    const registration=.300488*size/384,contactRegistration=.300488*(options.rigSize||size)/384,stride=options.rigStride||size*.27,travel=options.travel||0,amount=clamp(options.walk??1),sample=options.pathAtDistance||((d)=>({x:x+d-travel,y}));
    return legs.map(leg=>{
      const cycles=travel/stride+leg.phase,step=Math.floor(cycles),phase=cycles-step,stance=phase<.62,q=stance?0:ease((phase-.62)/.38);
      const contactDistance=(step-leg.phase+.31)*stride,a=sample(contactDistance),b=sample(contactDistance+stride),offset=(leg.sourceX-670.218)*contactRegistration,toe=leg.toeY*contactRegistration;
      const lift=stance?0:Math.sin(Math.PI*(phase-.62)/.38)*size*.037;
      return{...leg,phase,stance,step,contactDistance,foot:{x:mix(x+offset,mix(a.x,b.x,q)+offset,amount),y:mix(y+toe,mix(a.y,b.y,q)+toe-lift,amount)},hip:{x:x+offset,y:y-336*leg.scale*registration},registration};
    });
  }
  function draw(c,x,y,size,time,options={}){
    if(!images.body||!images.leg)throw Error('보행 레이어 준비 전 렌더');
    const feet=targets(x,y,size,options),registration=.300488*size/384,phase=(options.travel||0)/(options.rigStride||size*.27),bob=-(Math.sin(phase*Math.PI*2)**2)*size*.006;
    function drawLeg(leg){
      const length=336*registration*leg.scale,dx=leg.foot.x-leg.hip.x,angle=-Math.asin(Math.max(-.8,Math.min(.8,dx/length)));
      c.save();c.translate(leg.foot.x,leg.foot.y);c.rotate(angle);c.scale(registration*leg.scale,registration*leg.scale);c.drawImage(leg.id==='far-front'?images.farLeg:images.leg,-646,-1126);c.restore();
      leg.angle=angle;
    }
    feet.forEach(drawLeg);
    c.save();c.translate(x,y+bob);c.scale(registration,registration);c.drawImage(images.body,-670.218,-1142);c.restore();
    // 가까운 다리의 아래쪽은 배 윤곽선 앞에 온다. 어깨 위의 분리 파츠 경계는 몸체 뒤에 둔다.
    c.save();c.beginPath();c.rect(x-size,y-size*.22,size*2,size);c.clip();feet.filter(f=>f.id!=='far-front').forEach(drawLeg);c.restore();
    return{state:'walk-local-rig',status:'experimental',frame:0,phase,bob,feet:feet.map(({id,foot,stance,step,phase,angle})=>({id,foot,stance,step,phase,angle}))};
  }
  window.CutsceneWalkRig={ready,draw,targets};
})();
