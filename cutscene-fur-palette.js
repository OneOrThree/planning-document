/* 검정 고양이 생성 파츠 사이의 털색을 렌더 시 맞춘다. 원본 PNG·알파·등록점은 보존한다. */
(() => {
  const target=[77,69,69];
  // 각 원본의 불투명 중간톤 표본 중앙값. 근거: output/cutscenes/qa/fur-color-calibration-v1.json.
  const medians={
    'look-down-v1.png':[71,64,64], 'look-reach-v1.png':[76,68,68],
    'look-hold-v1.png':[78,68,69], 'place-down-v1.png':[87,74,74],
    'neutral-blink-half-v1.png':[84,75,75], 'neutral-blink-closed-v1.png':[85,75,76],
    'jump-crouch-mid-v1.png':[87,76,76], 'jump-crouch-v1.png':[85,75,75],
    'jump-takeoff-v1.png':[88,75,75], 'jump-air-v1.png':[84,72,73], 'jump-landing-reach-v1.png':[86,71,72],
    'reach-low-v1.png':[84,73,73], 'reach-pull-v1.png':[85,73,74], 'reach-forward-v1.png':[84,72,73],
    'reach-low-blink-half-v1.png':[82,72,74], 'reach-low-blink-closed-v1.png':[85,74,75],
    'place-rise-start-v1.png':[101,86,87], 'place-rise-early-v1.png':[99,85,85],
    'place-rise-mid-v1.png':[95,82,81], 'place-rise-late-v1.png':[96,83,82], 'place-rise-end-v1.png':[79,69,70],
    'jump-touchdown-soft-v2.png':[94,73,75], 'jump-recover-mid-v2.png':[94,74,76], 'jump-recover-late-v1.png':[90,77,78],
    'walk-body-no-eyes-v1.png':[96,84,91], 'walk-leg-soft-root-v2.png':[92,73,79], 'walk-front-paw-layer-v1.png':[84,71,74],
    'paddle-body-base-v1.png':[98,84,83], 'paddle-body-blink-half-v1.png':[100,84,84],
    'paddle-body-blink-closed-v1.png':[100,84,84], 'paddle-arm-layer-v1.png':[89,72,76],
    'paddle-tail-layer-v1.png':[113,89,92]
  };
  const enabled=new URLSearchParams(location.search).get('tone')!=='source',cache=new Map(),ns='http://www.w3.org/2000/svg';
  const outlines={
    'look-down-v1.png':40,'look-reach-v1.png':44,'look-hold-v1.png':43,'place-down-v1.png':59,
    'neutral-blink-half-v1.png':56,'neutral-blink-closed-v1.png':57,
    'jump-crouch-mid-v1.png':53,'jump-crouch-v1.png':48,'jump-takeoff-v1.png':51,'jump-air-v1.png':47,'jump-landing-reach-v1.png':46,
    'reach-low-v1.png':55,'reach-pull-v1.png':53,'reach-forward-v1.png':54,'reach-low-blink-half-v1.png':52,'reach-low-blink-closed-v1.png':54,
    'place-rise-start-v1.png':78,'place-rise-early-v1.png':71,'place-rise-mid-v1.png':62,'place-rise-late-v1.png':67,'place-rise-end-v1.png':50,
    'jump-touchdown-soft-v2.png':52,'jump-recover-mid-v2.png':55,'jump-recover-late-v1.png':60,
    'walk-body-no-eyes-v1.png':74,'walk-leg-soft-root-v2.png':51,'walk-front-paw-layer-v1.png':48,
    'paddle-body-base-v1.png':71,'paddle-body-blink-half-v1.png':69,'paddle-body-blink-closed-v1.png':69,'paddle-arm-layer-v1.png':61,'paddle-tail-layer-v1.png':84
  };
  const eyeOutlines={'walk-eyes-open-layer-v1.png':96,'walk-eyes-half-layer-v1.png':81,'walk-eyes-closed-layer-v1.png':84};
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('aria-hidden','true');svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';document.body.append(svg);
  function profile(file){
    if(eyeOutlines[file])return{redMix:1,gamma:[Math.log(43/255)/Math.log(eyeOutlines[file]/255),1,1]};
    const median=medians[file];if(!median)return null;
    const exponent=mix=>Math.log(target[0]/255)/Math.log((median[0]*mix+median[1]*(1-mix))/255);
    const line=mix=>255*((outlines[file]*mix+1-mix)/255)**exponent(mix);
    // 밝은 눈 흰자는 유지하면서 적갈색 외곽선만 기준 원화의 짙은 갈색에 맞춘다.
    let low=0,high=1.5;for(let i=0;i<40;i++){const mid=(low+high)/2;if(line(mid)<43)low=mid;else high=mid;}
    const redMix=(low+high)/2;
    return{redMix,gamma:median.map((v,i)=>i?Math.log(target[i]/255)/Math.log(v/255):exponent(redMix))};
  }
  function prepare(image,file){
    const adjustment=profile(file);if(!enabled||!adjustment)return image;
    const {gamma,redMix}=adjustment;
    if(cache.has(file))return cache.get(file);
    const id='cutscene-fur-'+file.replace(/[^a-z0-9]/g,'-'),filter=document.createElementNS(ns,'filter');
    for(const [key,value]of Object.entries({id,x:'0',y:'0',width:'100%',height:'100%','color-interpolation-filters':'sRGB'}))filter.setAttribute(key,value);
    const matrix=document.createElementNS(ns,'feColorMatrix');matrix.setAttribute('type','matrix');matrix.setAttribute('values',`${redMix} ${1-redMix} 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0`);filter.append(matrix);
    const transfer=document.createElementNS(ns,'feComponentTransfer');
    gamma.forEach((exponent,i)=>{const f=document.createElementNS(ns,'feFunc'+['R','G','B'][i]);f.setAttribute('type','gamma');f.setAttribute('exponent',String(exponent));transfer.append(f);});filter.append(transfer);svg.append(filter);
    const layer=document.createElement('canvas');layer.width=image.width;layer.height=image.height;
    const c=layer.getContext('2d');c.filter='url(#'+id+')';c.drawImage(image,0,0);c.filter='none';
    cache.set(file,layer);return layer;
  }
  window.CutsceneFurPalette={prepare,profile,enabled,target,medians,outlines,eyeOutlines};
})();
