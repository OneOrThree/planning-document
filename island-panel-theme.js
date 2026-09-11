/* 마을에서 쓰는 지도·건물 좌표를 창의 머리말에도 그대로 사용한다. */
(() => {
  function mark(key,crop){
    const building=window.GachisupVillage?.buildings[key],rect=crop||building?.crop;
    if(!rect)return '';
    const map=GachisupBackground.map;
    return '<svg class="island-building-art" viewBox="'+rect.join(' ')+'" aria-hidden="true"><image href="'+map.src+'" width="'+map.width+'" height="'+map.height+'"/></svg>';
  }
  function forScreen(id){
    if(id==='vh2')return 'cabin';
    if(/^(vh|sh7|sh8)/.test(id))return 'town';
    if(/^(bd|sh3|sh4|sh5)/.test(id))return 'board';
    if(/^(po|sh6)/.test(id))return 'post';
    if(id.startsWith('hb'))return 'harbor';
    if(id.startsWith('ob'))return 'tower';
    if(id==='pr3')return 'town';
    return null;
  }
  window.GachisupIslandTheme={mark,forScreen};
})();
