/* 같은 전신에서 움직이는 앞발만 분리한 국소 관절 실험. 전체 몸 파츠 실험과 별개다. */
(() => {
  const base='assets/cutscenes/poses-black/',images={};
  const ready=Promise.all(Object.entries({body:'paddle-body-base-v1.png',half:'paddle-body-blink-half-v1.png',closed:'paddle-body-blink-closed-v1.png',arm:'paddle-arm-layer-v1.png'}).map(([key,file])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=CutsceneFurPalette.prepare(im,file);resolve();};im.onerror=()=>reject(Error('노 젓기 레이어 로드 실패: '+file));im.src=base+file;})));
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{const p=clamp(x);return p*p*(3-2*p);};
  function motionAt(time){
    const cycle=((time/2.8)%1+1)%1,stroke=cycle<.64?ease(cycle/.64):1-ease((cycle-.64)/.36),lift=cycle<.64?0:Math.sin((cycle-.64)/.36*Math.PI);
    return{cycle,stroke,lift,armAngle:.38*stroke-.42*lift};
  }
  function weightAt(time,grip=1,enabled=true){
    const active=enabled?ease(Math.max(0,time)/.55)*clamp(grip):0,motion=motionAt(time);
    // 발바닥 등록선은 고정하고, 노를 당길수록 상체를 조금 뒤로 보낸다.
    return{shear:.075*(motion.stroke-.5)*active,baseline:1142,active};
  }
  function draw(c,x,y,size,time,options={}){
    if(!images.body||!images.arm)throw Error('노 젓기 레이어 준비 전 렌더');
    const paddleTime=options.paddleTime??time,motion=motionAt(paddleTime),grip=options.grip??1,angle=.88*(1-grip)+motion.armAngle*grip,scale=.300488*size/384,lean=options.lean||0;
    const weight=weightAt(paddleTime,grip,options.weightShift??!!CutsceneSettings.paddleWeight);
    // 생성 파츠의 실제 등록점. 어깨와 앞발 접점은 같은 변환을 사용한다.
    const pickupArc=Math.sin(Math.PI*grip);
    const shoulder={x:844+30*pickupArc,y:895-114*grip+100*pickupArc},root={x:841,y:851},palm={x:1032,y:1008};
    const hx=shoulder.x+(palm.x-root.x)*Math.cos(angle)-(palm.y-root.y)*Math.sin(angle),hy=shoulder.y+(palm.x-root.x)*Math.sin(angle)+(palm.y-root.y)*Math.cos(angle);
    c.save();c.translate(x,y);c.rotate(lean);c.scale(scale,scale);c.translate(-670.218,-1142);
    c.transform(1,0,weight.shear,1,-weight.shear*weight.baseline,0);
    c.save();c.translate(shoulder.x,shoulder.y);c.rotate(angle);c.drawImage(images.arm,-root.x,-root.y);c.restore();
    const bt=options.blinkTime??-1,blinkFrame=bt>=0&&bt<.24?(bt<.05||bt>=.16?0:1):-1;
    c.drawImage(blinkFrame<0?images.body:blinkFrame===0?images.half:images.closed,0,0);c.restore();
    const px=(hx+weight.shear*(hy-weight.baseline)-670.218)*scale,py=(hy-1142)*scale;
    return{state:'paddle-local-rig',status:'experimental',frame:0,blinkFrame,armAngle:angle,cycle:motion.cycle,weight,hand:{x:x+px*Math.cos(lean)-py*Math.sin(lean),y:y+px*Math.sin(lean)+py*Math.cos(lean)}};
  }
  window.CutscenePaddleRig={ready,draw,motionAt,weightAt};
})();
