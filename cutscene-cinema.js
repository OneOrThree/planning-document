(() => {
  const A=window.CutsceneActors,{clamp,ease,mix}=A,W=720,H=1280;
  const arc=(c,points,color,width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
  function actor(c,x,y,size,t,walk=0,lean=0,pose={}){
    if(CutsceneSettings.actorMode==='rig')return CutsceneRig.draw(c,x,y,size,t,{...pose,walk,lean});
    if(Number.isFinite(pose.landing)&&CutsceneSettings.actorMode==='poses')return CutscenePoses.draw(c,x,y,size,t,{landing:pose.landing,lean});
    if(Number.isFinite(pose.recovery)&&CutsceneSettings.actorMode==='poses')return CutscenePoses.draw(c,x,y,size,t,{recovery:pose.recovery,lean});
    if(pose.look){
      // 세션에서 한 장씩 생성한 파생 자세. 아틀라스 추출물이라고 표시하지 않는다.
      const registration=.300488*size/384,texture=pose.look==='place'?A.images.lookPlace:pose.look==='hold'?A.images.lookHold:pose.look==='reach'?A.images.lookReach:A.images.lookDown;c.save();c.translate(x,y);c.rotate(lean);c.scale(registration,registration);c.drawImage(texture,-670.218,-1141);c.restore();return{state:'look-'+pose.look,frame:0};
    }
    if(walk>.1&&CutsceneSettings.actorMode==='poses'&&CutsceneSettings.walkRig)return CutsceneWalkRig.draw(c,x,y,size,t,{...pose,walk,lean,blinkTime:pose.walkBlinkTime??t%4.7-3.2});
    if(walk>.1)return CutsceneSettings.actorMode==='poses'?CutscenePoses.draw(c,x,y,size,pose.gaitTime??t,{lean,travel:pose.travel,stride:pose.stride}):CutsceneSprites.draw(c,x,y,size,'walk',pose.gaitTime??t,{lean});
    if(pose.jump!==undefined)return CutsceneSettings.actorMode==='poses'?CutscenePoses.draw(c,x,y,size,t,{jump:pose.jump,lean}):CutsceneSprites.draw(c,x,y,size,'jump',0,{frame:Math.min(3,Math.floor(pose.jump*4)),lean});
    if(Number.isFinite(pose.dockProgress)&&CutsceneSettings.actorMode==='poses')return CutscenePaddleRig.draw(c,x,y,size,t,{dockProgress:pose.dockProgress,blinkTime:t%4.7-3.2,lean});
    if(pose.reach!==undefined)return CutsceneSettings.actorMode==='poses'?CutscenePoses.draw(c,x,y,size,t,{reach:pose.reach,lean}):CutsceneSprites.draw(c,x,y,size,'reach',0,{frame:pose.reach,lean});
    const blinkTime=t%4.7-3.2;
    if(!(pose.grip>.02))return CutsceneSettings.actorMode==='poses'?CutscenePoses.draw(c,x,y,size,t,{neutral:true,blinkTime,lean}):CutsceneSprites.draw(c,x,y,size,'blink',blinkTime<0?0:blinkTime,{lean});
    if(CutsceneSettings.actorMode==='poses'&&CutsceneSettings.paddleRig)return CutscenePaddleRig.draw(c,x,y,size,t,{...pose,blinkTime,lean});
    if(CutsceneSettings.actorMode==='poses')return CutscenePoses.draw(c,x,y,size,t,{reach:1,blinkTime,lean});
    if(pose.grip<.72)return CutsceneSprites.draw(c,x,y,size,'reach',0,{frame:pose.grip<.35?1:2,lean});
    return CutsceneSprites.draw(c,x,y,size,'paddle',blinkTime<0?0:blinkTime,{lean});
  }
  function view(c,{x=360,y=640,z=1}){c.translate(W/2,H/2);c.scale(z,z);c.translate(-x,-y);}
  function baseCamera(f,t,phase){
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
  function camera(f,t,phase){
    const cam=baseCamera(f,t,phase);
    if(phase==='depart'||phase==='sea'){
      const next=boatAt(f,Math.min(24,t+.45)),widthScale=f.directionId==='journey'?.88:1;
      // 한 번의 노 동작마다 흔들리지 않도록 노의 전체 활동 범위를 미리 확보한다.
      const right=next.x+226*next.scale*widthScale,fit=Math.max(cam.x,right-(W/2-42)/cam.z);
      cam.x=mix(cam.x,fit,ease((t-f.timing.departureStart+.22)/.9));
    }
    return cam;
  }
  function groundShadow(c,x,y,size,alpha){A.softShadow(c,x,y+1,size*.24,size*.06,alpha);}
  function floorBook(c,x,y,size,t,story,options={}){c.save();c.transform(1,.11,-.2,.66,x,y);A.book(c,0,0,size,t,story,options);c.restore();}
  function carry(c,x,y,size,t,story,alpha=1,options={}){
    c.save();c.globalAlpha*=alpha;c.translate(x+size*.23,y-size*.22);c.rotate(-.12+Math.sin(t*2)*.018);c.scale(size/176,size/176);
    if(options.worn!==false&&options.layer!=='front'){c.strokeStyle='#786249';c.lineWidth=2.8;c.beginPath();c.moveTo(-55,-25);c.quadraticCurveTo(-33,-20,-8,-10);c.stroke();}
    A.satchel(c,options.open||0,options.layer||'all');c.restore();
  }
  function sandDrawing(c,x,y,size,p,bookTip){
    const progress=ease((p-.06)/.32),tip=A.islandPlan(c,x+size*.56,y+size*.27,size/234,progress,{sand:true});
    const hand={x:x+size*.28,y:y-size*.10};
    const rod=(point,length,rest,restX,restY,restAngle,pencil=false)=>{
      const angle=Math.atan2(point.y-hand.y,point.x-hand.x),cx=mix(point.x-Math.cos(angle)*length/2,restX,rest),cy=mix(point.y-Math.sin(angle)*length/2,restY,rest);
      c.save();c.translate(cx,cy);c.rotate(mix(angle,restAngle,rest));c.lineCap='round';
      c.strokeStyle=pencil?'#6d6350':'#806042';c.lineWidth=size*(pencil?.009:.012);c.beginPath();c.moveTo(-length/2,0);c.lineTo(length/2,0);c.stroke();
      c.strokeStyle=pencil?'#c7ac74':'#c09b66';c.lineWidth=size*.004;c.beginPath();c.moveTo(-length/2+3,-.7);c.lineTo(length/2-3,-.7);c.stroke();
      if(pencil){c.strokeStyle='#4c463b';c.lineWidth=size*.008;c.beginPath();c.moveTo(length/2-3,0);c.lineTo(length/2,0);c.stroke();}c.restore();
    };
    // 모래용 나뭇가지와 공책 옆의 짧은 연필은 다른 도구다. 긴 가지가 머리 뒤로 솟지 않는다.
    rod(tip,size*.82,ease((p-.38)/.025),x+size*.49,y+size*.66,-.24);
    const pencilRest={x:x+size*.66,y:y+size*.095},active=bookTip?ease((p-.397)/.008)*(1-ease((p-.5)/.03)):0;
    rod(bookTip||pencilRest,size*.34,1-active,pencilRest.x,pencilRest.y,.1,true);
    return{progress,tip};
  }
  function preparationAt(f,t){
    const p=clamp(t/f.timing.prepareEnd),drawing=f.storyIndex===2,closeAt=f.storyIndex===1?.48:drawing?.54:.36;
    const liftAt=closeAt+(drawing?.12:.13),stowAt=closeAt+(drawing?.21:.25),shoulderAt=closeAt+(drawing?.28:.35);
    return{p,closeAt,liftAt,stowAt,shoulderAt,closing:ease((p-closeAt)/.12),lift:ease((p-liftAt)/(drawing?.08:.1)),stow:ease((p-stowAt)/(drawing?.06:.08)),bagClosure:ease((p-stowAt-(drawing?.06:.08))/.06),shoulder:ease((p-shoulderAt)/.12)};
  }
  function preparation(c,f,t){
    const id=f.storyIndex,dir=f.directionId,{p,closeAt,stowAt,shoulderAt,closing,lift,stow,bagClosure,shoulder}=preparationAt(f,t);let x,y,size,bookSize;
    if(dir==='journey'){
      A.background(c,A.images.coastHome,t);
      x=id===2?182:112;y=id===2?520:423;size=id===2?157:141;bookSize=id===1?.72:.57;
    }else if(id===2){
      A.background(c,A.images.sand,t);x=297;y=799;size=234;bookSize=.8;
    }else{
      A.background(c,A.images.room,t);x=id===1?314:382;y=id===1?844:866;size=238;bookSize=id===1?1.48:1.15;
    }
    bookSize=size/238*.57;
    const bx=mix(x+size*.4,x+size*.23,lift),by=mix(y-size*.02,y-size*.17,lift)+stow*size*.31;
    const bagY=y+size*.28*(1-shoulder),bs=bookSize;
    const intro=dir==='storybook'&&id!==2?ease((t-1.4)/1.25):1;
    const bookOptions={opening:1-closing,turn:id===1?clamp((p-.13)/.29):0,blank:id===1?ease((p-.35)/.12):0,planProgress:id===2?ease((p-.405)/.095):1};
    let bookTip=null;
    const drawBook=()=>{if(intro<1||stow>=1)return;c.save();if(stow>0){const openingY=bagY-size*.22-size/176*11;c.beginPath();c.rect(-W,-H,W*3,H+openingY);c.clip();}c.translate(bx,by);c.transform(1,.11*(1-lift),-.2*(1-lift),mix(.66,1,lift),0,0);const ink=A.book(c,-39*bs*closing,0,bs,t,id,bookOptions);c.restore();if(ink)bookTip=c.getTransform().inverse().transformPoint(ink);};
    groundShadow(c,x,y,size,.17);
    if(lift===0)drawBook();
    if(id===2)sandDrawing(c,x,y,size,p,bookTip);
    // 시선→앞발→표지→들어 올리기 순서로 이어 출발 전에 가방에 넣는다.
    const reach=p<.97?2:0;
    const look=p<(id===2?0:.12)?'down':p<stowAt?(lift<.48?'reach':'hold'):p<shoulderAt?'reach':p<.97?(shoulder<.36?'reach':'hold'):null;
    const bagX=id===2?mix(x-size*.54,x,ease((p-.57)/.13)):x;
    const drawBag=(layer='all')=>carry(c,bagX,bagY,size,t,id,1,{layer,open:1-bagClosure,worn:shoulder>.85});
    drawBag(shoulder>.4?'all':'back');
    actor(c,x,y,size,t,0,Math.sin(t*.7)*.004,{reach,look,nod:p<closeAt?.055:0});
    if(lift>0)drawBook();
    if(shoulder<=.4)drawBag('front');
    if(dir==='storybook'&&intro<1){
      // 같은 공책 한 권을 크기·원근으로 연결한다. 두 공책을 겹쳐 디졸브하지 않는다.
      const cover=1-ease((t-1.4)/.7);c.save();c.globalAlpha=cover;c.fillStyle='#f4ebd5';c.fillRect(0,0,W,H);c.restore();
      c.save();c.translate(mix(360,bx,intro),mix(656,by,intro));c.transform(1,.11*intro,-.2*intro,mix(1,.66,intro),0,0);A.book(c,0,0,mix(3.1,bs,intro),t,id,bookOptions);c.restore();
    }
    return{x,y};
  }
  function phaseAt(f,t){const k=f.timing;return t<k.prepareEnd?'prepare':t<k.walkEnd?'walk':t<k.boardingEnd?'boarding':t<k.departureStart?'settle':t<k.seaStart?'depart':'sea';}
  function settlingAt(f,t){
    const elapsed=t-f.timing.boardingEnd,motionElapsed=elapsed-.16;
    return{elapsed,motionElapsed,put:ease((motionElapsed-.24)/.4),lift:ease((motionElapsed-.66)/.22),open:ease((motionElapsed-.9)/.16),place:ease((motionElapsed-1.08)/.2),rise:clamp((motionElapsed-1.3)/.5),grip:ease((motionElapsed-1.85)/.35)};
  }
  function strokeTravel(elapsed,duration,offset=0,enabled=true){
    if(!enabled)return clamp(elapsed/duration);
    const clock=s=>s+.11*(1-Math.cos(s*Math.PI*2/2.8)),start=clock(offset),end=clock(offset+duration);
    return clamp((clock(offset+clamp(elapsed,0,duration))-start)/(end-start));
  }
  function boatAt(f,t){
    const k=f.timing,journey=f.directionId==='journey',p=ease(strokeTravel(t-k.departureStart,k.seaStart-k.departureStart,0,!!f.tuning.oarTravel));
    const bez=(a,b,c,d)=>a*(1-p)**3+3*b*(1-p)**2*p+3*c*(1-p)*p*p+d*p**3;
    let x=journey?bez(447,610,641,603):bez(456,580,620,565),y=journey?bez(814,921,747,581):bez(652,720,610,481);
    let scale=journey?1-.28*p:1-.33*p;
    if(t>=k.seaStart){const q=ease(strokeTravel(t-k.seaStart,24-k.seaStart,k.seaStart-k.departureStart,!!f.tuning.oarTravel));x=journey?mix(603,560,q):mix(565,535,q);y=journey?mix(581,516,q):mix(481,438,q);scale=journey?mix(.72,.68,q):mix(.67,.61,q);}
    return{x,y,scale,progress:p};
  }
  function wakeTrailAt(f,t){
    const trail=[];
    for(let i=0;i<7;i++){
      const age=.1+i*.22,at=t-age;if(at<=f.timing.departureStart)continue;
      const position=boatAt(f,at),before=boatAt(f,at-.035),after=boatAt(f,at+.035);
      trail.push({...position,age,vx:(after.x-before.x)/.07,vy:(after.y-before.y)/.07,opacity:ease((age-.18)/.18)*(1-ease((age-1.36)/.36))});
    }
    return trail;
  }
  function walkPath(f){
    const nodes=f.directionId==='journey'?(f.storyIndex===2?[[182,520],[155,598],[178,639],[290,681],[360,713],[407,714]]:[[112,423],[131,478],[165,534],[231,623],[297,681],[360,713],[407,714]]):f.directionId==='emotion'?[[180,606],[284,581]]:[[117,619],[284,581]];
    const lengths=nodes.slice(1).map((n,i)=>Math.hypot(n[0]-nodes[i][0],n[1]-nodes[i][1])),total=lengths.reduce((a,b)=>a+b,0);
    return{nodes,lengths,total};
  }
  function walkPathAt(f,distance){
    const{nodes,lengths,total}=walkPath(f);distance=clamp(distance,0,total);let part=0;
    while(part<lengths.length-1&&distance>lengths[part])distance-=lengths[part++];
    const q=clamp(distance/lengths[part]);return{x:mix(nodes[part][0],nodes[part+1][0],q),y:mix(nodes[part][1],nodes[part+1][1],q)};
  }
  function world(c,f,t){
    const k=f.timing,T=f.tuning,phase=phaseAt(f,t);let catFoot,seat=null,scale=1,actorState=null;
    const cam=camera(f,t,phase);if(f.storyIndex===2&&phase==='prepare'&&f.directionId==='emotion')Object.assign(cam,{x:369,y:749,z:1.35});
    const worldWidth=phase==='prepare'?W:A.coastWidth;
    cam.x=clamp(cam.x,W/(2*cam.z),worldWidth-W/(2*cam.z));cam.y=clamp(cam.y,H/(2*cam.z),H-H/(2*cam.z));
    c.save();view(c,cam);
    if(phase==='prepare')catFoot=preparation(c,f,t);
    else{
      const atSea=phase==='sea',journey=f.directionId==='journey';
      // 출항 마지막까지 같은 해안. 서로 다른 수평선과 태양을 겹치지 않는다.
      A.background(c,journey?A.images.coastHome:A.images.shore,t);
      A.ripples(c,t,journey?'home':'shore');
      if(journey&&f.storyIndex===2)sandDrawing(c,182,520,157,1,null);
      const boat=boatAt(f,t),rx=boat.x,ry=boat.y,progress=boat.progress;scale=boat.scale;
      const clothFold=!!T.clothFold&&f.storyIndex===1,dockDuration=clothFold?1.4:.95;
      const dockStart=k.walkEnd-dockDuration,dockQ=clamp((t-dockStart)/dockDuration),dockCat=walkPathAt(f,Infinity),uncover=ease((dockQ-.08)/.84),build=ease((dockQ-.12)/.73);
      const clothPoint={x:dockCat.x-28,y:dockCat.y+15};
      const boarded=['settle','depart','sea'].includes(phase),landing=phase==='settle'?Math.sin((t-k.boardingEnd)*7)*Math.exp(-(t-k.boardingEnd)*5):0;
      const raftWidth=T.raftWidth*scale*(journey?.88:1);
      A.wake(c,raftWidth,wakeTrailAt(f,t),journey?'home':'shore');
      if(t<k.departureStart&&!(dockQ>0&&dockQ<.92)){
        // 밧줄은 갑판·캐릭터 뒤의 깊이. 얼굴 앞을 지나가지 않는다.
        const loose=ease((t-k.boardingEnd)/(k.departureStart-k.boardingEnd));c.save();c.globalAlpha=1-loose;c.strokeStyle='#806447';c.lineWidth=2.5;c.beginPath();c.moveTo(journey?466:343,journey?699:562);c.quadraticCurveTo(journey?451:389,(journey?751:585)+loose*20,rx-55,ry-45);c.stroke();c.restore();
      }
      const settling=settlingAt(f,t);
      seat=A.raft(c,rx,ry,raftWidth,t,boarded,atSea?1:progress,{landing,arrival:t-k.boardingEnd,reflectionScene:journey?'home':'shore',wakeHandled:true,paddleTime:t-k.departureStart,paddleAmplitude:T.paddleAmplitude,book:f.storyIndex,settling,grip:settling.grip,drawCarry:carry,drawCat:actor,uncover:f.storyIndex===1&&!clothFold?uncover:1,clothProgress:clothFold?dockQ:undefined,clothDestination:{x:clothPoint.x-rx,y:clothPoint.y-ry},build:f.storyIndex===2?build:1});
      if(!clothFold&&f.storyIndex===1&&uncover===1){c.save();c.translate(clothPoint.x,clothPoint.y);const rw=T.raftWidth*(journey?.88:1);c.scale(.16,.12);c.drawImage(A.images.cloth,225,266,1090,520,-rw*.52,-rw*.22,rw*1.04,rw*.5);c.restore();}
      if(phase==='walk'){
        const p=clamp((t-k.prepareEnd)/(dockStart-k.prepareEnd));const travel=p<.12?p*p/.24:p>.88?1-(1-p)**2/.24:p-.06;
        const distanceWalked=walkPath(f).total*travel/.94,startSize=journey?(f.storyIndex===2?157:141):T.catSize,size=journey?mix(startSize,155,p):T.catSize,{x,y}=walkPathAt(f,distanceWalked);
        groundShadow(c,x,y,size,T.shadowAlpha);
        // 원화 순서·프레임 길이를 고쳐 결함을 숨기지 않는다. 실제 동선 거리와 보폭으로 캐릭터의 재생 위치를 구한다.
        const pose=t>=dockStart?(T.dockRig?{dockProgress:dockQ}:{reach:dockQ<.2?1:dockQ<.65?3:2}):{gaitTime:(t-k.prepareEnd)*.8,walkBlinkTime:(t-k.prepareEnd)%4.7-.9,travel:distanceWalked,stride:startSize*.4,rigStride:startSize*.27,rigSize:startSize,pathAtDistance:d=>walkPathAt(f,d)};
        carry(c,x,y,size,t,f.storyIndex);actorState=actor(c,x,y,size,t,Math.min(1,p/.1,(1-p)/.1),0,pose);catFoot={x,y};
        if(dockQ>0&&dockQ<.92){
          const hand=actorState?.hand||{x:x+size*(dockQ<.2?.28:dockQ<.65?.402:.229),y:y-size*(dockQ<.2?.057:dockQ<.65?.268:.197)},tie={x:rx-raftWidth*.27,y:ry-raftWidth*.06};
          c.save();c.strokeStyle='#8b7150';c.lineWidth=2;c.beginPath();c.moveTo(hand.x,hand.y);c.quadraticCurveTo((hand.x+tie.x)/2,(hand.y+tie.y)/2+13*(1-build),tie.x,tie.y);c.stroke();c.restore();
        }
      }else if(phase==='boarding'){
        const p=clamp((t-k.walkEnd)/(k.boardingEnd-k.walkEnd)),anticipation=T.anticipation;
        const start=dockCat;let x=start.x,y=start.y,lean=0;
        if(p<anticipation){const q=Math.sin(Math.PI*p/anticipation);if(CutsceneSettings.actorMode!=='poses')y+=q*4;lean=-q*.025;}
        else{const q=(p-anticipation)/(1-anticipation);x=mix(start.x,seat.x,ease(q));y=mix(start.y,seat.y,ease(q))-Math.sin(Math.PI*q)*T.jumpHeight;lean=-Math.sin(Math.PI*q)*.07;}
        const size=journey?155:T.catSize;
        groundShadow(c,x,mix(start.y,seat.y,ease(p)),size,T.shadowAlpha*.6);carry(c,x,y,size,t,f.storyIndex);actorState=actor(c,x,y,size,t,0,lean,{jump:p});catFoot={x,y};
      }else{catFoot={x:seat.x,y:seat.y};actorState=seat.actorState;}
    }
    c.restore();return{phase,catFoot,seat,scale,camera:cam,actorState};
  }
  const copy=[
    ['오늘 할 일은, 어제와 비슷해.','그래도 오늘은 같이 시작하고 싶어.','책 한 권과, 함께하고 싶은 마음.','함께할 곳으로, 한 걸음 더.','오늘은, 같이 시작해볼까.'],
    ['오래된 공책에서, 약속을 만났어.','함께 만들던 부두. 아직 기억나.','접어 둔 마음을 다시 펴고,','새로운 약속을 만나러 가.','이번에는, 어디에서 같이해볼까.'],
    ['모두의 배가 쉬어 갈 부두를 그렸어.','혼자 완성할 수는 없겠지만,','함께할 곳으로 갈 뗏목은 만들었어.','첫 조각은 만들었어.','그다음은, 같이 만들자.'],
  ];
  function caption(c,f,t){
    const k=f.timing,stops=[.4,k.prepareEnd*.51,k.prepareEnd+.25,k.departureStart+.25,k.seaStart+.3,24];
    const i=stops.findIndex((a,j)=>j<5&&t>=a&&(j===4?t<=stops[j+1]:t<stops[j+1]));
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
    if(!f)throw Error('알 수 없는 영상');const t=clamp(time,0,24);Object.assign(CutsceneSettings,{actorMode:'sprite',paddleRig:false,walkRig:false,...f.tuning,catSize:f.tuning.catSize,raftWidth:f.tuning.raftWidth,headMotion:f.tuning.headMotion,tailMotion:f.tuning.tailMotion,waveOpacity:f.tuning.waveAlpha,wakeOpacity:f.tuning.wakeAlpha});
    const c=canvas.getContext('2d');c.save();c.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);c.fillStyle='#eee8d7';c.fillRect(0,0,W,H);c.imageSmoothingQuality='high';
    const turning=f.directionId==='storybook'&&t>f.timing.prepareEnd-.44&&t<f.timing.prepareEnd+.51;
    const meta=turning?pageTurn(c,f,t):world(c,f,t);
    // 감정형은 준비를 마친 얼굴에서 부두의 다음 행동으로 바로 컷한다. 흰 섬광을 끼우지 않는다.
    if(f.directionId==='storybook'){c.strokeStyle='#f3e7ca';c.lineWidth=16;c.strokeRect(8,8,W-16,H-16);}
    const line=caption(c,f,t);c.restore();return{filmId:f.id,time:t,...meta,caption:line};
  }
  window.GachisupCinema={ready:Promise.all([A.ready,CutsceneSprites.ready,CutsceneRig.ready,CutscenePoses.load(),CutscenePaddleRig.ready,CutsceneWalkRig.ready]),render,duration:24,phaseAt,strokeTravel,boatAt,wakeTrailAt,preparationAt,settlingAt,walkPathAt};
})();
