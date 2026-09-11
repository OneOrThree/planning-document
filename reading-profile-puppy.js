/* 새 투명 원화 전체를 0..1000 좌표로 측정한 강아지 전용 메시 리그. */
(() => {
  'use strict';
  window.GachisupReadingProfiles ||= {};
  window.GachisupReadingProfiles.puppy = {
    id: 'puppy',
    label: '강아지',
    source: 'assets/puppy-reading-rig-v2.png',
    closedSource: 'assets/puppy-reading-closed-v2.png',
    bones: {
      root: { parent: null, pivot: [521, 911], limit: 2, label: '기준' },
      body: { parent: 'root', pivot: [531, 815], limit: 2, label: '호흡' },
      head: { parent: 'body', pivot: [477, 523], limit: 3, label: '고개' },
      earL: { parent: 'head', pivot: [315, 157], limit: 3, label: '왼쪽 귀' },
      earR: { parent: 'head', pivot: [650, 226], limit: 3, label: '오른쪽 귀' },
      book: { parent: 'body', pivot: [366, 727], limit: 2, label: '책' },
      armL: { parent: 'book', pivot: [172, 564], limit: 3, label: '왼쪽 앞발' },
      pawL: { parent: 'armL', pivot: [164, 616], limit: 2, label: '왼쪽 손목' },
      armR: { parent: 'book', pivot: [697, 609], limit: 3, label: '오른쪽 앞발' },
      pawR: { parent: 'armR', pivot: [641, 669], limit: 2, label: '오른쪽 손목' },
      tail: { parent: 'root', pivot: [807, 856], limit: 5, label: '꼬리' },
      tailTip: { parent: 'tail', pivot: [891, 812], limit: 4, label: '꼬리 끝' }
    },
    // 몸통 → 고개 → 귀 → 책 → 앞발 순서로 앞쪽 형태가 가중치를 덮는다.
    regions: [
      { bone: 'body', polygon: [[267, 456], [595, 485], [765, 562], [837, 690], [839, 832], [781, 902], [570, 936], [317, 883], [177, 823], [161, 689], [182, 550]], feather: 58, strength: 1 },
      { bone: 'head', polygon: [[157, 186], [265, 76], [467, 17], [623, 73], [738, 159], [815, 280], [860, 397], [841, 515], [779, 583], [674, 585], [595, 538], [479, 526], [388, 513], [289, 477], [201, 453], [108, 407], [103, 277]], feather: 28, strength: 1 },
      { bone: 'earL', polygon: [[302, 133], [344, 147], [317, 180], [284, 225], [271, 290], [262, 326], [230, 344], [219, 376], [224, 410], [262, 445], [241, 454], [196, 452], [154, 433], [120, 411], [109, 362], [124, 320], [116, 278], [130, 242], [173, 208], [213, 174]], feather: 22, strength: 1 },
      { bone: 'earR', polygon: [[640, 185], [716, 203], [768, 255], [793, 305], [836, 330], [824, 353], [852, 392], [862, 444], [843, 493], [828, 535], [786, 564], [742, 583], [694, 583], [654, 568], [630, 535], [622, 494], [619, 428], [626, 369], [629, 308], [620, 255]], feather: 23, strength: 1 },
      { bone: 'book', polygon: [[132, 459], [164, 448], [192, 445], [267, 481], [307, 524], [324, 566], [367, 545], [452, 519], [526, 504], [544, 526], [573, 528], [600, 727], [396, 779], [360, 782], [325, 779], [190, 672], [149, 519]], feather: 16, strength: 1 },
      { bone: 'armL', polygon: [[119, 553], [151, 539], [184, 548], [202, 576], [207, 612], [197, 648], [169, 672], [137, 661], [113, 640], [104, 608], [105, 575]], feather: 14, strength: 0.83 },
      { bone: 'pawL', polygon: [[130, 557], [166, 548], [190, 570], [201, 603], [192, 632], [162, 651], [131, 630], [119, 595]], feather: 12, strength: 0.67 },
      { bone: 'armR', polygon: [[578, 586], [621, 576], [664, 588], [702, 615], [728, 650], [729, 681], [708, 713], [669, 730], [624, 732], [581, 714], [548, 694], [525, 669], [524, 634], [540, 607]], feather: 18, strength: 0.87 },
      { bone: 'pawR', polygon: [[545, 606], [579, 595], [613, 601], [639, 626], [656, 657], [648, 688], [627, 710], [591, 713], [553, 693], [528, 670], [527, 637]], feather: 15, strength: 0.72 },
      { bone: 'tail', polygon: [[807, 779], [842, 743], [866, 702], [873, 674], [858, 643], [886, 645], [916, 663], [934, 694], [944, 682], [958, 728], [971, 744], [978, 786], [970, 821], [950, 849], [959, 846], [952, 883], [922, 917], [885, 931], [839, 931], [805, 916], [774, 895], [791, 862]], feather: 13, strength: 1 },
      { bone: 'tailTip', polygon: [[869, 637], [914, 654], [949, 683], [972, 743], [979, 790], [965, 825], [932, 848], [891, 847], [859, 818], [847, 774], [855, 731], [875, 692]], feather: 29, strength: 0.76 }
    ],
    motions: {
      read: {
        root: { amplitude: 0, frequency: 1, phase: 0 },
        body: { amplitude: 0.1, frequency: 1.3, phase: 0 },
        head: { amplitude: 0.7, frequency: 0.64, phase: 0.2 },
        earL: { amplitude: 0.65, frequency: 1.04, phase: 0.2 },
        earR: { amplitude: 0.55, frequency: 1.04, phase: -0.65 },
        book: { amplitude: 0.18, frequency: 1.3, phase: 0.1 },
        armL: { amplitude: 0.18, frequency: 0.83, phase: 0 },
        pawL: { amplitude: 0.13, frequency: 0.83, phase: 0.45 },
        armR: { amplitude: 0.16, frequency: 0.83, phase: 0.75 },
        pawR: { amplitude: 0.16, frequency: 0.83, phase: 0.2 },
        tail: { amplitude: 1.3, frequency: 0.88, phase: 0 },
        tailTip: { amplitude: 1.1, frequency: 0.88, phase: -0.6 }
      },
      idle: {
        root: { amplitude: 0, frequency: 1, phase: 0 },
        body: { amplitude: 0.16, frequency: 1.1, phase: 0 },
        head: { amplitude: 1.1, frequency: 0.55, phase: 0.2 },
        earL: { amplitude: 1.05, frequency: 0.93, phase: 0.15 },
        earR: { amplitude: 0.9, frequency: 0.93, phase: -0.7 },
        book: { amplitude: 0.16, frequency: 1.1, phase: 0.1 },
        armL: { amplitude: 0.2, frequency: 0.7, phase: 0 },
        pawL: { amplitude: 0.12, frequency: 0.7, phase: 0.3 },
        armR: { amplitude: 0.22, frequency: 0.7, phase: 0.8 },
        pawR: { amplitude: 0.16, frequency: 0.7, phase: 0.3 },
        tail: { amplitude: 2.1, frequency: 1.05, phase: 0 },
        tailTip: { amplitude: 1.7, frequency: 1.05, phase: -0.6 }
      },
      nod: {
        root: { amplitude: 0, frequency: 1, phase: 0 },
        body: { amplitude: 0.15, frequency: 1.3, phase: 0 },
        head: { amplitude: 1.85, frequency: 2.1, phase: 0 },
        earL: { amplitude: 0.85, frequency: 2.1, phase: -0.45 },
        earR: { amplitude: 0.7, frequency: 2.1, phase: -0.7 },
        book: { amplitude: 0.17, frequency: 1.3, phase: 0.1 },
        armL: { amplitude: 0.16, frequency: 0.83, phase: 0 },
        pawL: { amplitude: 0.12, frequency: 0.83, phase: 0.3 },
        armR: { amplitude: 0.14, frequency: 0.83, phase: 0.8 },
        pawR: { amplitude: 0.14, frequency: 0.83, phase: 0.3 },
        tail: { amplitude: 1.3, frequency: 0.9, phase: 0 },
        tailTip: { amplitude: 1.1, frequency: 0.9, phase: -0.6 }
      }
    },
    eyes: [
      { center: [316, 340], radius: [55, 68], lid: '#fce4c9', angle: -18 },
      { center: [521, 407], radius: [83, 59], lid: '#fce1c0', angle: 17 }
    ],
    page: {
      spine: [318, 573],
      right: [538, 519],
      left: [173, 457],
      lift: 55,
      depth: 44,
      // 표지 위쪽은 넘기는 종이가 지나가도록 열고, 아래는 표지의 상단 경계로 가린다.
      clip: [[0, 0], [1000, 0], [1000, 524], [577, 524], [569, 528], [544, 534], [505, 543], [454, 554], [404, 565], [366, 577], [338, 585], [318, 584], [306, 578], [288, 558], [251, 527], [207, 490], [171, 470], [137, 461], [0, 461]]
    },
    controls: ['head', 'earL', 'earR', 'book', 'armL', 'armR', 'tail'],
    note: '강아지 투명 원화에 12개 관절을 맞췄어요. 늘어진 귀와 앞발, 꼬리가 작게 움직이며 눈을 깜빡이고 책장을 넘겨요.'
  };
})();
