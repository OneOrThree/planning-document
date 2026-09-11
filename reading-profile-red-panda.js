/* 레서판다 원화 전체를 0..1000으로 정규화한 관절·변형 영역. */
(() => {
  'use strict';
  window.GachisupReadingProfiles ||= {};
  window.GachisupReadingProfiles['red-panda'] = {
    id: 'red-panda',
    label: '레서판다',
    source: 'assets/red-panda-reading-rig-v2.png',
    closedSource: 'assets/red-panda-reading-closed-v2.png',
    bones: {
      root: { parent: null, pivot: [485, 900], limit: 2, label: '기준' },
      body: { parent: 'root', pivot: [488, 795], limit: 2, label: '호흡' },
      head: { parent: 'body', pivot: [442, 544], limit: 3, label: '고개' },
      earL: { parent: 'head', pivot: [293, 198], limit: 4, label: '왼쪽 귀' },
      earR: { parent: 'head', pivot: [647, 271], limit: 4, label: '오른쪽 귀' },
      book: { parent: 'body', pivot: [302, 692], limit: 2.5, label: '책' },
      armL: { parent: 'book', pivot: [163, 578], limit: 3, label: '왼쪽 앞발' },
      pawL: { parent: 'armL', pivot: [155, 631], limit: 2, label: '왼쪽 손목' },
      armR: { parent: 'book', pivot: [657, 614], limit: 3, label: '오른쪽 앞발' },
      pawR: { parent: 'armR', pivot: [570, 678], limit: 2, label: '오른쪽 손목' },
      tail: { parent: 'root', pivot: [781, 731], limit: 3, label: '고리 꼬리' },
      tailTip: { parent: 'tail', pivot: [846, 833], limit: 3, label: '꼬리 끝' }
    },
    // 뒤쪽 영역이 앞쪽 가중치를 덮는다. 책과 앞발을 얼굴보다 나중에 배치한다.
    regions: [
      { bone: 'body', polygon: [[222, 511], [485, 506], [702, 547], [747, 640], [776, 792], [715, 902], [542, 923], [351, 900], [235, 845], [185, 690]], feather: 46, strength: 1 },
      { bone: 'head', polygon: [[253, 26], [351, 68], [438, 119], [575, 145], [645, 120], [741, 118], [771, 160], [770, 306], [751, 369], [751, 427], [762, 472], [723, 510], [676, 551], [600, 579], [526, 551], [428, 541], [339, 525], [250, 495], [184, 465], [137, 416], [135, 373], [125, 332], [161, 303], [154, 277], [201, 233], [194, 178], [209, 94]], feather: 28, strength: 1 },
      { bone: 'earL', polygon: [[191, 198], [207, 100], [251, 26], [296, 36], [351, 67], [419, 124], [373, 146], [315, 178], [253, 220], [207, 239]], feather: 32, strength: 1 },
      { bone: 'earR', polygon: [[552, 160], [606, 134], [671, 118], [741, 119], [767, 148], [775, 221], [766, 294], [741, 350], [708, 365], [693, 302], [648, 250], [607, 211]], feather: 32, strength: 1 },
      { bone: 'book', polygon: [[116, 484], [158, 473], [241, 507], [280, 547], [298, 594], [365, 567], [442, 540], [508, 530], [524, 551], [552, 551], [567, 641], [580, 709], [564, 751], [350, 793], [302, 796], [276, 775], [178, 700], [138, 636]], feather: 16, strength: 1 },
      { bone: 'armL', polygon: [[120, 562], [145, 553], [171, 573], [189, 602], [197, 640], [182, 679], [161, 695], [131, 689], [104, 667], [85, 631], [85, 596]], feather: 18, strength: 0.88 },
      { bone: 'pawL', polygon: [[120, 576], [157, 577], [181, 600], [193, 635], [180, 664], [151, 678], [121, 665], [100, 635], [101, 603]], feather: 16, strength: 0.74 },
      { bone: 'armR', polygon: [[599, 604], [647, 595], [684, 614], [707, 651], [717, 693], [697, 733], [661, 751], [609, 745], [558, 733], [517, 709], [503, 677], [521, 638], [557, 621]], feather: 22, strength: 0.9 },
      { bone: 'pawR', polygon: [[535, 625], [578, 621], [615, 647], [629, 681], [612, 712], [575, 733], [537, 730], [516, 705], [504, 674]], feather: 20, strength: 0.7 },
      { bone: 'tail', polygon: [[752, 634], [790, 603], [840, 591], [890, 609], [931, 649], [962, 701], [983, 763], [979, 833], [957, 885], [916, 931], [865, 958], [798, 974], [748, 974], [710, 956], [690, 927], [693, 882], [724, 841], [763, 813], [777, 752], [756, 688]], feather: 16, strength: 1 },
      { bone: 'tailTip', polygon: [[800, 811], [855, 824], [907, 857], [916, 901], [887, 946], [840, 968], [790, 978], [747, 974], [710, 956], [690, 927], [694, 890], [724, 853], [766, 828]], feather: 43, strength: 0.88 }
    ],
    motions: {
      read: {
        body: { amplitude: 0.13, frequency: 1.25, phase: 0 },
        head: { amplitude: 0.78, frequency: 0.67, phase: 0.12 },
        earL: { amplitude: 0.62, frequency: 1.03, phase: 0.4 },
        earR: { amplitude: 0.52, frequency: 1.03, phase: -0.55 },
        book: { amplitude: 0.2, frequency: 1.25, phase: 0.08 },
        armL: { amplitude: 0.17, frequency: 0.9, phase: 0.2 },
        pawL: { amplitude: 0.11, frequency: 0.9, phase: 0.55 },
        armR: { amplitude: 0.19, frequency: 0.84, phase: 0.8 },
        pawR: { amplitude: 0.12, frequency: 0.84, phase: 0.35 },
        tail: { amplitude: 1.03, frequency: 0.71, phase: 0.1 },
        tailTip: { amplitude: 1.2, frequency: 0.71, phase: -0.7 }
      },
      idle: {
        body: { amplitude: 0.16, frequency: 1.1, phase: 0 },
        head: { amplitude: 0.9, frequency: 0.52, phase: 0.1 },
        earL: { amplitude: 0.82, frequency: 0.95, phase: 0.45 },
        earR: { amplitude: 0.67, frequency: 0.95, phase: -0.55 },
        book: { amplitude: 0.19, frequency: 1.1, phase: 0 },
        armL: { amplitude: 0.13, frequency: 0.8, phase: 0.2 },
        pawL: { amplitude: 0.08, frequency: 0.8, phase: 0.4 },
        armR: { amplitude: 0.15, frequency: 0.73, phase: 0.8 },
        pawR: { amplitude: 0.1, frequency: 0.73, phase: 0.35 },
        tail: { amplitude: 1.35, frequency: 0.63, phase: 0.1 },
        tailTip: { amplitude: 1.4, frequency: 0.63, phase: -0.75 }
      },
      nod: {
        body: { amplitude: 0.12, frequency: 1.25, phase: 0 },
        head: { amplitude: 1.9, frequency: 2.1, phase: 0 },
        earL: { amplitude: 0.45, frequency: 2.1, phase: -0.3 },
        earR: { amplitude: 0.42, frequency: 2.1, phase: -0.5 },
        book: { amplitude: 0.17, frequency: 1.25, phase: 0.1 },
        armL: { amplitude: 0.12, frequency: 0.9, phase: 0.2 },
        pawL: { amplitude: 0.08, frequency: 0.9, phase: 0.55 },
        armR: { amplitude: 0.15, frequency: 0.84, phase: 0.8 },
        pawR: { amplitude: 0.09, frequency: 0.84, phase: 0.35 },
        tail: { amplitude: 0.8, frequency: 0.7, phase: 0.1 },
        tailTip: { amplitude: 0.95, frequency: 0.7, phase: -0.7 }
      }
    },
    eyes: [
      { center: [282, 389], radius: [54, 68], lid: '#b8582c', angle: -17 },
      { center: [490, 442], radius: [72, 54], lid: '#bd602f', angle: 12 }
    ],
    page: {
      spine: [292, 597],
      right: [507, 537],
      left: [157, 479],
      lift: 36,
      clip: [[0, 0], [1000, 0], [1000, 546], [554, 546], [542, 552], [505, 560], [454, 573], [407, 587], [356, 601], [322, 611], [296, 612], [281, 607], [263, 580], [227, 549], [199, 525], [170, 502], [140, 487], [122, 480], [0, 480]]
    },
    controls: ['head', 'earL', 'earR', 'book', 'armL', 'armR', 'tail', 'tailTip'],
    note: '실제 투명 알파가 검증된 레서판다 원화의 12관절 메시. 생성된 최종 PNG 전체 기준으로 귀·앞발·책·고리 꼬리와 눈·종이 영역을 개별 정렬했다. 눈 감기는 전용 닫힌 눈 텍스처의 눈 영역만 원본 알파를 유지하며 합성한다.'
  };
})();
