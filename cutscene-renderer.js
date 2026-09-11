/* 결정론적 2D 컷신 소품. Figma 원본과 원본 기반 생성 동작을 구분한다. */
(() => {
  const W=720,H=1280, S=window.CutsceneSettings;
  const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const mix=(a,b,x)=>a+(b-a)*x;
  const gauss=(x,y,cx,cy,sx,sy)=>Math.exp(-((x-cx)**2/sx**2+(y-cy)**2/sy**2));
  const paths={room:'assets/cutscenes/room-v2.png',shore:'assets/cutscenes/shore-v2.png',sea:'assets/cutscenes/sea-v2.png',sand:'assets/cutscenes/sketch-beach.png',cat:'assets/figma-cats/black-standing.png',deck:'assets/cutscenes/raft-deck-v3.png',coastHome:'assets/cutscenes/coastal-home-pier-v3.png',notebook:'assets/cutscenes/notebook-open-v1.png',cloth:'assets/cutscenes/raft-cloth-v2.png',lookDown:'assets/cutscenes/poses-black/look-down-v1.png',lookReach:'assets/cutscenes/poses-black/look-reach-v1.png',lookHold:'assets/cutscenes/poses-black/look-hold-v1.png',lookPlace:'assets/cutscenes/poses-black/place-down-v1.png'};
  const captions=[
    [[0.5,3.5,'오늘 할 일은, 어제와 비슷해.'],[3.8,6.6,'그래도 오늘은 같이 시작하고 싶어.'],[7,10.6,'책 한 권을 싣고, 뗏목에 올라.'],[11,14.1,'함께할 곳으로, 한 걸음 더.'],[14.5,18,'오늘은, 같이 시작해볼까.']],
    [[0.5,3.5,'오래된 공책에서, 약속을 만났어.'],[3.8,6.6,'함께 만들던 부두. 아직 기억나.'],[7,10.6,'접어 둔 마음과 뗏목을 다시 펴.'],[11,14.1,'다음 이야기는 누구와 쓰게 될까.'],[14.5,18,'이번에는, 어디에서 같이해볼까.']],
    [[0.5,3.5,'모두의 배가 쉬어 갈 부두를 그렸어.'],[3.8,6.6,'혼자 완성할 수는 없겠지만,'],[7,10.6,'함께할 곳으로 갈 뗏목은 만들었어.'],[11,14.1,'첫 조각은 만들었어.'],[14.5,18,'그다음은, 같이 만들자.']],
  ];
  const images={};
  const ready=Promise.all(Object.entries(paths).map(([key,src])=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[key]=img;resolve();};img.onerror=()=>reject(new Error('컷신 에셋 로드 실패: '+src));img.src=src;})));
  function background(c,img,t){
    // 카메라는 world 전체에 적용한다. 바닥만 확대하면 서 있는 발과 소품이 미끄러진다.
    c.drawImage(img,0,0,W,H);
  }
  function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
  function waterMask(c,scene){
    if(scene!=='sea'){
      const edge=scene==='home'?[[720,280],[220,280],[350,380],[332,426],[391,485],[457,562],[490,644],[489,665],[489,812],[298,836],[268,912],[297,979],[340,1072],[480,1186],[562,1280],[720,1280]]:[[720,280],[244,280],[261,345],[136,390],[188,491],[399,535],[414,733],[176,800],[169,892],[233,994],[285,1090],[429,1180],[465,1280],[720,1280]];
      c.beginPath();edge.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
    }
  }
  function ripples(c,t,scene){
    c.save();c.globalAlpha=S.waveOpacity;c.strokeStyle='#fff4cc';c.lineWidth=1.4;waterMask(c,scene);
    for(let i=0;i<30;i++){
      const y=320+(i*73)%670, x=(i*197+Math.sin(t*.5+i)*10)%W;
      const len=10+(i*19)%42;c.globalAlpha=S.waveOpacity*(.4+.6*Math.sin(t+i)**2);
      c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+len*.5,y+2,x+len,y);c.stroke();
    }c.restore();
  }
  function wake(c,width,trail,scene){
    if(trail.length<2)return;c.save();waterMask(c,scene);c.lineWidth=1.8;c.lineCap='round';c.lineJoin='round';
    const speed=Math.hypot(trail[0].vx,trail[0].vy);c.globalAlpha=S.wakeOpacity*clamp(speed/35);
    for(const side of [-1,1]){
      const edge=trail.map(p=>{const v=Math.max(.001,Math.hypot(p.vx,p.vy)),r=width*(.29+p.age*.045);return{x:p.x-p.vy/v*r*side,y:p.y+width*.08+p.vx/v*r*side};});
      const first=edge[0],last=edge.at(-1),gradient=c.createLinearGradient(first.x,first.y,last.x+.01,last.y+.01);gradient.addColorStop(0,'#f4f2d4cc');gradient.addColorStop(.5,'#f4f2d488');gradient.addColorStop(1,'#f4f2d400');c.strokeStyle=gradient;
      c.beginPath();c.moveTo(first.x,first.y);for(let i=1;i<edge.length;i++){const a=edge[i-1],b=edge[i];c.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);}c.lineTo(last.x,last.y);c.stroke();
    }c.restore();
  }
  // 모래와 공책이 같은 계획을 보여 준다. 선 사이에는 펜을 드는 이동도 포함한다.
  const planStrokes=[
    [[-66,-9],[-30,-34],[16,-13],[-20,14],[-66,-9]],
    ...Array.from({length:4},(_,i)=>[[-57+i*9,-15-i*6],[-11+i*9,7-i*6]]),
    [[-66,-9],[-66,1]], [[-20,14],[-20,24]], [[16,-13],[16,-3]],
    [[-56,30],[-47,22],[-26,31],[-35,40],[-56,30]],
    [[-31,43],[-23,36],[-5,44],[-13,51],[-31,43]],
    [[37,-34],[63,-34],[63,-15],[37,-15],[37,-34]],
    [[41,-15],[41,-7]], [[59,-15],[59,-7]], [[42,-28],[57,-28]], [[42,-22],[51,-22]],
    [[26,26],[37,20],[51,22],[59,29],[49,35],[34,34],[26,26]],
    [[35,30],[49,24]], [[36,23],[49,31]],
    [[39,25],[37,18],[42,8],[43,17],[48,13],[49,22],[44,27]],
    // 작은 손글씨 '우리'. 글자도 선 끝과 함께 나타나도록 경로로 쓴다.
    Array.from({length:17},(_,i)=>[13+6*Math.cos(i/16*Math.PI*2),48+5*Math.sin(i/16*Math.PI*2)]),
    [[4,57],[22,57]], [[13,57],[13,65]],
    [[29,43],[39,43],[39,50],[29,50],[29,57],[39,57]], [[45,43],[45,65]],
  ];
  function islandPlan(c,x,y,size,progress=1,options={}){
    const segments=[];let previous=planStrokes[0][0],total=0;
    for(const stroke of planStrokes){
      const first=stroke[0],move=Math.hypot(first[0]-previous[0],first[1]-previous[1]);
      if(move){segments.push({a:previous,b:first,length:move*.35,pen:false});total+=move*.35;}
      for(let i=1;i<stroke.length;i++){const a=stroke[i-1],b=stroke[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push({a,b,length,pen:true});total+=length;}
      previous=stroke.at(-1);
    }
    let remaining=clamp(progress)*total,tip=planStrokes[0][0],pen=false;
    c.save();c.translate(x,y);c.scale(size,size);c.lineCap='round';c.lineJoin='round';
    c.beginPath();
    for(const segment of segments){
      if(remaining<=0)break;const q=clamp(remaining/segment.length),end=[mix(segment.a[0],segment.b[0],q),mix(segment.a[1],segment.b[1],q)];
      if(segment.pen){c.moveTo(...segment.a);c.lineTo(...end);}tip=end;pen=segment.pen;remaining-=segment.length;
    }
    if(options.sand){c.save();c.translate(0,1.2);c.strokeStyle='#fff1c2';c.lineWidth=3.6;c.stroke();c.restore();}
    c.strokeStyle=options.sand?'#917951':'#778673';c.lineWidth=options.sand?1.8:2;c.stroke();c.restore();
    return{x:x+tip[0]*size,y:y+tip[1]*size,pen};
  }
  function book(c,x,y,s,t,kind,options={}){
    let inkTip=null;
    c.save();c.translate(x,y);c.rotate(-.1+Math.sin(t*.4)*.012);c.scale(s,s);
    c.shadowColor='#30251926';c.shadowBlur=7;c.shadowOffsetY=4;
    const open=options.opening??1,flat=Math.cos((1-open)*Math.PI);
    // 왼쪽 표지를 책등에서 회전시킨다. 낱장의 회전축도 표지 안에 둔다.
    c.drawImage(images.notebook,810,116,728,749,0,-48,78,96);c.shadowColor='transparent';
    c.save();c.scale(flat,1);if(flat>=0)c.drawImage(images.notebook,82,116,728,749,-78,-48,78,96);c.restore();
    if(kind===0&&flat>0){c.save();c.scale(flat,1);c.strokeStyle='#aaa283';for(let i=0;i<5;i++){c.beginPath();c.moveTo(-56,-28+i*12);c.lineTo(-12,-28+i*12);c.stroke();}c.restore();c.fillStyle='#d99493';c.fillRect(36,-44,8,49);}
    else if(kind===2&&flat>0){
      c.save();c.scale(flat,1);const point=islandPlan(c,0,-7,.77,options.planProgress??1);inkTip=c.getTransform().transformPoint(point);c.restore();
    }
    else if(kind===1&&flat>0){
      c.save();c.globalAlpha*=1-(options.blank??0);c.scale(flat,1);
      c.strokeStyle='#73877b';c.lineWidth=2;c.beginPath();c.moveTo(-48,24);c.lineTo(-12,-4);c.lineTo(15,8);c.lineTo(-22,36);c.closePath();c.stroke();
      for(let i=0;i<4;i++){c.beginPath();c.moveTo(-40+i*8,18-i*6);c.lineTo(-14+i*8,30-i*6);c.stroke();}
      for(const [x,y] of [[-47,25],[-22,36],[14,8]]){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+9);c.stroke();}
      c.beginPath();c.ellipse(37,13,12,5,-.7,0,Math.PI*2);c.stroke();c.beginPath();c.ellipse(47,28,10,4,-.7,0,Math.PI*2);c.stroke();
      if(kind===1){for(const [px,py,color] of [[25,-27,'#bb9276'],[46,-18,'#889889'],[-26,-27,'#978a78']]){ellipse(c,px,py,5,4,color);for(let i=0;i<3;i++)ellipse(c,px-5+i*5,py-7,1.8,2.2,color);}}
      else{c.fillStyle='#796849';c.font='bold 13px system-ui';c.fillText('우리',18,38);}c.restore();
    }
    const turn=options.turn??0;
    if(turn>0&&turn<1&&open>.99){
      const angle=turn*Math.PI,edge=67*Math.cos(angle),lift=18*Math.sin(angle),shade=turn<.5?'#fff7df':'#eee0bc';
      c.save();c.shadowColor='#41331b24';c.shadowBlur=8*Math.sin(angle);c.shadowOffsetX=-5*Math.sin(angle);c.fillStyle=shade;c.strokeStyle='#c6b995';c.lineWidth=.8;
      c.beginPath();c.moveTo(0,-43);c.bezierCurveTo(edge*.38,-43-lift,edge*.8,-43-lift,edge,-43-lift*.5);c.lineTo(edge,43-lift*.5);c.bezierCurveTo(edge*.68,43-lift,edge*.18,43-lift,0,43);c.closePath();c.fill();c.stroke();c.restore();
    }
    if(flat<0){
      c.save();c.scale(-flat,1);c.fillStyle='#6d8291';c.strokeStyle='#69503c';c.lineWidth=1.7;c.beginPath();c.roundRect(0,-48,78,96,5);c.fill();c.stroke();c.strokeStyle='#90a0a5';c.lineWidth=.7;c.strokeRect(7,-40,63,80);c.restore();
    }
    c.restore();return inkTip;
  }
  // 원본을 격자로 변형한다. 새 눈·털·팔다리를 그려 넣지 않는다.
  function cat(c,x,foot,size,t,walk=0,lean=0,pose={}){
    c.save();c.translate(x,foot);c.rotate(lean);c.scale(size/220,size/220);c.translate(-110,-197);
    const deform=(u,v)=>{
      const head=gauss(u,v,124,70,72,60),tail=gauss(u,v,35,116,29,42);
      const paws=clamp((v-145)/45), phase=t*1.5;
      const footA=gauss(u,v,86,185,20,40),footB=gauss(u,v,142,185,22,40);
      const step=p=>{p=((p%1)+1)%1;return p<.62 ? [1-2*p/.62,0] : [-1+2*ease((p-.62)/.38),Math.sin((p-.62)/.38*Math.PI)];};
      const a=step(phase),b=step(phase+.5),stride=S.walkStride||15;
      const grip=(pose.grip||0)*gauss(u,v,155,180,20,36);
      const angle=pose.nod||0,neckX=u-123,neckY=v-131;
      const headX=(neckX*Math.cos(angle)-neckY*Math.sin(angle)-neckX)*head,headY=(neckX*Math.sin(angle)+neckY*Math.cos(angle)-neckY)*head;
      return [u+Math.sin(t*1.2)*S.headMotion*head+Math.sin(t*1.9)*S.tailMotion*tail+walk*stride*(a[0]*footA+b[0]*footB)*paws+grip*4+headX,
        v-Math.sin(t*1.5)*.6*head-walk*10*(a[1]*footA+b[1]*footB)-grip*20+headY];
    };
    const tri=(src,dst)=>{
      const [a,b,d]=src,[p,q,r]=dst,den=(b[0]-a[0])*(d[1]-a[1])-(d[0]-a[0])*(b[1]-a[1]);
      const A=((q[0]-p[0])*(d[1]-a[1])-(r[0]-p[0])*(b[1]-a[1]))/den;
      const B=((q[1]-p[1])*(d[1]-a[1])-(r[1]-p[1])*(b[1]-a[1]))/den;
      const C=((r[0]-p[0])*(b[0]-a[0])-(q[0]-p[0])*(d[0]-a[0]))/den;
      const D=((r[1]-p[1])*(b[0]-a[0])-(q[1]-p[1])*(d[0]-a[0]))/den;
      c.save();c.beginPath();const center=[(p[0]+q[0]+r[0])/3,(p[1]+q[1]+r[1])/3];
      [p,q,r].forEach((v,i)=>{const dx=v[0]-center[0],dy=v[1]-center[1],len=Math.hypot(dx,dy)||1;const vx=v[0]+dx/len*.45,vy=v[1]+dy/len*.45;i?c.lineTo(vx,vy):c.moveTo(vx,vy);});c.closePath();c.clip();
      c.transform(A,B,C,D,p[0]-A*a[0]-C*a[1],p[1]-B*a[0]-D*a[1]);
      if(pose.texture){const {image,rect}=pose.texture;c.drawImage(image,rect.x,rect.y,rect.w,rect.h,0,0,220,220);}else c.drawImage(images.cat,0,0);c.restore();
    };
    for(let j=0;j<16;j++)for(let i=0;i<16;i++){
      const a=[i*13.75,j*13.75],b=[(i+1)*13.75,j*13.75],d=[i*13.75,(j+1)*13.75],e=[(i+1)*13.75,(j+1)*13.75];
      tri([a,b,d],[deform(...a),deform(...b),deform(...d)]);tri([b,e,d],[deform(...b),deform(...e),deform(...d)]);
    }c.restore();
  }
  function raft(c,x,y,width,t,onboard,travel,options={}){
    const land=options.landing||0,bob=Math.sin(t*1.7)*1.8+land*3, tilt=Math.sin(t*1.2)*.012+land*.025;
    c.save();c.translate(x,y+bob);c.rotate(tilt);
    ellipse(c,0,31,width*.42,28,'#254f5140');
    if(travel>0&&!options.wakeHandled){c.save();c.globalAlpha=S.wakeOpacity*travel;c.strokeStyle='#f8f9df';c.lineWidth=2.3;
      for(let i=0;i<4;i++){let p=(t*.5+i/4)%1;c.beginPath();c.ellipse(-width*.2-p*45,36,width*(.34+p*.12),12+p*18,0,.25,2.7);c.stroke();}c.restore();}
    // 1536 × 1024 원화의 배치 좌표. 런타임 알파 분석 없이 고정된 원화 영역을 쓴다.
    const deck=()=>c.drawImage(images.deck,270,280,1000,455,-width/2,-width*.22,width,width*.455);
    const build=options.build??1;
    if(build<1){
      const plank=[[489,369],[587,346],[912,565],[906,627],[790,663],[784,596]],points=plank.map(([px,py])=>[(px-270)/1000*width-width/2,(py-280)/1000*width-width*.22]);
      const shape=()=>{points.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();};
      c.save();c.beginPath();c.rect(-width,-width,width*2,width*2);shape();c.clip('evenodd');deck();c.restore();
      c.save();c.translate(-14*(1-build),-9*(1-build));c.rotate(-.13*(1-build));c.beginPath();shape();c.clip();deck();c.restore();
    }else deck();
    const uncover=options.uncover??1;
    if(uncover<1){
      const destination=options.clothDestination||{x:-width*.54,y:-width*.18};
      c.save();c.translate(destination.x*uncover,destination.y*uncover-Math.sin(uncover*Math.PI)*30);c.scale(1-.84*uncover,1-.88*uncover);
      c.drawImage(images.cloth,225,266,1090,520,-width*.52,-width*.22,width*1.04,width*.5);c.restore();
    }
    c.save();c.scale(width/S.raftWidth,width/S.raftWidth);
    let actorState=null;
    if(onboard){
      const unpack=options.unpack===undefined?1:options.unpack,settling=options.settling,put=settling?.put??ease(unpack/.58),open=settling?.open??ease((unpack-.58)/.42),lift=settling?.lift??open,place=settling?.place??open;
      // 손이 닿는 오른쪽에 가방을 놓는다. 책은 가방 입구→앞발→가까운 갑판 순서로 연결한다.
      const bagX=mix(0,14,put),bagY=mix(-5,52,put);
      const drawBag=()=>{if(options.drawCarry)options.drawCarry(c,bagX,bagY,S.catSize,t,options.book,1,{worn:put<.2,empty:lift>=1,open:put*(1-place)});};
      if(options.book!==undefined&&put<.65)drawBag();
      ellipse(c,1,-4,37,10,'#4b3f3529');
      const recovering=S.actorMode==='poses'&&options.arrival>=0&&options.arrival<.22;
      const handling=settling&&settling.elapsed>=.24&&settling.elapsed<1.3,handlingPose=put<.45?'hold':lift<.4?'reach':place<.15?'hold':'place';
      actorState=(options.drawCat||cat)(c,0,-5,S.catSize,t,0,Math.sin(t*1.2)*-.007,recovering?{jump:1+options.arrival}:handling?{look:handlingPose}:!settling&&unpack>.03&&unpack<1?{look:'reach'}:{grip:options.grip||0});
      if(options.book!==undefined){
        if(lift>0){
          const bx=mix(mix(54,44,lift),10,place),by=mix(mix(2,-29,lift),18,place);
          c.save();if(lift<1){c.beginPath();c.rect(-200,-400,400,402);c.clip();}c.translate(bx,by);c.scale(1,mix(1,.57,place));book(c,-39*.31*(1-open),0,.31,t,options.book,{opening:open});c.restore();
        }
        if(put>=.65)drawBag();
      }
    }
    const grip=options.grip||0,paddleTime=options.paddleTime??t,cycle=((paddleTime/2.8)%1+1)%1;
    const stroke=cycle<.64?ease(cycle/.64):1-ease((cycle-.64)/.36);
    // 당겨 젓는 동안은 물에, 복귀할 때는 손목을 돌려 노 끝을 수면 위로 들어 올린다.
    const returnLift=cycle<.64?0:Math.sin((cycle-.64)/.36*Math.PI),paddleAngle=-1.02+stroke*.39-returnLift*.64;
    const poseScale=.300488*S.catSize/384,defaultHand=S.actorMode==='poses'?{x:(1035-670.218)*poseScale,y:-5+(938-1142)*poseScale}:{x:40,y:-37};
    const hand=actorState?.hand||defaultHand,paddleX=mix(-34,hand.x,grip),paddleY=mix(2,hand.y,grip);
    c.save();c.translate(paddleX,paddleY);c.rotate(mix(-1.18,paddleAngle,grip));c.strokeStyle='#68523d';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(0,-8);c.lineTo(0,136);c.stroke();c.fillStyle='#b79869';c.beginPath();c.roundRect(-8,121,16,41,7);c.fill();c.stroke();c.restore();
    // 힘을 주는 반 주기에만 노 끝과 같은 위치에 물결을 둔다.
    if(onboard&&travel>0&&cycle<.64){
      const wet=Math.sin(cycle/.64*Math.PI),tipX=paddleX-Math.sin(paddleAngle)*154,tipY=paddleY+Math.cos(paddleAngle)*154;
      c.save();c.globalAlpha=wet*.5;c.strokeStyle='#f6efcf';c.lineWidth=1.8;c.beginPath();c.ellipse(tipX,tipY,12+wet*10,4+wet*3,-.1,0,Math.PI*2);c.stroke();c.restore();
    }
    c.restore();c.restore();
    return {x:x+5*width/S.raftWidth*Math.sin(tilt),y:y+bob-5*width/S.raftWidth*Math.cos(tilt),actorState,paddle:{cycle,stroke,returnLift,angle:paddleAngle,pivot:{x:paddleX,y:paddleY},grip}};
  }
  function scene(c,id,t){
    if(t<6.7){
      if(id===2){
        c.save();c.translate(360,610);c.scale(1.8,1.8);c.translate(-220,-895);
        background(c,images.shore,t);ripples(c,t,'shore');
        ellipse(c,72,989,24,5,'#45372b25');cat(c,72,988,116,t);
        c.save();c.strokeStyle='#9c8054';c.lineWidth=1.7;c.lineCap='round';
        const points=[[59,1055],[85,1024],[147,1044],[121,1074],[59,1055]];
        const steps=Math.min(points.length,Math.floor(t*1.8)+1);c.beginPath();points.slice(0,steps).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
        for(let i=0;i<Math.min(6,Math.floor(t*2));i++){c.beginPath();c.moveTo(77+i*10,1040+i*3);c.lineTo(66+i*10,1055+i*3);c.stroke();}
        c.fillStyle='#705a3b';c.font='600 12px system-ui';if(t>2.2)c.fillText('우리',98,1090);c.restore();
        book(c,131,996,.34,t,2);c.restore();
        return {scene:'sand-sketch',cat:{x:295,y:606},boarded:false};
      }
      background(c,images.room,t);const a=ease(t/1.2);c.globalAlpha=a;
      if(id===1){
        ellipse(c,498,844,62,14,'#45372b30');cat(c,498,842,244,t);
        book(c,307,848,1.9,t,id);c.globalAlpha=1;
        c.save();c.globalAlpha=.075;c.fillStyle='#dcc299';c.fillRect(0,0,W,H);c.restore();
        return {scene:'old-notebook',cat:{x:498,y:842},boarded:false};
      }
      ellipse(c,466,868,62,14,'#45372b30');cat(c,466,866,244,t);
      book(c,371,903,1.08,t,id);c.globalAlpha=1;
      if(id===1){c.save();c.globalAlpha=.09; c.fillStyle='#dcc299';c.fillRect(0,0,W,H);c.restore();}
      if(id===2){c.save();c.globalAlpha=ease((t-2)/1.4);c.strokeStyle='#b39a6b';c.lineWidth=3;c.beginPath();c.moveTo(288,931);c.lineTo(430,920);c.stroke();c.restore();}
      return {scene:'room',cat:{x:466,y:866},boarded:false};
    }
    if(t<13.8){
      background(c,images.shore,t);ripples(c,t,'shore');
      const depart=ease((t-S.departureStart)/(13.8-S.departureStart));
      const rx=mix(481,558,depart),ry=mix(657,540,depart),rw=S.raftWidth*(1-.14*depart);
      const on=t>=S.boardingEnd;const seat=raft(c,rx,ry,rw,t,on,depart);
      if(t<S.boardingStart){
        const p=ease((t-6.7)/(S.boardingStart-6.7));const x=mix(103,326,p),y=mix(627,587,p);
        ellipse(c,x,y+1,35,8,'#47372b35');cat(c,x,y,S.catSize,t,Math.sin(Math.PI*p));
        return {scene:'shore',cat:{x,y},boarded:false,raft:seat};
      }
      if(!on){
        const p=clamp((t-S.boardingStart)/(S.boardingEnd-S.boardingStart)),x=mix(326,seat.x,ease(p)),y=mix(587,seat.y,ease(p))-Math.sin(Math.PI*p)*S.jumpHeight;
        ellipse(c,x,mix(587,seat.y,ease(p))+4,30-8*Math.sin(Math.PI*p),7,'#47372b27');
        cat(c,x,y,S.catSize,t,0,-Math.sin(p*Math.PI)*.065);
        return {scene:'boarding',cat:{x,y},boarded:false,raft:seat};
      }
      return {scene:'departure',cat:seat,boarded:true,raft:seat};
    }
    background(c,images.sea,t);ripples(c,t,'sea');const p=ease((t-13.8)/4.2);
    const seat=raft(c,mix(395,375,p),mix(721,650,p),S.raftWidth*(.96-p*.1),t,true,1);
    return {scene:'sea',cat:seat,boarded:true,raft:seat};
  }
  function render(canvas,id,time){
    const c=canvas.getContext('2d');c.save();c.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);c.clearRect(0,0,W,H);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    const t=clamp(time,0,S.duration),meta=scene(c,id,t);
    // 짧은 디졸브 대신 밝은 숨 고르기. 서로 다른 배경의 부두가 겹치지 않는다.
    for(const point of [6.7,13.8]){const a=clamp(1-Math.abs(t-point)/.22)*.92;if(a){c.fillStyle=`rgba(249,243,225,${a})`;c.fillRect(0,0,W,H);}}
    const line=captions[id].find(([a,b])=>t>=a&&t<=b);
    if(line){const [a,b,txt]=line,alpha=Math.min(ease((t-a)/.3),b===18?1:ease((b-t)/.3));c.save();c.globalAlpha=alpha;
      const gradient=c.createLinearGradient(0,S.captionY-100,0,H);gradient.addColorStop(0,'rgba(29,48,44,0)');gradient.addColorStop(.55,`rgba(29,48,44,${S.captionShade})`);gradient.addColorStop(1,'rgba(29,48,44,.93)');c.fillStyle=gradient;c.fillRect(0,S.captionY-100,W,H-S.captionY+100);
      c.fillStyle='#fff9e9';c.textAlign='center';c.textBaseline='middle';c.font=`600 ${S.captionSize}px system-ui, sans-serif`;c.fillText(txt,W/2,S.captionY,W-90);c.restore();}
    c.restore();return {...meta,time:t,revision:S.revision};
  }
  window.GachisupCutscene={ready,render,paths,duration:S.duration};
  window.CutsceneActors={ready,images,paths,background,ellipse,cat,book,islandPlan,raft,ripples,wake,clamp,ease,mix};
})();
