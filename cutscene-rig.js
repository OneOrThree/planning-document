/* 생성 파츠를 관절로 연결하는 Canvas 2D 실험. Figma 벡터 리깅 원본은 아니다. */
(() => {
  const images={},bounds={head:[210,239,945,809],torso:[390,433,474,429],leg:[297,474,282,836],tail:[409,385,436,533]};
  bounds.headDown=bounds.head;bounds.headClosed=bounds.head;
  const names={head:'head',headDown:'head-down',headClosed:'head-closed',torso:'torso',leg:'front-leg',tail:'tail'};
  const ready=Promise.all(Object.entries(names).map(([key,name])=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>{images[key]=i;resolve();};i.onerror=()=>reject(Error('고양이 관절 파츠 로드 실패: '+name));i.src='assets/cutscenes/rig-black/'+name+'.png';})));
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  const mix=(a,b,t)=>a+(b-a)*t;
  function part(c,key,x,y,w,h){const b=bounds[key];c.drawImage(images[key],...b,x,y,w,h);}
  function leg(c,hip,foot,width,side){
    const l1=28,l2=27,dx=foot.x-hip.x,dy=foot.y-hip.y,d=Math.max(.001,Math.min(54.8,Math.hypot(dx,dy)));
    const along=(l1*l1-l2*l2+d*d)/(2*d),off=Math.sqrt(Math.max(0,l1*l1-along*along));
    const ux=dx/(Math.hypot(dx,dy)||1),uy=dy/(Math.hypot(dx,dy)||1);
    const knee={x:hip.x+ux*along+uy*off*side,y:hip.y+uy*along-ux*off*side};
    const b=bounds.leg;
    function segment(from,to,start,end,w){
      const length=Math.hypot(to.x-from.x,to.y-from.y);c.save();c.translate(from.x,from.y);c.rotate(-Math.atan2(to.x-from.x,to.y-from.y));
      c.drawImage(images.leg,b[0],b[1]+b[3]*start,b[2],b[3]*(end-start),-w/2,-3,w,length+6);c.restore();
    }
    segment(hip,knee,0,.57,width*.89);segment(knee,foot,.45,1,width);
  }
  function draw(c,x,foot,size,t,options={}){
    const walk=options.walk||0,grip=options.grip||0,phase=options.gaitTime??t*.8;
    const step=(offset)=>{const p=((phase+offset)%1+1)%1;return p<.62?{x:10-20*p/.62,y:0}:{x:mix(-10,10,ease((p-.62)/.38)),y:-8*Math.sin((p-.62)/.38*Math.PI)};};
    let crouch=0,tuck=0;if(options.jump!==undefined){const q=options.jump;crouch=q<.24?Math.sin(q/.24*Math.PI)*5:0;tuck=q>.24&&q<.83?Math.sin((q-.24)/.59*Math.PI):0;}
    const bodyY=crouch-walk*Math.sin(phase*Math.PI*4)*.9,headY=Math.sin(t*1.5)*.4;
    c.save();c.translate(x,foot);c.rotate(options.lean||0);c.scale(size/220,size/220);c.translate(-110,-197);
    const defs=[{hip:[94,146],foot:[94,194],phase:.25,width:24,side:1},{hip:[137,142],foot:[138,194],phase:.5,width:26,side:-1},{hip:[82,144],foot:[81,197],phase:.75,width:30,side:1},{hip:[116,142],foot:[115,197],phase:0,width:33,side:-1}];
    function drawLeg(n){const d=defs[n],s=step(d.phase),h={x:d.hip[0],y:d.hip[1]+bodyY};
      const f={x:d.foot[0]+s.x*walk+tuck*(n>1?11:-6),y:d.foot[1]+s.y*walk-tuck*10};
      if(n===1){f.x=mix(f.x,155,grip);f.y=mix(f.y,169,grip);}
      leg(c,h,f,d.width,d.side);return f;
    }
    drawLeg(0);drawLeg(1);drawLeg(2);drawLeg(3);
    c.save();c.translate(77,148+bodyY);c.rotate(Math.sin(t*1.45)*.045-walk*.045);part(c,'tail',-56,-67,62,76);c.restore();
    part(c,'torso',68,113+bodyY,99,77);
    c.save();c.beginPath();c.rect(0,166+bodyY,220,60);c.clip();drawLeg(2);drawLeg(3);c.restore();
    // 잡는 앞발은 몸통 위에 다시 그려 손잡이에 닿는 실루엣을 보장한다.
    if(grip>.01)drawLeg(1);
    const blink=t%5.2,head=blink>=3.65&&blink<3.77?'headClosed':(options.nod||0)>.06?'headDown':'head';
    c.save();c.translate(124,129+bodyY+headY);c.rotate((options.nod||0)+Math.sin(t*.8)*.006);part(c,head,-66,-108,140,120);c.restore();
    c.restore();return{mode:'layered-rig',hand:{x:x+(155-110)*size/220,y:foot+(169-197)*size/220}};
  }
  window.CutsceneRig={ready,draw,bounds};
})();
