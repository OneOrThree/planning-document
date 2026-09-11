/* 검토 40 이후 시연 보행: 같은 머리·몸체와 분리한 발 레이어. 완성형 전신 리깅은 아니다. */
(() => {
  const base='assets/cutscenes/poses-black/',images={};
  const ready=Promise.all(Object.entries({body:'walk-body-no-eyes-v1.png',open:'walk-eyes-open-layer-v1.png',half:'walk-eyes-half-layer-v1.png',closed:'walk-eyes-closed-layer-v1.png',leg:'walk-leg-soft-root-v2.png',farLeg:'walk-front-paw-layer-v1.png'}).map(([key,file])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=CutsceneFurPalette.prepare(im,file);resolve();};im.onerror=()=>reject(Error('보행 레이어 로드 실패: '+file));im.src=base+file;}))).then(()=>{
    // 원화는 보존하고 관절이 몸통과 겹치는 구간만 런타임 합성 마스크로 잇는다.
    const layer=document.createElement('canvas');layer.width=images.leg.width;layer.height=images.leg.height;
    const c=layer.getContext('2d');c.drawImage(images.leg,0,0);c.globalCompositeOperation='destination-in';
    const fade=c.createLinearGradient(0,800,0,985);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,1)');
    c.fillStyle=fade;c.fillRect(0,0,layer.width,layer.height);images.frontBlend=layer;
  });
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{const p=clamp(x);return p*p*(3-2*p);},mix=(a,b,p)=>a+(b-a)*p;
  const legs=[{id:'far-front',sourceX:862,toeY:-16,phase:0,scale:.78},{id:'near-hind',sourceX:462,toeY:-32,phase:.25,scale:.78},{id:'near-front',sourceX:650,toeY:0,phase:.5,scale:.85}];
  function targets(x,y,size,options={}){
    const registration=.300488*size/384,contactRegistration=.300488*(options.rigSize||size)/384,stride=options.rigStride||size*.27,travel=options.travel||0,amount=clamp(options.walk??1),sample=options.pathAtDistance||((d)=>({x:x+d-travel,y}));
    return legs.map(leg=>{
      const cycles=travel/stride+leg.phase,step=Math.floor(cycles),phase=cycles-step,stance=phase<.62,q=stance?0:ease((phase-.62)/.38);
      const contactDistance=(step-leg.phase+.31)*stride,a=sample(contactDistance),b=sample(contactDistance+stride),offset=(leg.sourceX-670.218)*contactRegistration,toe=leg.toeY*contactRegistration;
      const lift=stance?0:Math.sin(Math.PI*(phase-.62)/.38)*size*.037;
      return{...leg,phase,stance,step,contactDistance,lift:lift*amount,foot:{x:mix(x+offset,mix(a.x,b.x,q)+offset,amount),y:mix(y+toe,mix(a.y,b.y,q)+toe-lift,amount)},hip:{x:x+offset,y:y-336*leg.scale*registration},registration};
    });
  }
  function draw(c,x,y,size,time,options={}){
    if(!images.body||!images.leg)throw Error('보행 레이어 준비 전 렌더');
    const feet=targets(x,y,size,options),registration=.300488*size/384,phase=(options.travel||0)/(options.rigStride||size*.27),bob=-(Math.sin(phase*Math.PI*2)**2)*size*.006;
    for(const leg of feet){
      const air=clamp(leg.lift/(size*.037)),spread=1+.3*air;
      CutsceneActors.softShadow(c,leg.foot.x,leg.foot.y+leg.lift+1,size*.068*leg.scale*spread,size*.021*leg.scale*spread,.24*(1-.7*air));
    }
    function drawLeg(leg,foreground=false){
      const length=336*registration*leg.scale,dx=leg.foot.x-leg.hip.x,angle=-Math.asin(Math.max(-.8,Math.min(.8,dx/length)));
      c.save();c.translate(leg.foot.x,leg.foot.y);c.rotate(angle);c.scale(registration*leg.scale,registration*leg.scale);c.drawImage(foreground?images.frontBlend:leg.id==='far-front'?images.farLeg:images.leg,-646,-1126);c.restore();
      leg.angle=angle;
    }
    feet.forEach(leg=>drawLeg(leg));
    const bt=options.blinkTime??-1,blinkFrame=bt>=0&&bt<.24?(bt<.05||bt>=.16?0:1):-1;
    c.save();c.translate(x,y+bob);c.scale(registration,registration);c.drawImage(images.body,-670.218,-1142);
    // 얼굴 바탕은 바꾸지 않고 투명 눈 레이어만 교체한다. 피부색 사각 패치는 쓰지 않는다.
    c.drawImage(blinkFrame<0?images.open:blinkFrame===0?images.half:images.closed,-670.218,-1142);c.restore();
    // 가까운 다리의 아래쪽은 배 윤곽선 앞에 온다. 어깨 위의 분리 파츠 경계는 몸체 뒤에 둔다.
    feet.filter(f=>f.id!=='far-front').forEach(leg=>drawLeg(leg,true));
    return{state:'walk-local-rig',status:'experimental',frame:0,blinkFrame,phase,bob,feet:feet.map(({id,foot,stance,step,phase,angle})=>({id,foot,stance,step,phase,angle}))};
  }
  window.CutsceneWalkRig={ready,draw,targets};
})();
