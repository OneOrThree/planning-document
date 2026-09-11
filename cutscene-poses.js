/* 한 장씩 생성한 보행 자세 실험. sprite-gen 아틀라스와 별개이며 원화를 변형하지 않는다. */
(() => {
  const base='assets/cutscenes/poses-black/';let data=null,loaded=null;const images=new Map();
  function load(){
    if(loaded)return loaded;
    loaded=fetch(base+'walk-v1.json').then(r=>{if(!r.ok)throw Error('보행 자세 명세 로드 실패');return r.json();}).then(async spec=>{
      data=spec;await Promise.all([spec.neutral,...spec.frames,...(spec.blink||[]),...(spec.jump||[]),...(spec.reach||[]),...(spec.reachBlink||[]),...(spec.recovery||[]),...(spec.landing||[])].map(f=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images.set(f.file,img);resolve();};img.onerror=()=>reject(Error('개별 자세 로드 실패: '+f.file));img.src=base+f.file;})));return spec;
    });return loaded;
  }
  function draw(c,x,foot,size,time,options={}){
    if(!data||images.size!==data.frames.length+1+(data.blink?.length||0)+(data.jump?.length||0)+(data.reach?.length||0)+(data.reachBlink?.length||0)+(data.recovery?.length||0)+(data.landing?.length||0))throw Error('개별 자세는 load() 완료 후 그려야 합니다.');
    const cycles=Number.isFinite(options.travel)&&options.stride>0?options.travel/options.stride:time/data.cycleSeconds;
    const jumping=Number.isFinite(options.jump),phase=((cycles%1)+1)%1,index=options.neutral||jumping?-1:Math.floor(phase*data.frames.length);
    const blinkTime=options.blinkTime??-1,blinkIndex=blinkTime>=0&&blinkTime<.24?(blinkTime<.05||blinkTime>=.16?0:1):-1;
    const p=options.jump,jumpIndex=!jumping||p<.05||p>=1.22?-1:p<.13?0:p<.24?1:p<.38?2:p<.68?3:p<1?4:p<1.10?1:0;
    const reaching=Number.isInteger(options.reach),reachIndex=options.reach-1,recovering=Number.isFinite(options.recovery),recoveryIndex=recovering&&options.recovery<1?Math.max(0,Math.floor(options.recovery*data.recovery.length)):-1;
    const landing=Number.isFinite(options.landing),landingIndex=landing&&options.landing<1?Math.max(0,Math.floor(options.landing*data.landing.length)):-1;
    const frame=landing?(landingIndex<0?data.neutral:data.landing[landingIndex]):recovering?(recoveryIndex<0?data.neutral:data.recovery[recoveryIndex]):reaching?(reachIndex===0&&blinkIndex>=0?data.reachBlink[blinkIndex]:data.reach[reachIndex]||data.neutral):jumping?(jumpIndex<0?data.neutral:data.jump[jumpIndex]):index<0?(blinkIndex>=0&&data.blink?.[blinkIndex]||data.neutral):data.frames[index];
    const scale=data.scaleTo384*size/384;c.save();c.translate(x,foot);c.rotate(options.lean||0);if(options.flip)c.scale(-1,1);c.scale(scale,scale);c.drawImage(images.get(frame.file),-data.originX,-frame.originY);c.restore();
    let hand=null;if(frame.hand){const hx=(frame.hand[0]-data.originX)*scale*(options.flip?-1:1),hy=(frame.hand[1]-frame.originY)*scale,a=options.lean||0;hand={x:x+hx*Math.cos(a)-hy*Math.sin(a),y:foot+hx*Math.sin(a)+hy*Math.cos(a)};}
    return{state:landing?'landing-individual-poses':recovering?'recovery-individual-poses':reaching?'reach-individual-poses':jumping?'jump-individual-poses':index<0?(blinkIndex<0?'neutral':'blink-individual-poses'):'walk-individual-poses',frame:landing?landingIndex:recovering?recoveryIndex:reaching?reachIndex:jumping?jumpIndex:index,blinkFrame:blinkIndex,phase,baseline:frame.originY,hand,status:data.status};
  }
  window.CutscenePoses={load,draw,get data(){return data;}};
})();
