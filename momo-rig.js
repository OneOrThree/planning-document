/* 승인 원화의 픽셀을 유지하는 가중치 기반 2D 메시 리그. 외부 애니메이션 런타임 없음. */
(() => {
  'use strict';
  const SOURCE='assets/momo-rig-source.png';
  const CLOSED='assets/momo-reading-concept-v2.png';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
  const ellipse=(x,y,cx,cy,rx,ry)=>1-smooth(.35,1,Math.hypot((x-cx)/rx,(y-cy)/ry));
  const bones={
    root:{parent:null,pivot:[530,865],limit:2,label:'기준'},
    body:{parent:'root',pivot:[535,790],limit:3,label:'호흡'},
    head:{parent:'body',pivot:[475,510],limit:4,label:'고개'},
    earL:{parent:'head',pivot:[353,183],limit:6,label:'왼쪽 귀'},
    earR:{parent:'head',pivot:[635,255],limit:6,label:'오른쪽 귀'},
    book:{parent:'body',pivot:[359,681],limit:4,label:'책'},
    armL:{parent:'book',pivot:[208,542],limit:5,label:'왼쪽 앞발'},
    pawL:{parent:'armL',pivot:[193,594],limit:5,label:'왼쪽 손목'},
    armR:{parent:'book',pivot:[657,614],limit:5,label:'오른쪽 앞발'},
    pawR:{parent:'armR',pivot:[580,653],limit:5,label:'오른쪽 손목'},
    tail:{parent:'root',pivot:[788,825],limit:8,label:'꼬리'},
    tailTip:{parent:'tail',pivot:[874,822],limit:8,label:'꼬리 끝'}
  };
  const names=Object.keys(bones),instances=new Set(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const identity=()=>[1,0,0,1,0,0];
  const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
  const point=(m,x,y)=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];
  function rotation(angle,pivot,dy=0,sx=1,sy=1){const r=angle*Math.PI/180,c=Math.cos(r),s=Math.sin(r),[x,y]=pivot;return [c*sx,s*sx,-s*sy,c*sy,x-c*sx*x+s*sy*y,y-s*sx*x-c*sy*y+dy];}
  const bookShape=[[172,467],[205,461],[326,510],[345,565],[530,510],[550,537],[573,586],[624,585],[716,649],[704,694],[650,714],[590,704],[575,756],[339,768],[253,720],[238,653],[171,660],[148,615],[154,571],[178,537]];
  function polygonWeight(x,y,poly,feather=22){let inside=false,dist=Infinity;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [ax,ay]=poly[i],[bx,by]=poly[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;const dx=bx-ax,dy=by-ay,t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1),0,1);dist=Math.min(dist,Math.hypot(x-ax-t*dx,y-ay-t*dy));}return inside?1:1-smooth(0,Math.max(1,feather),dist);}
  function weightsAt(x,y){const weights=Array(names.length).fill(0);weights[0]=1;
    const assign=(name,v)=>{v=clamp(v,0,1);for(let i=0;i<weights.length;i++)weights[i]*=1-v;weights[names.indexOf(name)]+=v;};
    assign('body',1-smooth(750,920,y));
    assign('head',1-smooth(480,575,y));
    assign('earL',ellipse(x,y,326,99,150,125));assign('earR',ellipse(x,y,649,160,110,135));
    const book=polygonWeight(x,y,bookShape);assign('book',book);
    assign('armL',ellipse(x,y,188,585,46,76)*book*.7);assign('pawL',ellipse(x,y,190,603,35,44)*book*.65);
    assign('armR',ellipse(x,y,648,657,85,60)*book*.7);assign('pawR',ellipse(x,y,580,652,57,47)*book*.7);
    const tail=smooth(735,815,x)*smooth(625,704,y);assign('tail',tail);assign('tailTip',tail*ellipse(x,y,885,854,155,104)*.85);
    return weights;
  }
  function mesh(){const grid=40,positions=[],uv=[],weights=[],indices=[];for(let y=0;y<=grid;y++)for(let x=0;x<=grid;x++){positions.push(x/grid*1000,y/grid*1000);uv.push(x/grid,y/grid);weights.push(weightsAt(x/grid*1000,y/grid*1000));}for(let y=0;y<grid;y++)for(let x=0;x<grid;x++){const a=y*(grid+1)+x,b=a+1,c=a+grid+1,d=c+1;indices.push(a,c,b,b,c,d);}return {grid,positions:new Float32Array(positions),uv:new Float32Array(uv),weights,indices:new Uint16Array(indices)};}
  const sharedMesh=mesh();
  const rigDefaults={source:SOURCE,bones,mesh:sharedMesh};
  const previewBones={root:{parent:null,pivot:[530,865],limit:2,label:'기준'},body:{parent:'root',pivot:[535,790],limit:2,label:'호흡'},head:{parent:'body',pivot:[490,530],limit:2,label:'고개'}};
  function previewWeights(x,y){const body=1-smooth(750,920,y),head=(1-smooth(430,535,y))*(1-polygonWeight(x,y,bookShape));return [(1-body)*(1-head),body*(1-head),head];}
  const previewMesh={...sharedMesh,weights:sharedMesh.weights.map((_,i)=>previewWeights(sharedMesh.positions[i*2],sharedMesh.positions[i*2+1]))};
  const profileMeshes=new WeakMap();
  function profileMesh(profile){
    if(profileMeshes.has(profile))return profileMeshes.get(profile);
    const keys=Object.keys(profile.bones);
    const weightsAt=(x,y)=>{const weights=keys.map((_,i)=>i===0?1:0);for(const region of profile.regions){const index=keys.indexOf(region.bone);if(index<0)continue;const amount=clamp(polygonWeight(x,y,region.polygon,region.feather)*(region.strength??1),0,1);for(let i=0;i<weights.length;i++)weights[i]*=1-amount;weights[index]+=amount;}return weights;};
    const mesh={...sharedMesh,weights:sharedMesh.weights.map((_,i)=>weightsAt(sharedMesh.positions[i*2],sharedMesh.positions[i*2+1]))};
    const result={mesh,weightsAt};profileMeshes.set(profile,result);return result;
  }
  function profileFragment(profile){
    const decimal=n=>Number(n).toFixed(8);
    const color=hex=>{const value=hex.replace('#','');return [0,2,4].map(i=>decimal(parseInt(value.slice(i,i+2),16)/255)).join(',');};
    const lids=(profile.eyes||[]).map(eye=>{
      const angle=(eye.angle||0)*Math.PI/180;
      if(profile.closedSource)return `{
        vec2 center=vec2(${eye.center.map(n=>decimal(n/1000)).join(',')});
        vec2 radius=vec2(${eye.radius.map(n=>decimal(n/1000)).join(',')});
        mat2 toLocal=mat2(${decimal(Math.cos(angle))},${decimal(-Math.sin(angle))},${decimal(Math.sin(angle))},${decimal(Math.cos(angle))});
        mat2 toUV=mat2(${decimal(Math.cos(angle))},${decimal(Math.sin(angle))},${decimal(-Math.sin(angle))},${decimal(Math.cos(angle))});
        vec2 q=(toLocal*(vUV-center))/radius;
        float inside=1.0-smoothstep(.85,1.18,length(q));
        if(inside>0.0&&uBlink>0.0001){
          vec3 closed=texture2D(uClosed,vUV).rgb;
          float lashY=.20,lashWeight=.02,lashPosition=.004;
          // 감은 원화의 눈선을 기준으로 열린 눈을 접어 중간의 이중 눈선을 방지한다.
          for(int sample=0;sample<17;sample++){
            float y=-.75+float(sample)*.10;
            vec3 probe=texture2D(uClosed,center+toUV*(vec2(0.0,y)*radius)).rgb;
            float luma=dot(probe,vec3(.2126,.7152,.0722));
            float weight=pow(max(0.0,.30-luma),2.0);
            lashWeight+=weight;lashPosition+=y*weight;
          }
          lashY=lashPosition/lashWeight;
          float settle=smoothstep(.88,1.0,uBlink);
          // 아직 열린 틈 밖에서는 감은 눈선이 먼저 나타나지 않도록 인접 원화 색을 쓴다.
          vec3 above=texture2D(uClosed,vUV+toUV*vec2(0.0,-radius.y*.42)).rgb;
          vec3 below=texture2D(uClosed,vUV+toUV*vec2(0.0,radius.y*.42)).rgb;
          vec3 hint=vec3(${color(eye.lid||'#b98b59')});
          vec3 skin=mix(above,below,step(distance(below,hint),distance(above,hint)));
          float darkLash=smoothstep(.025,.10,dot(skin-closed,vec3(.2126,.7152,.0722)));
          closed=mix(closed,skin,darkLash*(1.0-settle));
          float upper=mix(-1.0,lashY,uBlink);
          float lower=mix(1.0,lashY,uBlink*uBlink);
          float aperture=smoothstep(upper-.018,upper+.018,q.y)*(1.0-smoothstep(lower-.018,lower+.018,q.y));
          vec2 openPoint=vec2(q.x,clamp((q.y-upper)/max(.001,lower-upper)*2.0-1.0,-1.0,1.0));
          vec3 openEye=texture2D(uOpen,center+toUV*(openPoint*radius)).rgb;
          vec3 expression=mix(closed,openEye,aperture*(1.0-settle));
          color=mix(color,expression,inside);
        }
      }`;
      return `{vec2 q=vUV-vec2(${eye.center.map(n=>decimal(n/1000)).join(',')});q=mat2(${decimal(Math.cos(angle))},${decimal(-Math.sin(angle))},${decimal(Math.sin(angle))},${decimal(Math.cos(angle))})*q;q/=vec2(${eye.radius.map(n=>decimal(n/1000)).join(',')});float inside=1.0-smoothstep(.87,1.0,length(q));float closing=smoothstep(1.0-uBlink*1.2,1.10-uBlink*1.2,abs(q.y));vec3 lid=vec3(${color(eye.lid||'#b98b59')});color=mix(color,lid,inside*closing*smoothstep(0.0,.12,uBlink));float lash=(1.0-smoothstep(.035,.095,abs(q.y-.05*q.x*q.x)))*(1.0-smoothstep(.7,.9,abs(q.x)))*smoothstep(.8,1.0,uBlink);color=mix(color,lid*.42,lash);}`;
    }).join('');
    return `precision mediump float;varying vec2 vUV;uniform sampler2D uOpen;uniform sampler2D uClosed;uniform float uBlink;void main(){vec4 base=texture2D(uOpen,vUV);vec3 color=base.rgb;${lids}gl_FragColor=vec4(color*base.a,base.a);}`;
  }
  const loadImage=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('캐릭터 이미지를 불러오지 못했어요: '+src));image.src=src;});
  const assets=new Map();let frame=0,last=0,sequence=0;
  function loop(now){const dt=last?Math.min((now-last)/1000,.08):0;last=now;for(const rig of instances)if(rig.loaded&&rig.visible&&!rig.paused&&!document.hidden&&(!reduced.matches||rig.motionOptIn)){rig.time+=dt*rig.speed;rig.render();}frame=instances.size?requestAnimationFrame(loop):0;}
  function shader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
  class MomoRig {
    constructor(container,options={}){
      this.profile=options.profile||null;this.onRender=typeof options.onRender==='function'?options.onRender:null;
      this.source=this.profile?.source||options.source||rigDefaults.source;this.basic=!this.profile&&!!options.basic;this.closedSource=this.profile?(this.profile.closedSource||null):this.basic?null:CLOSED;this.name=options.name||'momo-approved-reading-cat';this.label=options.label||'책을 읽는 삼색 고양이 모모';this.bones=this.profile?.bones||(this.basic?previewBones:rigDefaults.bones);this.names=Object.keys(this.bones);this.mesh=this.profile?profileMesh(this.profile).mesh:(this.basic?previewMesh:rigDefaults.mesh);this.weightsAt=this.profile?profileMesh(this.profile).weightsAt:(this.basic?previewWeights:weightsAt);
      this.capabilities={blink:this.profile?!!this.profile.eyes?.length:!this.basic,pageTurn:this.profile?!!this.profile.page:!this.basic};
      const names=this.names,bones=this.bones,sharedMesh=this.mesh,SOURCE=this.source;
      const clipId='momo-page-window-'+(++sequence);
      this.container=container;this.time=options.phase||0;this.clip=options.clip||(this.basic?'idle':'read');this.speed=1;this.paused=!!options.paused||reduced.matches;this.motionOptIn=false;this.overrides={};this.loaded=false;this.visible=true;this.debug=false;this.destroyed=false;this.blinkAt=-100;this.turnAt=-100;this.blinkValue=0;this.matrices={};this.positions=new Float32Array(sharedMesh.positions.length);
      container.classList.add('momo-rig-host');container.innerHTML=`<span class="momo-shadow"></span><img class="momo-fallback" src="${SOURCE}" alt="책을 읽는 삼색 고양이 모모"><canvas class="momo-canvas" role="img" aria-label="승인 원화를 사용한 책 읽는 고양이, 12관절 메시 애니메이션"></canvas><svg class="momo-overlay" viewBox="0 0 1000 1000" aria-hidden="true"><defs><clipPath id="${clipId}"><path class="momo-page-window"/></clipPath></defs><path clip-path="url(#${clipId})" class="momo-page" fill="#f8edd5" stroke="#bd956c" stroke-width="2" stroke-linejoin="round" opacity="0"/><g class="momo-guides" fill="none" stroke="#b45c47" stroke-width="2"><path class="momo-mesh" stroke="#50795d" stroke-width=".8" opacity=".35"/>${names.map(name=>`<g data-bone="${name}"><path/><circle r="5" fill="#f9f2dc"/><text x="9" y="-9" fill="#79422f" stroke="none" font-size="16" font-family="sans-serif">${bones[name].label}</text></g>`).join('')}</g></svg>`;
      this.canvas=container.querySelector('canvas');this.overlay=container.querySelector('svg');this.page=this.overlay.querySelector('.momo-page');this.guides=this.overlay.querySelector('.momo-guides');this.resolution=options.resolution||1000;this.canvas.width=this.canvas.height=this.resolution;
      this.observer=null;if(options.observeVisibility!==false){this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;});this.observer.observe(container);}
      container.querySelector('.momo-fallback').alt=this.label;this.canvas.setAttribute('aria-label',`${this.label}, ${names.length}관절 메시 애니메이션`);
      container.dataset.rigState='loading';container.removeAttribute('title');
      const key=SOURCE+'|'+(this.closedSource||SOURCE);if(!assets.has(key))assets.set(key,Promise.all([loadImage(SOURCE),loadImage(this.closedSource||SOURCE)]));
      this.ready=assets.get(key).then(images=>{if(this.destroyed)return;this.images=images;this.initialize();this.loaded=true;container.dataset.rigState='ready';this.render();}).catch(error=>{if(this.destroyed)return;this.error=error.message;container.dataset.rigState='fallback';container.setAttribute('title',error.message);});
      this.onContextLost=event=>{event.preventDefault();this.loaded=false;container.dataset.rigState='fallback';};
      this.onContextRestored=()=>{if(this.destroyed)return;try{this.initialize();this.loaded=true;container.dataset.rigState='ready';this.render();}catch(error){this.error=error.message;}};
      this.canvas.addEventListener('webglcontextlost',this.onContextLost);this.canvas.addEventListener('webglcontextrestored',this.onContextRestored);
      instances.add(this);if(!frame){last=0;frame=requestAnimationFrame(loop);}
    }
    initialize(){
      const sharedMesh=this.mesh;
      const gl=this.canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:true});if(!gl)throw new Error('WebGL을 지원하지 않아 원화를 표시합니다.');this.gl=gl;
      const vertex=shader(gl,gl.VERTEX_SHADER,'attribute vec2 aPosition;attribute vec2 aUV;varying vec2 vUV;void main(){vUV=aUV;gl_Position=vec4(aPosition.x/500.0-1.0,1.0-aPosition.y/500.0,0.0,1.0);}');
      const fragment=shader(gl,gl.FRAGMENT_SHADER,this.profile?profileFragment(this.profile):`precision mediump float;varying vec2 vUV;uniform sampler2D uOpen;uniform sampler2D uClosed;uniform float uBlink;float maskEye(vec2 c,vec2 r){return 1.0-smoothstep(.72,1.0,length((vUV-c)/r));}void main(){vec4 base=texture2D(uOpen,vUV);vec4 closed=texture2D(uClosed,vUV);float eye=max(maskEye(vec2(.310,.390),vec2(.060,.060)),maskEye(vec2(.508,.440),vec2(.074,.054)));vec3 color=mix(base.rgb,closed.rgb,eye*uBlink);gl_FragColor=vec4(color*base.a,base.a);}`);
      this.program=gl.createProgram();gl.attachShader(this.program,vertex);gl.attachShader(this.program,fragment);gl.linkProgram(this.program);gl.deleteShader(vertex);gl.deleteShader(fragment);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));gl.useProgram(this.program);
      this.positionBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.positionBuffer);gl.bufferData(gl.ARRAY_BUFFER,this.positions,gl.DYNAMIC_DRAW);const pos=gl.getAttribLocation(this.program,'aPosition');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
      this.uvBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);gl.bufferData(gl.ARRAY_BUFFER,sharedMesh.uv,gl.STATIC_DRAW);const uv=gl.getAttribLocation(this.program,'aUV');gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
      this.indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,sharedMesh.indices,gl.STATIC_DRAW);
      this.textures=this.images.map((image,i)=>{const upload=document.createElement('canvas');upload.width=upload.height=1024;const context=upload.getContext('2d');context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(image,0,0,1024,1024);const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,upload);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.generateMipmap(gl.TEXTURE_2D);return texture;});
      gl.uniform1i(gl.getUniformLocation(this.program,'uOpen'),0);gl.uniform1i(gl.getUniformLocation(this.program,'uClosed'),1);this.blinkUniform=gl.getUniformLocation(this.program,'uBlink');gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
    }
    setClip(clip){if(!['read','idle','nod'].includes(clip)||(this.basic&&clip==='read'))return;this.clip=clip;this.time=0;this.blinkAt=this.turnAt=-100;this.overrides={};this.render();}
    setBone(name,value){if(!this.bones[name])return;const n=Number(value);if(!Number.isFinite(n))return;this.overrides[name]=clamp(n,-this.bones[name].limit,this.bones[name].limit);this.render();}
    seek(seconds){this.time=Math.max(0,Number(seconds)||0);this.blinkAt=this.turnAt=-100;this.render();}
    blink(){if(!this.capabilities.blink)return;this.blinkAt=this.time;this.render();}
    turnPage(){if(!this.capabilities.pageTurn)return;this.turnAt=this.time;this.render();}
    setDebug(on){this.debug=on;this.container.classList.toggle('show-bones',on);this.render();}
    play(){this.paused=false;this.motionOptIn=true;}
    transformPoint(x,y){const names=this.names,weights=this.weightsAt(x,y);let px=0,py=0;for(let i=0;i<names.length;i++){const m=this.matrices[names[i]]||identity(),w=weights[i];px+=(m[0]*x+m[2]*y+m[4])*w;py+=(m[1]*x+m[3]*y+m[5])*w;}return [px,py];}
    render(){if(!this.loaded||this.destroyed)return;const t=this.time,breath=Math.sin(t*1.35),reading=this.clip==='read';
      const names=this.names,bones=this.bones,sharedMesh=this.mesh;
      const nod=this.clip==='nod'?Math.sin(t*2.2)*2.3:Math.sin(t*.72)*.85;
      const angles={root:0,body:breath*.12,head:nod,earL:Math.sin(t*1.1)*.8,earR:Math.sin(t*1.1-.7)*.6,book:breath*.25,armL:Math.sin(t*.9)*.22,pawL:Math.sin(t*.9+.3)*.15,armR:Math.sin(t*.8+.9)*.2,pawR:Math.sin(t*.8)*.25,tail:Math.sin(t*.8)*1.9,tailTip:Math.sin(t*.8-.7)*2.1};
      if(this.profile){const motion=this.profile.motions[this.clip]||this.profile.motions.idle||{};for(const name of names){const spec=motion[name];angles[name]=spec?clamp(Math.sin(t*(spec.frequency??1)+(spec.phase??0))*(spec.amplitude??0),-bones[name].limit,bones[name].limit):0;}}
      for(const name of names){const b=bones[name],local=rotation(this.overrides[name]??angles[name],b.pivot,name==='head'?breath*1.2:0,name==='body'?1+breath*.0015:1,name==='body'?1+breath*.003:1);this.matrices[name]=b.parent?multiply(this.matrices[b.parent],local):local;}
      for(let v=0;v<sharedMesh.weights.length;v++){const x=sharedMesh.positions[v*2],y=sharedMesh.positions[v*2+1],weights=sharedMesh.weights[v];let px=0,py=0;for(let i=0;i<names.length;i++){const w=weights[i];if(w<.00001)continue;const m=this.matrices[names[i]];px+=(m[0]*x+m[2]*y+m[4])*w;py+=(m[1]*x+m[3]*y+m[5])*w;}this.positions[v*2]=px;this.positions[v*2+1]=py;}
      const auto=t%6.4;let blink=auto>4.8&&auto<5.12?Math.sin((auto-4.8)/.32*Math.PI):0;const manual=t-this.blinkAt;if(manual>=0&&manual<.32)blink=Math.sin(manual/.32*Math.PI);if(!this.capabilities.blink)blink=0;this.blinkValue=blink;
      const gl=this.gl;gl.viewport(0,0,this.resolution,this.resolution);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.positionBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,this.positions);gl.uniform1f(this.blinkUniform,blink);gl.drawElements(gl.TRIANGLES,sharedMesh.indices.length,gl.UNSIGNED_SHORT,0);
      const cycle=t%12;let page=reading&&cycle>9.5&&cycle<11.2?(cycle-9.5)/1.7:0;const manualPage=t-this.turnAt;if(manualPage>=0&&manualPage<1.7)page=manualPage/1.7;this.drawPage(page);
      this.container.dataset.rigTime=t.toFixed(3);this.container.dataset.blink=blink.toFixed(3);
      if(this.debug)this.drawGuides();this.onRender?.(this);
    }
    drawPage(p){
      if(!this.capabilities.pageTurn)p=0;
      this.page.setAttribute('opacity',p>0?String(Math.min(1,p*14,(1-p)*14)):0);if(p<=0)return;
      const format=([x,y])=>this.transformPoint(x,y).map(n=>n.toFixed(2)).join(' ');
      if(this.profile){
        const page=this.profile.page,spine=page.spine,theta=p*Math.PI,turn=Math.cos(theta),curl=Math.sin(theta),side=p<.5?page.right:page.left,spread=Math.abs(turn);
        // 책 밖으로 올라온 종이도 고개가 아닌 책 관절에 고정한다.
        const formatPage=([x,y])=>point(this.matrices.book||this.matrices.body||identity(),x,y).map(n=>n.toFixed(2)).join(' ');
        const edge=[spine[0]+(side[0]-spine[0])*spread,spine[1]+(side[1]-spine[1])*spread-curl*(page.lift??70)];
        const depth=4+curl*(page.depth??62),hinge=[spine[0],spine[1]-5-curl*7];
        const top=[edge[0]+turn*depth*.12,edge[1]-depth];
        const lowerControl=[(spine[0]+edge[0])/2+turn*curl*12,(spine[1]+edge[1])/2-curl*12];
        const upperControl=[(hinge[0]+top[0])/2+turn*curl*18,(hinge[1]+top[1])/2-curl*16];
        this.overlay.querySelector('.momo-page-window').setAttribute('d','M'+page.clip.map(formatPage).join('L')+'Z');
        this.page.setAttribute('d',`M${formatPage(spine)}Q${formatPage(lowerControl)} ${formatPage(edge)}Q${formatPage([edge[0]+turn*depth*.12,edge[1]-depth*.5])} ${formatPage(top)}Q${formatPage(upperControl)} ${formatPage(hinge)}Z`);
        this.page.setAttribute('fill',p<.5?'#faf0d9':'#eee1c7');this.page.dataset.progress=p.toFixed(3);return;
      }
      // 표지 위쪽 경계를 따라 만든 가림 영역. 책과 동일한 가중치로 변형해 표지를 관통하지 않는다.
      const rim=[[0,0],[1000,0],[1000,526],[569,526],[552,533],[501,544],[451,555],[394,570],[360,579],[342,579],[331,570],[304,545],[272,521],[236,495],[204,478],[177,469],[158,452],[0,452]];
      this.overlay.querySelector('.momo-page-window').setAttribute('d','M'+rim.map(format).join('L')+'Z');
      const theta=p*Math.PI,edge=[338+(p<.5?190:141)*Math.cos(theta),517-40*p-43*Math.sin(theta)],spine=[337,568];
      const points=[spine,[(spine[0]+edge[0])/2,edge[1]-8],edge,[edge[0]+4,edge[1]+10],[(spine[0]+edge[0])/2,edge[1]+8],[340,574]].map(format);
      this.page.setAttribute('d',`M${points[0]}Q${points[1]} ${points[2]}L${points[3]}Q${points[4]} ${points[5]}Z`);
      this.page.setAttribute('fill',p<.5?'#faf0d9':'#eee1c7');
    }
    drawGuides(){const names=this.names,bones=this.bones,sharedMesh=this.mesh;for(const name of names){const b=bones[name],p=point(this.matrices[name],...b.pivot),g=this.overlay.querySelector(`[data-bone="${name}"]`);g.setAttribute('transform',`translate(${p[0]} ${p[1]})`);g.dataset.angle=String(this.overrides[name]??0);if(b.parent){const pp=point(this.matrices[b.parent],...bones[b.parent].pivot);g.querySelector('path').setAttribute('d',`M0 0L${pp[0]-p[0]} ${pp[1]-p[1]}`);}}let d='';const n=sharedMesh.grid+1;for(let row=0;row<n;row+=2)for(let col=0;col<n;col+=2){const i=row*n+col,p=[this.positions[i*2],this.positions[i*2+1]];if(row+2<n){const j=i+n*2;d+=`M${p}L${this.positions[j*2]},${this.positions[j*2+1]}`;}if(col+2<n){const j=i+2;d+=`M${p}L${this.positions[j*2]},${this.positions[j*2+1]}`;}}this.overlay.querySelector('.momo-mesh').setAttribute('d',d);}
    async snapshot(){await this.ready;if(!this.loaded)throw new Error(this.error||'리그가 준비되지 않았어요.');this.render();const canvas=document.createElement('canvas');canvas.width=canvas.height=this.resolution;const ctx=canvas.getContext('2d');ctx.drawImage(this.canvas,0,0);const svg=this.overlay.cloneNode(true);svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('width',this.resolution);svg.setAttribute('height',this.resolution);svg.querySelector('.momo-guides').remove();const uri=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));try{ctx.drawImage(await loadImage(uri),0,0,this.resolution,this.resolution);}finally{URL.revokeObjectURL(uri);}return new Promise(resolve=>canvas.toBlob(resolve,'image/png'));}
    exportRig(){const bones=this.bones,sharedMesh=this.mesh;return {version:this.profile?3:2,name:this.name,format:'gachisup-weighted-mesh',runtime:'momo-rig.js',texture:this.source,closedEyesTexture:this.closedSource,textureSize:this.images?[this.images[0].naturalWidth,this.images[0].naturalHeight]:[1254,1254],capabilities:{...this.capabilities},profile:this.profile?JSON.parse(JSON.stringify(this.profile)):null,coordinateSystem:[0,0,1000,1000],bones,mesh:{grid:sharedMesh.grid,vertices:Array.from(sharedMesh.positions),uv:Array.from(sharedMesh.uv),indices:Array.from(sharedMesh.indices),weights:sharedMesh.weights.map(row=>row.map(n=>Math.round(n*100000)/100000))},clip:this.clip,time:this.time,speed:this.speed,overrides:{...this.overrides},clips:this.basic?['idle','nod']:['read','idle','nod'],note:'원화 텍스처 + 가중치 기반 메시 리그. SVG 벡터화 또는 Spine/Rive 파일이 아님.'};}
    destroy(){this.destroyed=true;instances.delete(this);this.observer?.disconnect();this.canvas.removeEventListener('webglcontextlost',this.onContextLost);this.canvas.removeEventListener('webglcontextrestored',this.onContextRestored);if(this.gl){for(const texture of this.textures||[])this.gl.deleteTexture(texture);for(const buffer of [this.positionBuffer,this.uvBuffer,this.indexBuffer])if(buffer)this.gl.deleteBuffer(buffer);if(this.program)this.gl.deleteProgram(this.program);this.gl.getExtension('WEBGL_lose_context')?.loseContext();}this.container.replaceChildren();if(!instances.size){cancelAnimationFrame(frame);frame=0;last=0;}}
  }
  window.GachisupCatRig={create:(container,options)=>new MomoRig(container,options),bones,source:SOURCE};
})();
