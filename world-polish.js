/* 휴대폰의 짧은 길찾기와 배치용 테이블. 패드의 기존 구도는 유지한다. */
(() => {
  let mounted=false;
  function init(){
    if(mounted||!window.GachisupVillage)return;mounted=true;
    const api=GachisupVillage,dock=document.querySelector('.village-dock');
    dock.querySelector('[data-select=camp]').setAttribute('aria-label','오늘의 활동 · 독서, 공부, 휴식 선택');
    const focusMark=document.createElement('span');focusMark.className='mobile-focus-mark';focusMark.innerHTML=Art.icon('leaf');dock.querySelector('[data-select=camp]').prepend(focusMark);
    const more=document.createElement('button');more.className='dock-building mobile-more';more.dataset.action='mobile-more';more.setAttribute('aria-label','마을 메뉴 더 보기');more.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg><span>더 보기</span>';dock.append(more);
    api.actions['mobile-more']=()=>api.showDialog('마을 더 둘러보기','<div class="mobile-place-list">'+['tower','post','harbor'].map(id=>'<button data-select="'+id+'">'+Art.icon({tower:'tower',post:'post',harbor:'harbor'}[id])+'<span>'+api.buildings[id].name+'</span>'+Art.icon('arrow')+'</button>').join('')+'<button data-action="night">'+Art.icon('moon')+'<span>낮·밤 바꾸기</span></button><button data-action="zoom-in">'+Art.icon('plus')+'<span>마을 더 가까이 보기</span></button><button data-action="zoom-out">'+Art.icon('grid')+'<span>마을 한 걸음 멀리 보기</span></button></div>','');
    document.querySelector('#village-dialog').addEventListener('click',event=>{if(event.target.closest('.mobile-place-list button'))document.querySelector('#village-dialog').close();});
    const overview=document.querySelector('[data-action=overview]');overview.insertAdjacentHTML('beforeend','<span class="mobile-overview-label">섬 전체</span>');
    const observer=new MutationObserver(()=>{const s=api.state;document.querySelector('#village-app').classList.toggle('world-overview',!!s.overview);});
    observer.observe(document.querySelector('#map-layer'),{attributes:true,attributeFilter:['style']});
  }
  addEventListener('gachisup:village-ready',init);init();
})();
