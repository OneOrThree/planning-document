/* 선 정리 보강본을 모든 화면의 기본 배경으로 쓴다. 이전 원화는 명시적인 비교 URL에서만 사용한다. */
(() => {
  const variant = new URLSearchParams(location.search).get('background') === 'original' ? 'original' : 'refined';
  const src = variant === 'refined' ? 'assets/village-map-cel-v3.png' : 'assets/village-map-ocean-v2.png';
  
  // 새로 분리된 개별 에셋 레이어 (좌표와 Z-index 테스트용 뼈대)
  // 추후 고해상도 투명 PNG가 완성되면 src와 좌표(x, y, w, h)를 정교하게 맞춥니다.
  const layers = [
    { id: 'terrain', src: 'assets-improved/terrain-base.jpg', isBase: true, x: 0, y: 0, z: 0 },
    { id: 'town', src: 'assets-improved/building-town-hall.png', isBase: false, x: 565, y: 20, z: 290, w: 400 },
    { id: 'cabin', src: 'assets-improved/building-cabin.png', isBase: false, x: 290, y: 460, z: 730, w: 320 },
    { id: 'tower', src: 'assets-improved/building-observatory.png', isBase: false, x: 1070, y: 130, z: 410, w: 250 },
    { id: 'post', src: 'assets-improved/building-post-office.png', isBase: false, x: 1040, y: 490, z: 750, w: 280 },
    { id: 'board', src: 'assets-improved/building-notice-board.png', isBase: false, x: 270, y: 220, z: 410, w: 220 }
  ];

  window.GachisupBackground = Object.freeze({
    variant,
    map: Object.freeze({ src, width: 1536, height: 1024 }),
    layers: Object.freeze(layers)
  });
  
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'image';
  preload.href = src;
  document.head.append(preload);
})();
