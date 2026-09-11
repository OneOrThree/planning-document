/* 걷기 전용 원화 + 20관절 가중치 메시. 보행 위상은 시간이 아니라 이동 거리로 진행한다. */
(() => {
  'use strict';
  const TAU = Math.PI * 2, STRIDE = 74;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const ellipse = (x, y, cx, cy, rx, ry) => 1 - smooth(.35, 1, Math.hypot((x-cx)/rx, (y-cy)/ry));
  const identity = () => [1, 0, 0, 1, 0, 0];
  const multiply = (a, b) => [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]];
  const point = (m, [x, y]) => [m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5]];
  function transform(angle, [x,y], dx=0, dy=0) { const r=angle*Math.PI/180, c=Math.cos(r), s=Math.sin(r); return [c,s,-s,c,x-c*x+s*y+dx,y-s*x-c*y+dy]; }
  const hierarchy = {
    root:[null,'기준',0], pelvis:['root','골반',4], body:['pelvis','몸통',4], head:['body','머리',4],
    earL:['head','왼쪽 귀',8], earR:['head','오른쪽 귀',8],
    armL:['body','왼팔',12], forearmL:['armL','왼쪽 팔꿈치',12], pawL:['forearmL','왼쪽 앞발',8],
    armR:['body','오른팔',12], forearmR:['armR','오른쪽 팔꿈치',12], pawR:['forearmR','오른쪽 앞발',8],
    thighL:['pelvis','왼쪽 다리',16], shinL:['thighL','왼쪽 무릎',24], footL:['shinL','왼쪽 발목',18],
    thighR:['pelvis','오른쪽 다리',16], shinR:['thighR','오른쪽 무릎',24], footR:['shinR','오른쪽 발목',18],
    tail:['pelvis','꼬리',8], tailTip:['tail','꼬리 끝',8]
  };
  const names=Object.keys(hierarchy);
  const views = {
    front:{src:'assets/momo-walk-front.png', anchor:[470,956], pivots:[[470,920],[473,790],[470,675],[465,524],[280,190],[640,232],[285,540],[235,610],[224,668],[607,572],[571,669],[552,723],[347,786],[353,831],[346,866],[580,810],[574,880],[554,933],[709,747],[836,643]]},
    back:{src:'assets/momo-walk-back.png', anchor:[508,944], pivots:[[508,920],[507,808],[527,680],[530,510],[379,168],[708,226],[357,522],[330,565],[328,588],[691,558],[728,613],[745,659],[407,788],[404,837],[404,873],[593,810],[601,876],[601,923],[388,743],[210,644]]}
  };
  function polygonWeight(x,y,poly,feather=12){let inside=false,dist=Infinity;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [ax,ay]=poly[i],[bx,by]=poly[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;const dx=bx-ax,dy=by-ay,t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1),0,1);dist=Math.min(dist,Math.hypot(x-ax-t*dx,y-ay-t*dy));}return inside?1:1-smooth(0,Math.max(1,feather),dist);}
  function weightsAt(x,y,view){
    const w=Array(names.length).fill(0);w[0]=1;
    const put=(name,value)=>{const v=clamp(value,0,1);for(let i=0;i<w.length;i++)w[i]*=1-v;w[names.indexOf(name)]+=v;};
    const back=view==='back', pivots=views[view].pivots;
    put('pelvis',1);put('body',1-smooth(688,835,y));put('head',1-smooth(490,568,y));
    for(const side of ['L','R']){
      const ear=pivots[names.indexOf('ear'+side)];put('ear'+side,ellipse(x,y,ear[0],ear[1]-90,135,145));
      const arm=pivots[names.indexOf('forearm'+side)],paw=pivots[names.indexOf('paw'+side)];
      const armWeight=ellipse(x,y,arm[0],arm[1],side==='L'?62:100,125)*smooth(489,550,y);
      put('arm'+side,armWeight);put('forearm'+side,armWeight*smooth(arm[1]-35,paw[1],y)*.75);put('paw'+side,ellipse(x,y,paw[0],paw[1],55,55)*armWeight*.65);
      const hip=pivots[names.indexOf('thigh'+side)],knee=pivots[names.indexOf('shin'+side)],foot=pivots[names.indexOf('foot'+side)];
      const half=side==='L'?1-smooth(back?458:423,back?504:490,x):smooth(back?458:423,back?504:490,x);
      const leg=half*smooth(hip[1]-55,hip[1]+25,y);put('thigh'+side,leg);put('shin'+side,leg*smooth(hip[1],knee[1]+20,y));put('foot'+side,leg*smooth(knee[1]+8,foot[1],y));
    }
    const tail=back?polygonWeight(x,y,[[118,584],[220,553],[299,610],[328,673],[385,702],[429,715],[426,766],[377,794],[284,801],[201,773],[140,720],[106,654]]):smooth(685,725,x)*smooth(510,568,y);
    put('tail',tail);const tip=pivots[names.indexOf('tailTip')];put('tailTip',tail*ellipse(x,y,tip[0],tip[1],145,155)*.7);
    return w;
  }
  function makeMesh(view,weightFunction=weightsAt){const grid=48,positions=[],uv=[],weights=[],indices=[];for(let y=0;y<=grid;y++)for(let x=0;x<=grid;x++){positions.push(x/grid*1000,y/grid*1000);uv.push(x/grid,y/grid);weights.push(weightFunction(x/grid*1000,y/grid*1000,view));}for(let y=0;y<grid;y++)for(let x=0;x<grid;x++){const a=y*(grid+1)+x,b=a+1,c=a+grid+1;indices.push(a,c,b,b,c,c+1);}return {grid,positions:new Float32Array(positions),uv:new Float32Array(uv),weights,indices:new Uint16Array(indices)};}
  const meshes={front:makeMesh('front'),back:makeMesh('back')};
  const profiles=new WeakMap();
  function prepareProfile(profile){
    if(profiles.has(profile))return profiles.get(profile);
    const keys=Object.keys(profile.hierarchy),output={views:{},meshes:{}};
    for(const view of ['front','back']){
      const entry=profile.views[view];output.views[view]={...entry,pivots:Array.isArray(entry.pivots)?entry.pivots:keys.map(key=>entry.pivots[key])};
      output.meshes[view]=makeMesh(view,(x,y)=>{const weights=keys.map((_,i)=>i===0?1:0);for(const region of entry.regions){const index=keys.indexOf(region.bone);if(index<0)continue;const value=clamp(polygonWeight(x,y,region.polygon,region.feather)*(region.strength??1),0,1);for(let i=0;i<weights.length;i++)weights[i]*=1-value;weights[index]+=value;}return weights;});
    }
    profiles.set(profile,output);return output;
  }
  const instances=new Set(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,last=0;const assets=new Map();
  const loadImage=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('걷기 원화를 불러오지 못했어요.'));img.src=src;});
  function loop(now){const dt=last?Math.min((now-last)/1000,.06):0;last=now;for(const rig of instances){if(!rig.loaded||rig.paused||!rig.visible||document.hidden||(reduced.matches&&!rig.motionOptIn))continue;rig.time+=dt;rig.blend+=(Number(rig.walking)-rig.blend)*(1-Math.exp(-dt*15));if(rig.preview&&rig.walking)rig.distance+=dt*rig.speed;rig.render();}frame=instances.size?requestAnimationFrame(loop):0;}
  function shader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
  class WalkRig {
    constructor(container,options={}){
      this.profile=options.profile||null;this.hierarchy=this.profile?.hierarchy||hierarchy;this.names=Object.keys(this.hierarchy);this.views=this.profile?prepareProfile(this.profile).views:views;this.meshes=this.profile?prepareProfile(this.profile).meshes:meshes;this.stride=this.profile?.stride||STRIDE;this.gait=this.profile?.gait||{};
      const rigNames=this.names,rigHierarchy=this.hierarchy,rigViews=this.views;
      this.container=container;this.view='front';this.flip=false;this.direction='sw';this.distance=0;this.time=0;this.speed=100;this.blend=0;this.walking=false;this.preview=!!options.preview;this.paused=false;this.visible=true;this.motionOptIn=false;this.overrides={};this.matrices={};this.loaded=false;this.destroyed=false;this.debug=false;this.resolution=options.resolution||512;
      if(!this.profile)container.style.removeProperty('--walk-palette');
      container.classList.add('momo-walk-host');container.dataset.walkState='loading';container.dataset.walkCharacter=this.profile?.id||'momo';container.innerHTML=`<span class="walk-shadow"></span><div class="walk-art"><img class="walk-fallback" src="${rigViews.front.src}" alt="산책하는 ${this.profile?.label||'모모'}"><canvas class="walk-canvas" role="img" aria-label="양발과 팔을 움직이며 걷는 ${this.profile?.label||'모모'}"></canvas><svg class="walk-guides" viewBox="0 0 1000 1000" aria-hidden="true"><path class="walk-mesh"/>${rigNames.map(name=>`<g data-walk-bone="${name}"><path/><circle r="5"/><text x="8" y="-8">${rigHierarchy[name][1]}</text></g>`).join('')}</svg></div>`;
      this.art=container.querySelector('.walk-art');this.canvas=container.querySelector('canvas');this.canvas.width=this.canvas.height=this.resolution;this.positions=new Float32Array(this.meshes.front.positions.length);this.fallback=container.querySelector('img');
      this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;});this.observer.observe(container);
      const assetKey=rigViews.front.src+'|'+rigViews.back.src;if(!assets.has(assetKey))assets.set(assetKey,Promise.all([loadImage(rigViews.front.src),loadImage(rigViews.back.src)]));
      this.ready=assets.get(assetKey).then(images=>{if(this.destroyed)return;this.images=images;this.initialize();this.loaded=true;container.dataset.walkState='ready';this.render();}).catch(error=>{if(this.destroyed)return;this.error=error.message;container.dataset.walkState='fallback';});
      this.onLost=e=>{e.preventDefault();this.loaded=false;container.dataset.walkState='fallback';};this.onRestored=()=>{if(this.destroyed)return;try{this.initialize();this.loaded=true;container.dataset.walkState='ready';this.render();}catch(error){this.error=error.message;}};
      this.canvas.addEventListener('webglcontextlost',this.onLost);this.canvas.addEventListener('webglcontextrestored',this.onRestored);
      this.setDirection('sw');this.setWalking(false);instances.add(this);if(!frame){last=0;frame=requestAnimationFrame(loop);}
    }
    initialize(){
      const meshes=this.meshes;
      const gl=this.canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:true});if(!gl)throw new Error('WebGL 미지원 · 정지 원화로 표시합니다.');this.gl=gl;
      const vs=shader(gl,gl.VERTEX_SHADER,'attribute vec2 aPosition;attribute vec2 aUV;varying vec2 vUV;void main(){vUV=aUV;gl_Position=vec4(aPosition.x/500.0-1.0,1.0-aPosition.y/500.0,0.0,1.0);}');
      const fs=shader(gl,gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 vUV;uniform sampler2D uTexture;void main(){vec4 c=texture2D(uTexture,vUV);gl_FragColor=vec4(c.rgb*c.a,c.a);}');
      const program=gl.createProgram();this.program=program;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
      this.positionBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.positionBuffer);gl.bufferData(gl.ARRAY_BUFFER,this.positions,gl.DYNAMIC_DRAW);const position=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      this.uvBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);gl.bufferData(gl.ARRAY_BUFFER,meshes.front.uv,gl.STATIC_DRAW);const uv=gl.getAttribLocation(program,'aUV');gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
      this.indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,meshes.front.indices,gl.STATIC_DRAW);
      this.textures=this.images.map(img=>{const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);const upload=document.createElement('canvas');upload.width=upload.height=1024;const ctx=upload.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,1024,1024);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,upload);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.generateMipmap(gl.TEXTURE_2D);return texture;});
      gl.uniform1i(gl.getUniformLocation(program,'uTexture'),0);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
    }
    setDirection(direction){
      if(!['sw','se','nw','ne'].includes(direction))return;
      const views=this.views;
      this.direction=direction;this.view=direction[0]==='n'?'back':'front';this.flip=direction==='se'||direction==='nw';
      this.fallback.src=views[this.view].src;
      const [x,y]=views[this.view].anchor;
      // 시점이 바뀌어도 두 발 사이의 지면 기준점은 그대로다. 좌우 반전은 이름표와 분리한다.
      this.art.style.transform=`translate(${50-(this.flip?1000-x:x)/10}%,${96-y/10}%) scaleX(${this.flip?-1:1})`;
      this.container.dataset.direction=direction;this.render();
      if(this.profile)this.container.style.setProperty('--walk-palette',views[this.view].palette||'none');
    }
    face(dx,dy){const length=Math.hypot(dx,dy);if(length<.001)return;const north=Math.abs(dy)/length<.16?this.direction[0]==='n':dy<0;const east=Math.abs(dx)/length<.12?this.direction[1]==='e':dx>0;const direction=(north?'n':'s')+(east?'e':'w');if(direction!==this.direction)this.setDirection(direction);}
    setWalking(on){this.walking=!!on;this.container.dataset.motion=on?'walk':'idle';if(reduced.matches&&!this.motionOptIn){this.blend=0;this.render();}}
    advance(distance,dx,dy){if(!Number.isFinite(distance)||distance<0)return;this.face(dx,dy);this.distance+=distance;this.render();}
    play(){this.paused=false;this.motionOptIn=true;}
    seek(cycle){this.distance=clamp(Number(cycle)||0,0,1)*this.stride;this.blend=this.walking?1:0;this.render();}
    setBone(name,value){if(!this.hierarchy[name]||!Number.isFinite(Number(value)))return;const limit=this.hierarchy[name][2];this.overrides[name]=clamp(Number(value),-limit,limit);this.render();}
    setDebug(on){this.debug=!!on;this.container.classList.toggle('show-walk-bones',this.debug);this.render();}
    render(){
      if(!this.loaded||this.destroyed)return;
      const names=this.names,hierarchy=this.hierarchy,views=this.views,meshes=this.meshes,gait=this.gait;
      const phase=this.distance/this.stride*TAU, a=this.blend, swing=Math.sin(phase), bob=(Math.cos(phase*2)-1)*(gait.bob??3.4)*a, breath=Math.sin(this.time*1.5)*(1-a), back=this.view==='back';
      const angles={root:0,pelvis:swing*1.25*a,body:-swing*.9*a,head:-swing*.6*a+breath*.2,earL:Math.sin(phase-.3)*a*.8+breath*.35,earR:Math.sin(phase-.6)*a*.7,armL:-swing*9*a,forearmL:(1-Math.cos(phase))*2*a,pawL:swing*2*a,armR:swing*9*a,forearmR:(1+Math.cos(phase))*2*a,pawR:-swing*2*a,tail:Math.sin(phase-.8)*3*a+Math.sin(this.time*.9)*1.2*(1-a),tailTip:Math.sin(phase-1.4)*3.5*a};
      if(this.profile){angles.armL=-swing*(gait.arm??6)*a;angles.armR=-angles.armL;angles.earL=Math.sin(phase-.3)*a*(gait.ear??.8)+breath*.35;angles.earR=Math.sin(phase-.6)*a*(gait.ear??.8);angles.tail=Math.sin(phase-.8)*(gait.tail??2)*a+Math.sin(this.time*.9)*.7*(1-a);angles.tailTip=Math.sin(phase-1.4)*(gait.tail??2)*a;}
      const pivots=views[this.view].pivots;this.footLift={};
      for(const side of ['L','R']){const p=phase+(side==='R'?Math.PI:0),s=Math.sin(p),lift=Math.max(0,s)*a;this.footLift[side]=lift*(gait.stepLift??27);angles['thigh'+side]=s*(gait.thigh??10)*a;angles['shin'+side]=lift*(back?-1:1)*(gait.knee??15);angles['foot'+side]=-angles['thigh'+side]-angles['shin'+side];}
      for(let i=0;i<names.length;i++){
        const name=names[i],[parent]=hierarchy[name];let dx=0,dy=0;
        if(name==='pelvis')dy=bob+breath*1.3;
        if(name==='head')dy=-bob*.38;
        if(name==='thighL'||name==='thighR'){const side=name.at(-1),p=phase+(side==='R'?Math.PI:0);dy=-this.footLift[side]-bob;dx=Math.cos(p)*(gait.stepReach??10)*a;}
        const local=transform(this.overrides[name]??angles[name]??0,pivots[i],dx,dy);this.matrices[name]=parent?multiply(this.matrices[parent],local):local;
      }
      const mesh=meshes[this.view];
      for(let v=0;v<mesh.weights.length;v++){const x=mesh.positions[v*2],y=mesh.positions[v*2+1],weights=mesh.weights[v];let px=0,py=0;for(let i=0;i<names.length;i++){const w=weights[i];if(w<.00001)continue;const m=this.matrices[names[i]];px+=(m[0]*x+m[2]*y+m[4])*w;py+=(m[1]*x+m[3]*y+m[5])*w;}this.positions[v*2]=px;this.positions[v*2+1]=py;}
      const gl=this.gl;gl.viewport(0,0,this.resolution,this.resolution);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);gl.bindTexture(gl.TEXTURE_2D,this.textures[back?1:0]);gl.bindBuffer(gl.ARRAY_BUFFER,this.positionBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,this.positions);gl.drawElements(gl.TRIANGLES,mesh.indices.length,gl.UNSIGNED_SHORT,0);
      this.container.dataset.cycle=((this.distance/this.stride)%1).toFixed(4);this.container.dataset.distance=this.distance.toFixed(3);this.container.dataset.blend=a.toFixed(3);this.container.dataset.leftLift=this.footLift.L.toFixed(2);this.container.dataset.rightLift=this.footLift.R.toFixed(2);
      this.container.querySelector('.walk-shadow').style.opacity=String(.15+bob*.003);
      if(this.debug)this.drawGuides();
    }
    drawGuides(){const names=this.names,hierarchy=this.hierarchy,pivots=this.views[this.view].pivots;for(let i=0;i<names.length;i++){const name=names[i],p=point(this.matrices[name],pivots[i]),g=this.container.querySelector(`[data-walk-bone="${name}"]`),parent=hierarchy[name][0];g.setAttribute('transform',`translate(${p})`);if(parent){const end=point(this.matrices[parent],pivots[names.indexOf(parent)]);g.querySelector('path').setAttribute('d',`M0 0L${end[0]-p[0]} ${end[1]-p[1]}`);}}
      let d='';const n=49;for(let row=0;row<n;row+=3)for(let col=0;col<n;col+=3){const i=row*n+col,p=[this.positions[i*2],this.positions[i*2+1]];if(row+3<n){const j=i+n*3;d+=`M${p}L${this.positions[j*2]},${this.positions[j*2+1]}`;}if(col+3<n){const j=i+3;d+=`M${p}L${this.positions[j*2]},${this.positions[j*2+1]}`;}}this.container.querySelector('.walk-mesh').setAttribute('d',d);
    }
    exportRig(){const names=this.names,hierarchy=this.hierarchy,views=this.views,meshes=this.meshes;return {version:this.profile?2:1,name:(this.profile?.id||'momo')+'-walk',format:'gachisup-weighted-mesh',runtime:'momo-walk.js',stride:this.stride,profile:this.profile?JSON.parse(JSON.stringify(this.profile)):null,direction:this.direction,cycle:(this.distance/this.stride)%1,bones:Object.fromEntries(names.map(name=>[name,{parent:hierarchy[name][0],label:hierarchy[name][1],limit:hierarchy[name][2]}])),views:Object.fromEntries(Object.entries(views).map(([key,v])=>[key,{...v,mesh:{vertices:Array.from(meshes[key].positions),uv:Array.from(meshes[key].uv),indices:Array.from(meshes[key].indices),weights:meshes[key].weights}}])),note:'앞/뒤 원화와 좌우 반전으로 4방향을 표현하는 2D 메시 리그. 3D 또는 Spine/Rive 파일 아님.'};}
    destroy(){this.destroyed=true;instances.delete(this);this.observer.disconnect();this.canvas.removeEventListener('webglcontextlost',this.onLost);this.canvas.removeEventListener('webglcontextrestored',this.onRestored);if(this.gl){for(const texture of this.textures||[])this.gl.deleteTexture(texture);for(const buffer of [this.positionBuffer,this.uvBuffer,this.indexBuffer])if(buffer)this.gl.deleteBuffer(buffer);if(this.program)this.gl.deleteProgram(this.program);this.gl.getExtension('WEBGL_lose_context')?.loseContext();}this.container.replaceChildren();if(!instances.size){cancelAnimationFrame(frame);frame=0;last=0;}}
  }
  window.GachisupWalkRig={create:(container,options)=>new WalkRig(container,options),stride:STRIDE,bones:hierarchy};
})();
