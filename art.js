/* 같이숲: 건물·식생은 직접 그린 SVG. 기존 고양이 에셋만 재사용한다. */
const Art = (() => {
  let serial = 0;
  const c = name => `var(--${name.startsWith('color') ? name : 'art-' + name})`;
  const path = (d, fill, stroke = 'line', sw = 1.6, extra = '') => `<path d="${d}" fill="${fill === 'none' ? 'none' : c(fill)}" stroke="${stroke === 'none' ? 'none' : c(stroke)}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const ellipse = (x,y,rx,ry,fill,extra='') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c(fill)}" ${extra}/>`;
  const group = (x,y,s,body,extra='') => `<g transform="translate(${x} ${y}) scale(${s})" ${extra}>${body}</g>`;
  const shadow = (r=32) => ellipse(6,3,r,r*.32,'canopy-dark','opacity=".15"');
  const leaf = (x,y,s=1) => group(x,y,s,path('M0 0C-17-3-20-23-15-30C2-28 12-14 0 0Z','canopy-light','none')+path('M0 0Q-4-14-13-25','none','canopy',1));
  function tree(x,y,s=1,type=0) {
    let content = shadow(32)+path('M-5 0Q-3-35-6-57L5-59Q1-28 6 0Z','bark','none');
    if(type%3===0){
      content+=path('M-31-26Q-21-45-24-43Q-35-44-28-51L-12-74Q-20-71-14-82L0-110Q7-88 18-77L11-76Q22-55 28-52Q33-45 21-45L34-25Q35-18 19-20Q0-12-30-20Q-38-20-31-26Z','pine','none');
      content+=path('M0-106Q-2-84-10-69L-4-72Q-10-51-20-41L-9-44Q-12-29-25-22Q-8-19 2-21Q13-51 0-106Z','pine-light','none');
      content+=path('M-12-39L-2-43M5-64L15-62M3-26L16-30','none','canopy-dark',1.3,'opacity=".4"');
    } else {
      content+=path('M-34-48C-46-62-35-79-24-80C-32-97-9-108 1-98C14-108 32-95 29-83C46-78 46-61 35-52C43-35 21-27 8-34C-6-23-28-29-28-40C-33-39-39-44-34-48Z','canopy','none');
      content+=path('M-34-67C-35-76-29-80-22-79C-28-94-10-104 1-95C14-103 28-93 25-81C35-78 33-61 19-59C17-43 0-43-8-48C-23-43-33-53-28-62Z','canopy-light','none');
      content+=path('M-22-73Q-14-81-7-74M3-87Q12-93 18-83M-5-59Q3-65 11-60','none','grass-light',2,'opacity=".55"');
      content+=path('M0-34L-1-10M-1-29L-13-39M0-21L11-30','none','bark',2);
    }
    return group(x,y,s,content);
  }
  function bush(x,y,s=1){return group(x,y,s,shadow(18)+path('M-22 0C-30-8-22-20-12-17C-16-30 4-32 10-20C22-24 30-11 22-3Q3 6-22 0Z','canopy','none')+path('M-22-6Q-26-18-13-16Q-10-26 1-23Q11-19 6-10Q-8-3-22-6Z','canopy-light','none'));}
  function flowers(x,y,s=1){return group(x,y,s,[-11,0,12].map((dx,i)=>path(`M${dx} 0q3-7 0-${12+i*3}`,'none','canopy',1.3)+ellipse(dx,-12-i*3,4,4,i===1?'color-rose':'color-paper')+ellipse(dx,-12-i*3,1.4,1.4,'color-butter')).join(''));}
  function rock(x,y,s=1){return group(x,y,s,shadow(12)+path('M-14-1Q-19-8-11-13Q-1-21 10-12Q22-2 11 2Z','stone','none')+path('M-13-6Q-11-17 1-15L8-9Q-1-11-4-4Z','stone-light','none'));}
  function lamp(x,y,s=1){return group(x,y,s,shadow(10)+path('M-2 0L-1-30L2-30L3 0Z','bark','none')+path('M-8-29L-6-43L5-43L8-29Z','color-butter','line',1.5)+path('M-9-44Q0-55 9-44Z','slate','line',1.3)+path('M-8-28L8-28','none','line',2));}
  function bench(x,y,s=1){return group(x,y,s,shadow()+path('M-22-13L22 1L33-7L-12-20Z','wood-light')+path('M-19-12L-18 0M20 2L21 13M31-7L31 5','none','bark',3)+path('M-20-26L25-12L25-4L-20-18Z','wood')+path('M-18-16L-17-29M22-3L23-16','none','bark',2));}
  function fire(x,y,s=1){return group(x,y,s,ellipse(0,-5,42,23,'path-edge')+Array.from({length:9},(_,i)=>{const a=i*6.28/9;return group(Math.cos(a)*30,Math.sin(a)*13,.7,rock(0,0,1));}).join('')+path('M-22-5L17 8Q25 8 24 1L-17-12Z','wood','line',1.4)+path('M-20 5L20-10Q27-10 26-5L-14 12Z','bark','line',1.4)+`<g class="flame">`+path('M-14-8C-26-26-5-35-7-58C7-50 4-41 10-38Q18-42 18-50C35-26 20-7 4-6Z','flame','none')+path('M-4-7C-15-21-4-27 1-36C2-26 13-25 11-17Q10-8-4-7Z','flame-light','none')+'</g>');}
  function windowShape(x,y,slant=0){return group(x,y,1,path(`M0 0L11 ${slant}L11 ${-14+slant}Q5 ${-20+slant} 0-14Z`,'color-butter','line-soft',1.3)+path(`M5-14L5 ${slant-1}M1-7L10 ${slant-7}`,'none','wood',1));}
  function house(kind='town'){
    const isTown=kind==='town', isMail=kind==='post', slate=kind==='cabin';
    let b=shadow(46)+path('M-40-12L4 13L46-10L46-55L3-80L-40-58Z','wall-shade')+path('M4 13L46-10L46-55L4-33Z','wall')+path('M-44-54L1-27L51-57L7-94Z',slate?'slate':'roof')+path('M-44-54L-12-94L7-94L1-27Z',slate?'slate':'roof-dark')+path('M-12-94L7-94L51-57L1-27Z',slate?'slate-light':'roof-light');
    b+=path('M-42-54L1-28L50-56','none','line',3);
    for(let i=1;i<5;i++)b+=path(`M${-10+i*4} ${-94+i*13}l${17+i*4} -${i*2.5}`,'none',slate?'slate':'roof',1.3,'opacity=".7"');
    b+=path('M-28-79L-28-103L-18-108L-9-102L-9-80','wood')+path('M-31-103L-19-110L-6-103L-18-96Z','wall-shade');
    b+=windowShape(-32,-28,6)+windowShape(24,-18,-6)+path('M-13 3L-13-24Q-4-38 5-25L5 13Z','bark')+path('M-11 1L-10-23Q-4-30 2-24L2 9Z','wood')+ellipse(-1,-8,1.2,1.5,'color-butter');
    b+=path('M-17 4L4 16L14 10L14 16L4 22L-19 9Z','stone-light')+path('M-20 12L4 26L17 18L17 23L4 31L-23 17Z','stone');
    b+=flowers(36,0,.5)+bush(-39,-3,.4);
    if(isTown)b+=path('M7-95L8-125','none','bark',2)+path('M9-124Q20-128 31-121L28-107Q17-116 9-110Z','color-butter','none')+path('M14-118Q19-122 24-116Q18-111 14-118Z','canopy','none');
    if(isMail)b+=path('M17-43L36-54L36-40L17-29Z','color-paper')+path('M18-43L27-39L35-53','none','roof',1.2);
    return b;
  }
  function board(){return shadow(37)+path('M-27 0L-26-51M26 10L27-43','none','bark',5)+path('M-34-59L25-43L36-53L-22-72Z','roof')+path('M-30-54L28-38L28-9L-30-25Z','wood')+path('M-25-48L23-35L23-16L-25-29Z','wall')+path('M-18-43L-5-40L-5-26L-18-30Z','color-paper','none')+path('M1-38L17-34L17-20L1-24Z','color-butter','none')+path('M-16-38L-8-36M4-31L13-29','none','line-soft',1)+flowers(-29,2,.55);}
  function tower(){return shadow(36)+path('M-17 0L-16-74M17 4L16-73M32-7L29-79','none','bark',5)+path('M-16-15L15-44M-15-43L15-16M18-42L28-25','none','wood',3)+path('M-29-71L12-50L38-68L-4-91Z','wood-light')+path('M-28-74L-28-89M-15-66L-15-81M0-58L0-73M13-53L13-68M25-61L25-76M37-69L37-84','none','bark',2)+path('M-29-90L13-69L38-85','none','wood',3)+path('M-25-93L8-118L41-98L13-77Z','slate')+path('M8-118L41-98L13-77Z','slate-light')+path('M7-118L7-133','none','bark',2);}
  function harbor(){return shadow(44)+path('M-40-16L9 13L52-13L2-43Z','wood')+Array.from({length:7},(_,i)=>path(`M${-34+i*6}-12l42-25`,'none','bark',1,'opacity=".6"')).join('')+path('M-36-15L-36-28M9 13L9-1M48-13L48-26','none','bark',5)+path('M-22-43Q3-39 33-51Q36-32 11-29Q-15-30-22-43Z','roof')+path('M3-42L3-91','none','bark',2.5)+path('M1-88Q-4-65-18-52L1-53Z','wall')+path('M6-88L6-54L32-59Z','color-butter');}
  const buildings={town:house('town'),cabin:house('cabin'),post:house('post'),board:board(),tower:tower(),harbor:harbor(),camp:fire(0,0,1)};
  function cat(x,y,size=35,pose='idle',extra=''){return `<image href="assets/cat-${pose}.svg" x="${x-size/2}" y="${y-size}" width="${size}" height="${size}" ${extra}/>`;}
  function svg(content,viewBox='0 0 480 850',extra=''){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" ${extra.includes('aria-')?'':'aria-hidden="true"'} ${extra}>${content}</svg>`;}
  function world(night=false){
    const id=`world-${++serial}`;
    const points=[{k:'town',x:229,y:315,s:.98},{k:'board',x:115,y:388,s:.65},{k:'camp',x:300,y:459,s:.80},{k:'cabin',x:115,y:555,s:.67},{k:'tower',x:431,y:404,s:.62},{k:'post',x:401,y:618,s:.65},{k:'harbor',x:268,y:730,s:.85}];
    let s=`<defs><radialGradient id="${id}-grass"><stop stop-color="${c('grass-light')}"/><stop offset="1" stop-color="${c('grass')}"/></radialGradient><filter id="${id}-paper"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".1"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter><linearGradient id="${id}-sun" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c('color-paper')}" stop-opacity=".2"/><stop offset="1" stop-color="${c('color-paper')}" stop-opacity="0"/></linearGradient></defs>`;
    s+=`<rect width="480" height="850" fill="${c('water')}"/>`;
    s+=`<g class="island-camera">`;
    s+=path('M-150 441C-137 136 135 99 310 124C528 119 685 363 608 586C537 799 316 848 124 775C-39 757-182 632-150 441Z','wood','none');
    s+=path('M-150 407C-137 102 135 65 310 90C528 85 685 329 608 552C537 765 316 814 124 741C-39 723-182 598-150 407Z','path','none');
    s+=`<path d="M-127 396C-117 122 141 86 309 113C509 102 657 340 586 542C524 735 315 789 133 717C-24 696-155 576-127 396Z" fill="url(#${id}-grass)"/>`;
    s+=path('M74 394C66 298 187 229 298 284C387 308 446 452 385 562C351 637 247 686 158 619C89 568 82 486 74 394Z','none','path-edge',31);
    s+=path('M74 394C66 298 187 229 298 284C387 308 446 452 385 562C351 637 247 686 158 619C89 568 82 486 74 394Z','none','path',26);
    s+=path('M202 278Q177 345 237 404T295 476M108 522Q146 510 151 550M299 636Q305 688 270 720','none','path',20);
    s+=path('M377 256C397 228 442 254 435 279C426 305 454 316 431 330C399 349 366 321 383 305C402 285 359 279 377 256Z','water-deep','none')+path('M385 255C402 240 433 258 426 277C417 302 443 315 427 322C403 335 377 316 391 302C409 281 372 270 385 255Z','water','none')+path('M399 266q10 4 18 0M401 313q10 3 18-1','none','color-paper',2,'opacity=".6"');
    let items=[];
    for(let i=0;i<32;i++){const a=i/32*Math.PI*2;let x=242+Math.cos(a)*(274+(i%4)*14),y=425+Math.sin(a)*280;items.push({y,html:tree(x,y,.75+(i%5)*.11,i)});}
    [[28,284,1.3],[81,243,1.1],[139,218,.95],[327,212,.85],[392,228,.8],[472,366,1.1],[-12,477,1.2],[459,570,.95],[14,664,1.5],[79,716,1.3],[427,751,1.25],[365,789,1.3]].forEach(([x,y,s],i)=>items.push({y,html:tree(x,y,s,i)}));
    for(let i=0;i<70;i++){let x=25+(i*137)%432,y=230+(i*83)%490;const reserved=points.some(p=>Math.hypot((x-p.x),y-p.y)<48);if(reserved)continue;let fn=i%5===0?bush:i%5===1?rock:i%5===2?flowers:null;items.push({y,html:fn?fn(x,y,.35+(i%3)*.14):path(`M${x} ${y}q-1-5-4-7m4 7q0-7 4-10m-4 10q6-5 9-4`,'none','canopy',1.1,'opacity=".3"')});}
    [[166,357],[347,375],[197,611],[336,660]].forEach(([x,y])=>items.push({y,html:lamp(x,y,.6)}));
    items.push({y:445,html:bench(242,445,.64)},{y:500,html:bench(360,500,.6)});
    points.forEach(p=>items.push({y:p.y,html:group(p.x,p.y,p.s,buildings[p.k],`class="building-art ${['tower','post'].includes(p.k)?'unbuilt':''}"`)}));
    [[272,439,'focus'],[332,442,'focus'],[305,490,'focus'],[151,423,'idle'],[218,523,'idle']].forEach(([x,y,p])=>items.push({y,html:ellipse(x,y-2,10,3,'canopy-dark','opacity=".14"')+cat(x,y,31,p)}));
    s+=items.sort((a,b)=>a.y-b.y).map(o=>o.html).join('');
    s+=`<g pointer-events="none" opacity=".36">`+path('M-60 120L180 105L620 620L482 692Z','color-paper','none')+'</g>';
    s+=`<rect x="-160" y="80" width="850" height="750" fill="${c('grass')}" opacity=".12" filter="url(#${id}-paper)" pointer-events="none"/>`;
    s+='</g>';
    if(night)s+=`<rect width="480" height="850" fill="${c('color-night')}" opacity=".49" style="mix-blend-mode:multiply"/>`;
    return svg(s,'0 0 480 850','class="world-art" aria-hidden="true" preserveAspectRatio="xMidYMid slice"');
  }
  function camp(){
    let s=`<rect width="480" height="850" fill="${c('color-night')}"/>`;
    s+=path('M0 331Q87 291 184 320T480 319V850H0Z','color-night-mid','none');
    for(let i=0;i<34;i++){const x=(i*149)%480,y=40+(i*73)%360;s+=ellipse(x,y,i%7===0?1.7:.8,i%7===0?1.7:.8,'color-butter',`opacity="${.25+(i%4)*.13}"`);}
    s+=path('M379 85C350 91 339 54 360 37C328 41 322 78 347 91Q365 103 379 85Z','color-butter','none');
    for(let i=0;i<16;i++)s+=`<g opacity="${i%2?.26:.40}">${tree((i*79)%530-25,390+(i%4)*37,1.5+(i%3)*.2,0)}</g>`;
    s+=path('M-40 650C12 457 349 373 524 580V850H0Z','color-night-light','none');
    s+=ellipse(255,618,167,77,'grass','opacity=".13"')+ellipse(255,610,116,50,'color-butter','opacity=".09"')+ellipse(250,610,72,29,'color-butter','opacity=".11"');
    s+=bench(150,572,1)+bench(363,600,.9);
    s+=cat(183,556,76,'focus')+cat(330,579,79,'focus')+cat(125,626,81,'focus');
    s+=fire(251,640,1.35);
    s+=cat(338,684,95,'focus')+path('M309 689Q340 703 369 687','none','color-butter',2,'opacity=".6"');
    s+=group(337,564,.5,path('M-15 0q10-12 18-3M-8-7q7-9 14-2','none','color-paper',1.4));
    [[214,580],[277,544],[252,565],[240,522],[269,491]].forEach(([x,y],i)=>s+=ellipse(x,y,i%2?2:1.3,2.4,'color-butter','class="fire-spark"'));
    s+=bush(-5,768,2)+bush(475,768,2.6)+flowers(48,712,.9)+rock(404,700,1.2);
    return svg(s,'0 0 480 850','class="camp-art" aria-hidden="true" preserveAspectRatio="xMidYMid slice"');
  }
  function vignette(type='cat'){
    let s=type==='cat'?ellipse(140,161,95,16,'canopy-dark','opacity=".08"')+bush(50,152,.8)+cat(135,168,122,'happy')+flowers(221,158,.8)+leaf(213,133,.6):tree(70,164,1.2,0)+tree(223,149,.85,1)+ellipse(150,162,80,20,'path')+fire(143,162,.65)+cat(197,166,66,'focus')+flowers(90,178,.7);
    return svg(s,'0 0 280 200');
  }
  function icon(name){const p={
    sprout:'M12 21V11M12 14C5 15 2 10 3 5C10 4 14 7 12 14ZM12 10C12 4 17 2 21 3C22 8 18 12 12 10Z',leaf:'M5 19C0 7 12 2 20 3C22 12 15 21 5 19ZM5 19L15 9',arrow:'M5 12H19M13 6L19 12L13 18',back:'M19 12H5M11 6L5 12L11 18',down:'M6 9L12 15L18 9',grid:'M3 3H9V9H3ZM15 3H21V9H15ZM3 15H9V21H3ZM15 15H21V21H15Z',reset:'M4 8A9 9 0 1 1 3 15M4 3V8H9',fire:'M12 2C15 9 5 9 7 15C4 13 4 11 4 10C0 25 24 25 20 10C18 14 15 7 12 2ZM12 13C8 18 10 22 13 21C17 20 15 16 12 13Z',town:'M3 10L12 3L21 10V21H3ZM9 21V14H15V21M10 8H14',board:'M5 21V17M19 21V17M3 4H21V17H3ZM7 8H17M7 12H13',cabin:'M2 11L12 3L22 11M5 10V21H19V10M10 21V15H14V21',tower:'M7 21L9 10M17 21L15 10M6 10H18V6L12 2L6 6ZM8 17H16',post:'M3 6H21V20H3ZM3 6L12 13L21 6M8 3H16',harbor:'M12 2V16M12 4L20 13H12M9 7L4 14H9M3 17H22L18 21H7Z',lock:'M6 10H18V21H6ZM8 10V6A4 4 0 0 1 8 6V10M8 10V6C8 1 16 1 16 6V10M12 14V17',check:'M5 12L10 17L20 6',close:'M6 6L18 18M6 18L18 6',bell:'M5 17H19L17 13V9A5 5 0 0 0 7 9V13ZM10 21H14M12 3V2',cat:'M5 9L4 3L10 6H14L20 3L19 9C25 24-1 24 5 9ZM8 13V14M16 13V14M11 17H13',coin:'M12 2A10 10 0 1 1 11.99 2ZM12 7L14 10L17 12L14 14L12 17L10 14L7 12L10 10Z',zoom:'M10 3A7 7 0 1 1 9.99 3ZM15 15L22 22M7 10H13',sun:'M12 7A5 5 0 1 1 11.99 7ZM12 1V3M12 21V23M1 12H3M21 12H23M4 4L6 6M18 18L20 20M4 20L6 18M18 6L20 4',moon:'M21 14A9 9 0 1 1 10 3C6 12 13 18 21 14Z',clock:'M12 2A10 10 0 1 1 11.99 2ZM12 6V12L16 14',book:'M12 6Q6 2 2 5V20Q7 17 12 21Q17 17 22 20V5Q17 2 12 6ZM12 6V21',volume:'M3 9H7L12 5V19L7 15H3ZM16 8Q20 12 16 16M19 5Q26 12 19 19',mute:'M3 9H7L12 5V19L7 15H3ZM17 9L23 15M17 15L23 9',people:'M9 3A4 4 0 1 1 8.99 3ZM2 21V18C2 11 16 11 16 18V21M17 4C23 4 23 12 17 12M19 15Q24 16 23 21',settings:'M12 8A4 4 0 1 1 11.99 8ZM10 2H14L15 5L18 6L21 6L23 10L21 12L21 15L21 18L17 21L14 20L12 22L8 21L7 18L3 18L1 14L3 11L3 8L6 5L9 5Z',flag:'M5 22V3M5 3Q11 0 16 4L21 3V14Q16 16 12 12L5 13',chart:'M4 21V12H8V21M10 21V7H14V21M16 21V2H20V21',plus:'M12 5V19M5 12H19',heart:'M12 21C-5 11 3-2 12 6C21-2 29 11 12 21Z',shield:'M12 2L21 6V12Q21 18 12 23Q3 18 3 12V6ZM8 12L11 15L17 9'};
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${p[name]||p.leaf}"/></svg>`;
  }
  return {world,camp,vignette,icon,building:(k)=>svg(group(70,125,.85,buildings[k]),'0 0 140 155'),cat};
})();
