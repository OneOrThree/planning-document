(() => {
  const A=window.CutsceneActors,{clamp,ease,mix}=A,W=720,H=1280;
  const arc=(c,points,color,width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
  function actor(c,x,y,size,t,walk=0,lean=0,pose={}){
    if(CutsceneSettings.actorMode==='rig')return CutsceneRig.draw(c,x,y,size,t,{...pose,walk,lean});
    if(pose.look){
      // 세션에서 한 장씩 생성한 파생 자세. 아틀라스 추출물이라고 표시하지 않는다.
      const registration=.300488*size/384;c.save();c.translate(x,y);c.rotate(lean);c.scale(registration,registration);c.drawImage(pose.look==='reach'?A.images.lookReach:A.images.lookDown,-670.218,-1141);c.restore();return{state:'look-'+pose.look,frame:0};
    }
    if(walk>.1)return CutsceneSprites.draw(c,x,y,size,'walk',pose.gaitTime??t,{lean});
    if(pose.jump!==undefined)return CutsceneSprites.draw(c,x,y,size,'jump',0,{frame:Math.min(3,Math.floor(pose.jump*4)),lean});
    if(pose.reach!==undefined)return CutsceneSprites.draw(c,x,y,size,'reach',0,{frame:pose.reach,lean});
    const blinkTime=t%4.7-3.2;
    if(!(pose.grip>.02))return CutsceneSprites.draw(c,x,y,size,'blink',blinkTime<0?0:blinkTime,{lean});
    if(pose.grip<.72)return CutsceneSprites.draw(c,x,y,size,'reach',0,{frame:pose.grip<.35?1:2,lean});
    return CutsceneSprites.draw(c,x,y,size,'paddle',blinkTime<0?0:blinkTime,{lean});
  }
  function view(c,{x=360,y=640,z=1}){c.translate(W/2,H/2);c.scale(z,z);c.translate(-x,-y);}
  function camera(f,t,phase){
    if(f.directionId==='emotion'){
      if(phase==='prepare')return{x:430,y:802,z:1.42+.07*ease(t/6)};
      if(phase==='sea'){const p=ease((t-f.timing.seaStart)/(24-f.timing.seaStart));return{x:385+25*p,y:640-45*p,z:1.12+.04*p};}
      const close=ease((t-f.timing.walkEnd+1)/1.1)*(1-ease((t-f.timing.departureStart-.4)/1.6));
      return{x:385+18*close,y:640-55*close,z:1.12+.18*close};
    }
    if(f.directionId==='journey'){
      const p=ease((t-f.timing.prepareEnd)/(f.timing.walkEnd-f.timing.prepareEnd));
      return{x:mix(285,405,p),y:mix(500,680,p),z:mix(1.48,1.16,p)};
    }
    return{x:360,y:640,z:1};
  }
  function groundShadow(c,x,y,size,alpha){A.ellipse(c,x,y+1,size*.19,size*.044,`rgba(66,54,40,${alpha})`);}
  function floorBook(c,x,y,size,t,story,options={}){c.save();c.transform(1,.11,-.2,.66,x,y);A.book(c,0,0,size,t,story,options);c.restore();}
  function carry(c,x,y,size,t,story,alpha=1,options={}){
    c.save();c.globalAlpha*=alpha;c.translate(x+size*.23,y-size*.22);c.rotate(-.12+Math.sin(t*2)*.018);c.scale(size/176,size/176);
    if(options.worn!==false){c.strokeStyle='#786249';c.lineWidth=2.8;c.beginPath();c.moveTo(-55,-25);c.quadraticCurveTo(-33,-20,-8,-10);c.stroke();}
    const open=options.open||0;c.strokeStyle='#756047';c.lineWidth=2.4;c.beginPath();c.ellipse(0,-20,11,13,0,Math.PI,Math.PI*2);c.stroke();
    c.strokeStyle='#665441';c.lineWidth=2.2;c.fillStyle='#9e8361';c.beginPath();c.roundRect(-17,-13,32,27,5);c.fill();c.stroke();
    if(!options.empty){c.fillStyle=story===1?'#788676':'#ebe0be';c.fillRect(-10,-16,21,5);c.strokeRect(-10,-16,21,5);}
    if(open){c.fillStyle='#65533c';c.beginPath();c.ellipse(-1,-11,14,3*open,0,0,Math.PI*2);c.fill();}
    arc(c,[[-14,-6],[0,mix(0,-10,open)],[13,-6]],'#68563e',1.5);c.restore();
  }
  function ledgerSketch(c,x,y,size,t,story){
    c.save();c.translate(x,y);c.scale(size,size);c.lineWidth=2;c.strokeStyle='#8a7755';
    const points=[[-56,12],[-21,-22],[56,12],[21,46],[-56,12]];arc(c,points.slice(0,Math.min(5,Math.floor(t*2)+1)),'#8a7755',2.5);
    for(let i=0;i<Math.min(6,Math.floor(t*2));i++)arc(c,[[-39+i*14,2+i*3],[-17+i*14,17+i*3]],'#8a7755',1.7);
    if(t>2){c.font='600 18px system-ui';c.fillStyle='#725c40';c.fillText(story===2?'우리':'다시, 같이',-19,71);}c.restore();
  }
  function preparation(c,f,t){
    const id=f.storyIndex,dir=f.directionId,p=clamp(t/f.timing.prepareEnd);let x,y,size,bookSize;
    if(dir==='journey'){
      A.background(c,A.images.coastHome,t);
      x=id===2?182:112;y=id===2?520:423;size=id===2?157:141;bookSize=id===1?.72:.57;
    }else if(id===2){
      A.background(c,A.images.sand,t);x=297;y=799;size=234;bookSize=.8;
    }else{
      A.background(c,A.images.room,t);x=id===1?314:382;y=id===1?844:866;size=238;bookSize=id===1?1.48:1.15;
    }
    bookSize=size/238*.57;
    const closeAt=id===1?.48:.36,closing=ease((p-closeAt)/.15),lift=ease((p-closeAt-.16)/.13),stow=ease((p-.73)/.09),shoulder=ease((p-.84)/.12);
    const bx=mix(x+size*.4,x+size*.23,lift),by=mix(y-size*.02,y-size*.17,lift)+stow*size*.25;
    const bagY=y+size*.28*(1-shoulder),bs=bookSize;
    const intro=dir==='storybook'?ease((t-1.4)/1.25):1;
    const bookOptions={opening:1-closing,turn:id===1?clamp((p-.13)/.29):0,blank:id===1?ease((p-.35)/.12):0};
    const drawBook=()=>{if(intro<1)return;c.save();c.globalAlpha=1-stow;c.translate(bx,by);c.transform(1,.11*(1-lift),-.2*(1-lift),mix(.66,1,lift),0,0);A.book(c,-39*bs*closing,0,bs,t,id,bookOptions);c.restore();};
    groundShadow(c,x,y,size,.17);
    if(id===2)ledgerSketch(c,x+size*.52,y+size*.18,size/195,t,2);
    if(lift===0)drawBook();
    // 시선→앞발→표지→들어 올리기 순서로 이어 출발 전에 가방에 넣는다.
    let reach=p<.12?0:p<closeAt?1:p<closeAt+.16?4:p<.73?2:p<.84?4:p<.97?2:0;
    if(id===2)reach=p<.12?0:p<.58?4:p<.82?2:0;
    const look=p<(id===2?.58:closeAt+.16)?(p<.12?'down':'reach'):null;
    actor(c,x,y,size,t,0,Math.sin(t*.7)*.004,{reach,look,nod:p<closeAt?.055:0});
    if(lift>0)drawBook();
    carry(c,x,bagY,size,t,id,1,{open:1-ease((p-.8)/.06),worn:shoulder>.85});
    if(dir==='storybook'&&intro<1){
      // 같은 공책 한 권을 크기·원근으로 연결한다. 두 공책을 겹쳐 디졸브하지 않는다.
      const cover=1-ease((t-1.4)/.7);c.save();c.globalAlpha=cover;c.fillStyle='#f4ebd5';c.fillRect(0,0,W,H);c.restore();
      c.save();c.translate(mix(360,bx,intro),mix(656,by,intro));c.transform(1,.11*intro,-.2*intro,mix(1,.66,intro),0,0);A.book(c,0,0,mix(3.1,bs,intro),t,id,bookOptions);c.restore();
    }
    return{x,y};
  }
  function phaseAt(f,t){const k=f.timing;return t<k.prepareEnd?'prepare':t<k.walkEnd?'walk':t<k.boardingEnd?'boarding':t<k.departureStart?'settle':t<k.seaStart?'depart':'sea';}
  function boatAt(f,t){
    const k=f.timing,journey=f.directionId==='journey',p=ease((t-k.departureStart)/(k.seaStart-k.departureStart));
    const bez=(a,b,c,d)=>a*(1-p)**3+3*b*(1-p)**2*p+3*c*(1-p)*p*p+d*p**3;
    let x=journey?bez(447,610,641,603):bez(456,580,620,565),y=journey?bez(814,921,747,581):bez(652,720,610,481);
    let scale=journey?1-.28*p:1-.33*p;
    if(t>=k.seaStart){const q=ease((t-k.seaStart)/(24-k.seaStart));x=journey?mix(603,560,q):mix(565,535,q);y=journey?mix(581,516,q):mix(481,438,q);scale=journey?mix(.72,.68,q):mix(.67,.61,q);}
    return{x,y,scale,progress:p};
  }
  function world(c,f,t){
    const k=f.timing,T=f.tuning,phase=phaseAt(f,t);let catFoot,seat=null,scale=1;
    const cam=camera(f,t,phase);if(f.storyIndex===2&&phase==='prepare'&&f.directionId==='emotion')Object.assign(cam,{x:369,y:749,z:1.35});
    cam.x=clamp(cam.x,W/(2*cam.z),W-W/(2*cam.z));cam.y=clamp(cam.y,H/(2*cam.z),H-H/(2*cam.z));
    c.save();view(c,cam);
    if(phase==='prepare')catFoot=preparation(c,f,t);
    else{
      const atSea=phase==='sea',journey=f.directionId==='journey';
      // 출항 마지막까지 같은 해안. 서로 다른 수평선과 태양을 겹치지 않는다.
      A.background(c,journey?A.images.coastHome:A.images.shore,t);
      A.ripples(c,t,journey?'home':'shore');
      const boat=boatAt(f,t),rx=boat.x,ry=boat.y,progress=boat.progress;scale=boat.scale;
      const dockStart=k.walkEnd-.95,dockQ=clamp((t-dockStart)/.95),dockCat=journey?{x:407,y:714}:{x:312,y:581},uncover=ease((dockQ-.08)/.84),build=ease((dockQ-.12)/.73);
      const clothPoint={x:dockCat.x-28,y:dockCat.y+15};
      const boarded=['settle','depart','sea'].includes(phase),landing=phase==='settle'?Math.sin((t-k.boardingEnd)*7)*Math.exp(-(t-k.boardingEnd)*5):0;
      const raftWidth=T.raftWidth*scale*(journey?.88:1);
      if(t<k.departureStart&&!(dockQ>0&&dockQ<.92)){
        // 밧줄은 갑판·캐릭터 뒤의 깊이. 얼굴 앞을 지나가지 않는다.
        const loose=ease((t-k.boardingEnd)/(k.departureStart-k.boardingEnd));c.save();c.globalAlpha=1-loose;c.strokeStyle='#806447';c.lineWidth=2.5;c.beginPath();c.moveTo(journey?466:369,journey?708:575);c.quadraticCurveTo(journey?451:412,(journey?751:585)+loose*20,rx-55,ry-45);c.stroke();c.restore();
      }
      seat=A.raft(c,rx,ry,raftWidth,t,boarded,atSea?1:progress,{landing,paddleTime:t-k.departureStart,paddleAmplitude:T.paddleAmplitude,book:f.storyIndex,grip:ease((t-k.boardingEnd-.55)/.65),unpack:ease((t-k.boardingEnd-.05)/.6),drawCarry:carry,drawCat:actor,uncover:f.storyIndex===1?uncover:1,clothDestination:{x:clothPoint.x-rx,y:clothPoint.y-ry},build:f.storyIndex===2?build:1});
      if(f.storyIndex===1&&uncover===1){c.save();c.translate(clothPoint.x,clothPoint.y);const rw=T.raftWidth*(journey?.88:1);c.scale(.16,.12);c.drawImage(A.images.cloth,225,266,1090,520,-rw*.52,-rw*.22,rw*1.04,rw*.5);c.restore();}
      if(phase==='walk'){
        const p=clamp((t-k.prepareEnd)/(dockStart-k.prepareEnd));const travel=p<.12?p*p/.24:p>.88?1-(1-p)**2/.24:p-.06;
        let x=mix(117,312,travel/.94),y=mix(619,581,travel/.94),size=T.catSize;
        if(journey){
          const nodes=f.storyIndex===2?[[182,520],[220,597],[290,681],[360,713],[407,714]]:[[112,423],[131,478],[165,534],[231,623],[297,681],[360,713],[407,714]];
          const lengths=nodes.slice(1).map((n,i)=>Math.hypot(n[0]-nodes[i][0],n[1]-nodes[i][1])),total=lengths.reduce((a,b)=>a+b,0);
          let distance=travel/.94*total,part=0;while(part<lengths.length-1&&distance>lengths[part])distance-=lengths[part++];
          const q=clamp(distance/lengths[part]);x=mix(nodes[part][0],nodes[part+1][0],q);y=mix(nodes[part][1],nodes[part+1][1],q);size=mix(f.storyIndex===2?157:141,155,p);
        }
        groundShadow(c,x,y,size,T.shadowAlpha);
        const pose=t>=dockStart?{reach:dockQ<.2?1:dockQ<.65?3:2}:{gaitTime:(t-k.prepareEnd)*.8};
        carry(c,x,y,size,t,f.storyIndex);actor(c,x,y,size,t,Math.min(1,p/.1,(1-p)/.1),0,pose);catFoot={x,y};
        if(dockQ>0&&dockQ<.92){
          const hand={x:x+size*(dockQ<.2?.28:dockQ<.65?.402:.229),y:y-size*(dockQ<.2?.057:dockQ<.65?.268:.197)},tie={x:rx-raftWidth*.27,y:ry-raftWidth*.06};
          c.save();c.strokeStyle='#8b7150';c.lineWidth=2;c.beginPath();c.moveTo(hand.x,hand.y);c.quadraticCurveTo((hand.x+tie.x)/2,(hand.y+tie.y)/2+13*(1-build),tie.x,tie.y);c.stroke();c.restore();
        }
      }else if(phase==='boarding'){
        const p=clamp((t-k.walkEnd)/(k.boardingEnd-k.walkEnd)),anticipation=T.anticipation;
        const start=journey?{x:407,y:714}:{x:312,y:581};let x=start.x,y=start.y,lean=0;
        if(p<anticipation){const q=Math.sin(Math.PI*p/anticipation);y+=q*4;lean=-q*.025;}
        else{const q=(p-anticipation)/(1-anticipation);x=mix(start.x,seat.x,ease(q));y=mix(start.y,seat.y,ease(q))-Math.sin(Math.PI*q)*T.jumpHeight;lean=-Math.sin(Math.PI*q)*.07;}
        const size=journey?155:T.catSize;
        groundShadow(c,x,mix(start.y,seat.y,ease(p)),size,T.shadowAlpha*.6);carry(c,x,y,size,t,f.storyIndex);actor(c,x,y,size,t,0,lean,{jump:p});catFoot={x,y};
      }else catFoot=seat;
    }
    c.restore();return{phase,catFoot,seat,scale,camera:cam};
  }
  const copy=[
    ['오늘 할 일은, 어제와 비슷해.','그래도 오늘은 같이 시작하고 싶어.','책 한 권과, 함께하고 싶은 마음.','함께할 곳으로, 한 걸음 더.','오늘은, 같이 시작해볼까.'],
    ['오래된 공책에서, 약속을 만났어.','함께 만들던 부두. 아직 기억나.','접어 둔 마음을 다시 펴고,','새로운 약속을 만나러 가.','이번에는, 어디에서 같이해볼까.'],
    ['모두의 배가 쉬어 갈 부두를 그렸어.','혼자 완성할 수는 없겠지만,','함께할 곳으로 갈 뗏목은 만들었어.','첫 조각은 만들었어.','그다음은, 같이 만들자.'],
  ];
  function caption(c,f,t){
    const k=f.timing,stops=[.4,k.prepareEnd*.51,k.prepareEnd+.25,k.departureStart+.25,k.seaStart+.3,24];
    const i=stops.findIndex((a,j)=>j<5&&t>=a&&t<stops[j+1]);
    const text=i<0?null:copy[f.storyIndex][i],opacity=i<0?0:Math.min(ease((t-stops[i])/.3),i===4?1:ease((stops[i+1]-t)/.22));
    const paper=f.directionId==='storybook',light=f.directionId!=='emotion',y=paper?1156:f.tuning.captionY+42;c.save();
    const top=paper?1082:1010,g=c.createLinearGradient(0,top,0,H);
    if(light){g.addColorStop(0,'#f6edd800');g.addColorStop(paper?.24:.58,paper?'#f6edd8f8':'#f6edd8df');g.addColorStop(1,'#f6edd8');}
    else{g.addColorStop(0,'#213d4800');g.addColorStop(.42,'#213d48ba');g.addColorStop(1,'#213d48b5');}
    c.fillStyle=g;c.fillRect(0,top,W,H-top);
    if(paper){c.fillStyle='#a39271';c.beginPath();c.arc(W/2,1114,2,0,Math.PI*2);c.fill();}
    c.globalAlpha=opacity;c.font=`500 ${f.tuning.captionSize}px system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=light?'#4c4037':'#fff9ea';
    if(!light){c.shadowColor='#17363bbf';c.shadowBlur=8;c.shadowOffsetY=2;}if(text)c.fillText(text,W/2,y,W-76);c.restore();return text;
  }
  function pageTurn(c,f,t){
    const boundary=f.timing.prepareEnd,p=ease((t-boundary+.44)/.95),edge=W*(1-p),fold=76*Math.sin(p*Math.PI);
    const incoming=world(c,f,Math.max(boundary+.001,t));
    c.save();c.beginPath();c.moveTo(0,0);c.lineTo(edge,0);c.bezierCurveTo(edge-fold*.24,H*.3,edge-fold*.24,H*.7,edge,H);c.lineTo(0,H);c.closePath();c.clip();
    const outgoing=world(c,f,Math.min(boundary-.001,t));c.restore();
    if(fold>.1){
      c.save();const shade=c.createLinearGradient(edge-fold,0,edge+18,0);shade.addColorStop(0,'#e4d2ac');shade.addColorStop(.65,'#fff8e6');shade.addColorStop(1,'#eadabb');c.fillStyle=shade;
      c.shadowColor='#453c322c';c.shadowBlur=14;c.shadowOffsetX=9;
      c.beginPath();c.moveTo(edge,0);c.bezierCurveTo(edge-fold*.24,H*.3,edge-fold*.24,H*.7,edge,H);c.bezierCurveTo(edge-fold,H*.78,edge-fold,H*.22,edge,0);c.closePath();c.fill();c.restore();
    }
    return{...(t<boundary?outgoing:incoming),phase:phaseAt(f,t),transition:{kind:'page-turn',progress:p}};
  }
  function render(canvas,filmOrIndex,time){
    const f=typeof filmOrIndex==='number'?CutsceneProduction.films[filmOrIndex]:filmOrIndex;
    if(!f)throw Error('알 수 없는 영상');const t=clamp(time,0,24);Object.assign(CutsceneSettings,{actorMode:'sprite',...f.tuning,catSize:f.tuning.catSize,raftWidth:f.tuning.raftWidth,headMotion:f.tuning.headMotion,tailMotion:f.tuning.tailMotion,waveOpacity:f.tuning.waveAlpha,wakeOpacity:f.tuning.wakeAlpha});
    const c=canvas.getContext('2d');c.save();c.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);c.fillStyle='#eee8d7';c.fillRect(0,0,W,H);c.imageSmoothingQuality='high';
    const turning=f.directionId==='storybook'&&t>f.timing.prepareEnd-.44&&t<f.timing.prepareEnd+.51;
    const meta=turning?pageTurn(c,f,t):world(c,f,t);
    for(const boundary of f.directionId==='emotion'?[f.timing.prepareEnd]:[]){
      const a=clamp(1-Math.abs(t-boundary)/.23);if(a){c.fillStyle=`rgba(246,239,218,${a})`;c.fillRect(0,0,W,H);}
    }
    if(f.directionId==='storybook'){c.strokeStyle='#f3e7ca';c.lineWidth=16;c.strokeRect(8,8,W-16,H-16);}
    const line=caption(c,f,t);c.restore();return{filmId:f.id,time:t,...meta,caption:line};
  }
  window.GachisupCinema={ready:Promise.all([A.ready,CutsceneSprites.ready,CutsceneRig.ready]),render,duration:24,phaseAt,boatAt};
})();
