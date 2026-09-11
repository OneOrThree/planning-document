/* 외부 런타임 없는 계층형 2D 컷아웃 리그. 모든 관절 좌표는 SVG 원본 좌표다. */
(() => {
  'use strict';
  const bones = {
    root:{parent:null,pivot:[120,205]},
    tail:{parent:'root',pivot:[155,183]},
    tailTip:{parent:'tail',pivot:[184,173]},
    body:{parent:'root',pivot:[120,190]},
    head:{parent:'body',pivot:[121,125]},
    earL:{parent:'head',pivot:[82,66]},
    earR:{parent:'head',pivot:[158,66]},
    book:{parent:'body',pivot:[120,173]},
    armL:{parent:'body',pivot:[85,142]},
    pawL:{parent:'armL',pivot:[78,160]},
    armR:{parent:'body',pivot:[153,142]},
    pawR:{parent:'armR',pivot:[161,158]}
  };
  const instances = new Set();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,last=0;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const bone=(name,art)=>`<g data-bone="${name}">${art}<g class="rig-guide" fill="none" stroke="#cb5845" stroke-width="1.3"><circle cx="${bones[name].pivot[0]}" cy="${bones[name].pivot[1]}" r="3.5"/><path d="M${bones[name].pivot[0]-7} ${bones[name].pivot[1]}h14 M${bones[name].pivot[0]} ${bones[name].pivot[1]-7}v14"/></g></g>`;
  function artwork(){return `<svg xmlns="http://www.w3.org/2000/svg" class="cat-rig" viewBox="28 15 185 211" role="img" aria-label="책 읽는 삼색 고양이 모모, 12개 관절의 벡터 리그"><style>.rig-guide{display:none;pointer-events:none}.show-bones .rig-guide{display:inline}.cat-rig{overflow:visible}</style><ellipse cx="122" cy="207" rx="62" ry="12" fill="#344a32" opacity=".16"/>${bone('root',`
    ${bone('tail',`<path d="M151 184Q184 201 190 176Q196 156 185 155" fill="none" stroke="#655346" stroke-width="19" stroke-linecap="round"/><path d="M151 183Q182 197 185 175" fill="none" stroke="#d4a276" stroke-width="13" stroke-linecap="round"/>${bone('tailTip','<path d="M185 175Q197 155 184 152" fill="none" stroke="#655346" stroke-width="18" stroke-linecap="round"/>')}`)}
    ${bone('body',`<g stroke="#655346" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M84 132Q72 151 77 182Q77 204 102 205L140 205Q163 200 163 180Q167 151 150 132Z" fill="#f5edda"/><path d="M142 135Q163 144 160 171Q146 178 138 163Q134 148 142 135" fill="#cc9364" stroke="none"/><ellipse cx="120" cy="171" rx="23" ry="28" fill="#e8ddc2" stroke="none"/><path d="M85 194Q69 194 73 205Q81 212 101 207Q111 201 99 196Z" fill="#f5edda"/><path d="M143 194Q131 197 136 205Q149 212 163 207Q169 202 158 196Z" fill="#f5edda"/><path d="M82 203l1 3m7-4 1 4m56-3v4m8-4v4" stroke="#b9a58a" stroke-width="1.5"/></g>
      ${bone('head',`<g stroke="#655346" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        ${bone('earL','<path d="M64 75Q57 49 67 28Q71 23 77 29L101 51Z" fill="#655346"/><path d="M69 59L69 35L88 53" fill="#cfa898" stroke="none"/>')}
        ${bone('earR','<path d="M142 52L166 29Q172 26 175 33Q182 52 174 76Z" fill="#f5edda"/><path d="M155 54L170 36L172 62" fill="#cfa898" stroke="none"/>')}
        <path d="M69 61Q87 43 119 46Q153 42 172 65Q184 84 178 105Q172 128 147 137Q119 146 91 137Q67 130 60 110Q53 82 69 61Z" fill="#f5edda"/>
        <path d="M65 66Q76 48 98 46Q106 62 98 77Q88 91 59 91Q58 76 65 66" fill="#655346" stroke="none"/>
        <path d="M132 47Q158 48 170 66Q165 86 148 85Q134 77 132 47" fill="#cc9364" stroke="none"/>
        <path d="M101 46Q109 56 110 64M119 46l2 15" stroke="#cc9364" stroke-width="5"/>
        <g data-eye="left"><ellipse cx="92" cy="99" rx="4.2" ry="5.7" fill="#52473e" stroke="none"/><circle cx="93" cy="97" r="1.2" fill="#fff8e8" stroke="none"/></g>
        <g data-eye="right"><ellipse cx="147" cy="99" rx="4.2" ry="5.7" fill="#52473e" stroke="none"/><circle cx="148" cy="97" r="1.2" fill="#fff8e8" stroke="none"/></g>
        <path data-lid="left" d="M85 100q7 5 14 0" fill="none" stroke-width="2.5"/><path data-lid="right" d="M140 100q7 5 14 0" fill="none" stroke-width="2.5"/>
        <ellipse cx="77" cy="112" rx="8" ry="4" fill="#d8a894" opacity=".48" stroke="none"/><ellipse cx="160" cy="112" rx="8" ry="4" fill="#d8a894" opacity=".48" stroke="none"/>
        <path d="M115 108q5-3 10 0l-5 5Z" fill="#997968" stroke="none"/><path d="M120 113v3q-4 5-9 1m9-1q4 5 9 1" fill="none" stroke-width="1.8"/>
        <path d="M77 110l-16-3m16 9-15 4m98-10 16-4m-16 10 15 4" stroke="#98836e" stroke-width="1.6"/>
      </g>`)}
      <path d="M90 135Q120 148 148 135L145 143Q122 156 94 143Z" fill="#8b9b77" stroke="#655346" stroke-width="2"/><path d="M133 147l9 13 3-20" fill="#8b9b77" stroke="#655346" stroke-width="2" stroke-linejoin="round"/>
      ${bone('armL','<path d="M86 140Q73 142 73 163Q76 171 84 166L98 150" fill="#f5edda" stroke="#655346" stroke-width="3" stroke-linecap="round"/>')}
      ${bone('armR','<path d="M151 140Q167 141 165 162Q161 171 154 163L144 150" fill="#cc9364" stroke="#655346" stroke-width="3" stroke-linecap="round"/>')}
      ${bone('book',`<g stroke="#526548" stroke-linejoin="round"><path d="M65 159Q93 155 119 171Q145 155 177 159L174 193Q149 190 121 205Q93 191 67 194Z" fill="#60744f" stroke-width="3"/><path d="M71 159Q96 158 120 172Q145 158 171 159L168 185Q145 184 121 198Q98 185 73 186Z" fill="#f7efd9" stroke="#b4a98c" stroke-width="1.5"/><path d="M120 173l1 25" stroke="#b4a98c" stroke-width="1.8"/><path d="M80 166q18 0 31 9m-30-3q18 0 30 8m-29-2q16 0 29 8m19-11q16-10 32-9m-32 15q16-9 31-9m-30 15q16-9 29-9" fill="none" stroke="#c0b798" stroke-width="1.3"/><path d="M143 163l-1 14 5-4 3 1 1-14" fill="#c38c65" stroke="none"/><path data-page d="M120 173Q145 158 171 159L168 185Q144 184 121 198Z" fill="#fff8e7" stroke="#b4a98c" stroke-width="1" opacity="0"/></g>`)}
      <g data-hand-anchor="left">${bone('pawL','<path d="M78 160Q84 158 88 164L89 175Q84 182 78 174Z" fill="#f5edda" stroke="#655346" stroke-width="2.5" stroke-linejoin="round"/><path d="M81 168v5m4-5v5" stroke="#c2b398" stroke-width="1"/>')}</g>
      <g data-hand-anchor="right">${bone('pawR','<path d="M162 160Q156 156 151 162L149 175Q154 181 161 174Z" fill="#f5edda" stroke="#655346" stroke-width="2.5" stroke-linejoin="round"/><path d="M154 168v5m4-6v5" stroke="#c2b398" stroke-width="1"/>')}</g>
    `)}
  `)}</svg>`;}
  function loop(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;for(const rig of instances){if(!rig.paused&&!document.hidden&&!reduced.matches){rig.time+=dt*rig.speed;rig.render();}}frame=instances.size?requestAnimationFrame(loop):0;}
  class CatRig {
    constructor(container,options={}){container.innerHTML=artwork();this.svg=container.querySelector('svg');this.nodes=Object.fromEntries([...this.svg.querySelectorAll('[data-bone]')].map(n=>[n.dataset.bone,n]));this.time=options.phase||0;this.speed=1;this.clip=options.clip||'read';this.paused=!!options.paused;this.overrides={};this.blinkUntil=-1;this.turnAt=-100;this.render();instances.add(this);if(!frame){last=0;frame=requestAnimationFrame(loop);}}
    setClip(clip){if(!['read','idle','wave'].includes(clip))return;this.clip=clip;this.time=0;this.overrides={};this.render();}
    setBone(name,angle){if(!bones[name])return;this.overrides[name]=clamp(Number(angle)||0,-60,60);this.render();}
    seek(seconds){this.time=Math.max(0,Number(seconds)||0);this.render();}
    blink(){this.blinkUntil=this.time+.25;this.render();}
    turnPage(){this.turnAt=this.time;this.render();}
    setDebug(on){this.svg.classList.toggle('show-bones',on);}
    render(){const t=this.time,reading=this.clip==='read',waving=this.clip==='wave',breath=Math.sin(t*1.5),phase=(t%8.8)/8.8;let turn=reading&&phase>.77&&phase<.96?(phase-.77)/.19:0;const manual=t-this.turnAt;if(manual>=0&&manual<1.65)turn=manual/1.65;const reach=turn>0?Math.sin(turn*Math.PI):0;
      const angles={root:0,body:breath*.55,head:reading?3+Math.sin(t*.75)*2:waving?-7:Math.sin(t*.65)*4,earL:Math.sin(t*.8)*1.8,earR:Math.sin(t*.8+1)*1.3,tail:Math.sin(t*.9)*9,tailTip:Math.sin(t*.9-.8)*12,book:breath*.35,armL:breath*.6,pawL:-breath*.3,armR:waving?-78+Math.sin(t*5)*12:-reach*16,pawR:waving?Math.sin(t*5+1)*14:-reach*19};
      for(const [name,node] of Object.entries(this.nodes)){const [x,y]=bones[name].pivot;node.setAttribute('transform',`${name==='root'?`translate(0 ${breath*1.3}) `:''}rotate(${this.overrides[name]??angles[name]??0} ${x} ${y})`);}
      // 손은 상박에 종속된다. SVG 그리기 순서 때문에 앵커만 별도이며 부모 변환을 동일 적용한다.
      for(const [side,arm] of [['left','armL'],['right','armR']])this.svg.querySelector(`[data-hand-anchor="${side}"]`).setAttribute('transform',this.nodes[arm].getAttribute('transform'));
      const cycle=t%5.7;const blink=(cycle>4.72&&cycle<4.91)||(cycle>5.03&&cycle<5.16)||t<this.blinkUntil;const aperture=blink?.04:reading?.54:1;
      for(const [side,x] of [['left',92],['right',147]]){this.svg.querySelector(`[data-eye="${side}"]`).setAttribute('transform',`translate(${x} 100) scale(1 ${aperture}) translate(${-x} -100)`);this.svg.querySelector(`[data-lid="${side}"]`).style.opacity=blink?'1':'0';}
      const page=this.svg.querySelector('[data-page]');page.style.opacity=turn>0?'1':'0';if(turn>0){const edge=120+51*Math.cos(turn*Math.PI),lift=24*Math.sin(turn*Math.PI);page.setAttribute('d',`M120 173Q${(120+edge)/2} ${157-lift} ${edge} ${159-lift}L${edge} ${185-lift*.6}Q${(120+edge)/2} ${187-lift*.6} 121 198Z`);}
    }
    snapshot(){const clone=this.svg.cloneNode(true);clone.classList.remove('show-bones');clone.querySelectorAll('.rig-guide').forEach(n=>n.remove());return new XMLSerializer().serializeToString(clone);}
    exportRig(){return {version:1,name:'momo-reading-cat',format:'gachisup-svg-cutout',viewBox:[28,15,185,211],bones,clip:this.clip,time:this.time,speed:this.speed,overrides:{...this.overrides},clips:['read','idle','wave'],note:'자체 SVG 컷아웃 리그. Spine/Rive 전용 포맷이 아님. 애니메이션은 cat-rig.js와 함께 사용.'};}
    destroy(){instances.delete(this);this.svg.remove();if(!instances.size){cancelAnimationFrame(frame);frame=0;last=0;}}
  }
  window.GachisupCatRig={create:(container,options)=>new CatRig(container,options),bones,artwork};
})();
