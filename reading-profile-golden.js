/* 골든리트리버 원화 1,254px 전체를 0..1000으로 정규화한 12관절 메시 리그. */
(() => {
  'use strict';
  window.GachisupReadingProfiles ||= {};
  window.GachisupReadingProfiles.golden = {
    id: 'golden',
    label: '골든리트리버',
    source: 'assets/golden-retriever-rig-source.png',
    closedSource: 'assets/golden-retriever-reading-closed-v2.png',
    bones: {
      root: { parent: null, pivot: [505, 888], limit: 2, label: '기준' },
      body: { parent: 'root', pivot: [533, 805], limit: 1.6, label: '호흡' },
      head: { parent: 'body', pivot: [438, 491], limit: 3, label: '고개' },
      earL: { parent: 'head', pivot: [368, 137], limit: 2.5, label: '왼쪽 귀' },
      earR: { parent: 'head', pivot: [622, 199], limit: 2.5, label: '오른쪽 귀' },
      book: { parent: 'body', pivot: [351, 687], limit: 2, label: '책' },
      armL: { parent: 'book', pivot: [194, 562], limit: 3, label: '왼쪽 앞발' },
      pawL: { parent: 'armL', pivot: [195, 617], limit: 2, label: '왼쪽 손목' },
      armR: { parent: 'book', pivot: [656, 599], limit: 3, label: '오른쪽 앞발' },
      pawR: { parent: 'armR', pivot: [585, 652], limit: 2, label: '오른쪽 손목' },
      tail: { parent: 'root', pivot: [796, 761], limit: 2.8, label: '꼬리' },
      tailTip: { parent: 'tail', pivot: [859, 813], limit: 3, label: '꼬리 끝' }
    },
    // 원화의 귀·앞발·꼬리 외곽을 따로 측정했다. 책과 앞발이 얼굴 가중치를 덮는다.
    regions: [
      { bone: 'body', polygon: [[273, 439], [387, 477], [519, 482], [661, 482], [720, 508], [737, 550], [736, 569], [766, 608], [791, 665], [799, 737], [776, 801], [737, 838], [695, 880], [640, 909], [553, 925], [467, 919], [416, 875], [365, 864], [319, 862], [258, 886], [205, 861], [167, 825], [135, 776], [132, 741], [155, 699], [197, 679], [187, 650], [169, 579], [179, 496]], feather: 56, strength: 1 },
      { bone: 'head', polygon: [[266, 193], [304, 145], [367, 115], [400, 124], [468, 108], [489, 96], [559, 119], [603, 148], [636, 171], [682, 185], [698, 219], [723, 257], [775, 314], [780, 379], [743, 443], [695, 507], [649, 526], [591, 505], [552, 513], [486, 513], [439, 498], [384, 485], [332, 461], [285, 463], [263, 451], [208, 432], [192, 395], [193, 327], [194, 270], [225, 230]], feather: 38, strength: 1 },
      { bone: 'earL', polygon: [[359, 116], [398, 127], [373, 156], [344, 178], [320, 209], [304, 248], [297, 288], [277, 343], [255, 389], [247, 424], [270, 443], [286, 451], [274, 465], [253, 453], [246, 431], [227, 436], [210, 427], [204, 405], [211, 367], [200, 345], [193, 314], [193, 280], [203, 254], [229, 223], [225, 213], [253, 201], [275, 175], [307, 143]], feather: 30, strength: 1 },
      { bone: 'earR', polygon: [[625, 174], [664, 175], [682, 189], [698, 218], [709, 240], [724, 256], [717, 263], [744, 297], [769, 315], [760, 325], [776, 343], [781, 377], [771, 407], [753, 433], [730, 455], [703, 471], [687, 508], [670, 528], [642, 525], [621, 511], [602, 492], [588, 455], [589, 419], [593, 380], [589, 341], [596, 310], [602, 275], [597, 248], [575, 222], [561, 211]], feather: 30, strength: 1 },
      { bone: 'book', polygon: [[168, 471], [185, 469], [211, 461], [253, 480], [291, 506], [318, 534], [338, 570], [358, 555], [409, 535], [463, 520], [526, 511], [535, 521], [543, 530], [565, 532], [572, 541], [589, 706], [583, 715], [449, 750], [390, 758], [360, 766], [335, 757], [321, 736], [219, 662], [182, 571]], feather: 18, strength: 1 },
      { bone: 'armL', polygon: [[169, 545], [183, 537], [207, 549], [225, 566], [238, 596], [242, 622], [234, 645], [219, 663], [194, 663], [175, 653], [156, 635], [147, 607], [148, 580], [158, 557]], feather: 16, strength: 0.87 },
      { bone: 'pawL', polygon: [[175, 551], [195, 552], [215, 562], [228, 583], [232, 604], [237, 623], [227, 645], [211, 655], [190, 651], [168, 637], [158, 616], [157, 589], [163, 568]], feather: 15, strength: 0.69 },
      { bone: 'armR', polygon: [[578, 593], [615, 584], [644, 587], [674, 600], [698, 620], [715, 649], [710, 684], [695, 707], [666, 724], [636, 731], [606, 719], [565, 711], [539, 695], [523, 671], [526, 644], [533, 620], [552, 602]], feather: 23, strength: 0.88 },
      { bone: 'pawR', polygon: [[556, 600], [586, 596], [613, 603], [635, 621], [649, 649], [648, 675], [632, 696], [612, 709], [586, 711], [560, 703], [541, 690], [524, 670], [526, 648], [534, 622]], feather: 20, strength: 0.72 },
      { bone: 'tail', polygon: [[785, 667], [805, 647], [836, 635], [872, 636], [899, 651], [913, 663], [933, 691], [942, 711], [957, 742], [965, 778], [962, 815], [946, 852], [925, 885], [896, 910], [863, 925], [817, 931], [769, 929], [733, 915], [709, 896], [699, 872], [703, 847], [719, 822], [745, 804], [760, 795], [746, 789], [777, 782], [791, 764], [796, 734]], feather: 24, strength: 1 },
      { bone: 'tailTip', polygon: [[771, 789], [800, 785], [837, 798], [869, 824], [900, 860], [900, 898], [869, 927], [816, 933], [771, 931], [735, 918], [711, 899], [699, 875], [702, 849], [719, 825], [749, 805]], feather: 43, strength: 0.84 }
    ],
    motions: {
      read: {
        body: { amplitude: 0.11, frequency: 1.24, phase: 0 },
        head: { amplitude: 0.67, frequency: 0.62, phase: 0.15 },
        earL: { amplitude: 0.56, frequency: 0.96, phase: 0.2 },
        earR: { amplitude: 0.47, frequency: 0.96, phase: -0.65 },
        book: { amplitude: 0.18, frequency: 1.24, phase: 0.12 },
        armL: { amplitude: 0.16, frequency: 0.82, phase: 0 },
        pawL: { amplitude: 0.11, frequency: 0.82, phase: 0.4 },
        armR: { amplitude: 0.18, frequency: 0.79, phase: 0.75 },
        pawR: { amplitude: 0.12, frequency: 0.79, phase: 0.25 },
        tail: { amplitude: 0.92, frequency: 0.74, phase: 0.1 },
        tailTip: { amplitude: 1.08, frequency: 0.74, phase: -0.62 }
      },
      idle: {
        body: { amplitude: 0.15, frequency: 1.1, phase: 0 },
        head: { amplitude: 0.87, frequency: 0.52, phase: 0.15 },
        earL: { amplitude: 0.78, frequency: 0.91, phase: 0.2 },
        earR: { amplitude: 0.66, frequency: 0.91, phase: -0.65 },
        book: { amplitude: 0.14, frequency: 1.1, phase: 0.1 },
        armL: { amplitude: 0.13, frequency: 0.74, phase: 0 },
        pawL: { amplitude: 0.09, frequency: 0.74, phase: 0.4 },
        armR: { amplitude: 0.15, frequency: 0.71, phase: 0.7 },
        pawR: { amplitude: 0.1, frequency: 0.71, phase: 0.2 },
        tail: { amplitude: 1.22, frequency: 0.81, phase: 0.1 },
        tailTip: { amplitude: 1.3, frequency: 0.81, phase: -0.62 }
      },
      nod: {
        body: { amplitude: 0.13, frequency: 1.3, phase: 0 },
        head: { amplitude: 1.7, frequency: 2.0, phase: 0 },
        earL: { amplitude: 0.57, frequency: 2.0, phase: -0.4 },
        earR: { amplitude: 0.48, frequency: 2.0, phase: -0.7 },
        book: { amplitude: 0.17, frequency: 1.3, phase: 0.1 },
        armL: { amplitude: 0.13, frequency: 0.82, phase: 0 },
        pawL: { amplitude: 0.09, frequency: 0.82, phase: 0.4 },
        armR: { amplitude: 0.14, frequency: 0.79, phase: 0.75 },
        pawR: { amplitude: 0.1, frequency: 0.79, phase: 0.25 },
        tail: { amplitude: 0.85, frequency: 0.74, phase: 0.1 },
        tailTip: { amplitude: 1.0, frequency: 0.74, phase: -0.62 }
      }
    },
    eyes: [
      { center: [346, 329], radius: [45, 55], lid: '#ffc77e', angle: -10 },
      { center: [520, 371], radius: [65, 58], lid: '#ffd092', angle: 10 }
    ],
    page: {
      spine: [339, 573],
      right: [526, 518],
      left: [211, 466],
      lift: 60,
      depth: 62,
      // 표지의 V형 상단 아래만 가리고 위쪽 허공은 종이가 올라갈 수 있게 연다.
      clip: [[0, 0], [1000, 0], [1000, 530], [570, 530], [564, 535], [544, 540], [513, 546], [470, 555], [429, 566], [388, 578], [357, 585], [339, 584], [329, 576], [318, 559], [295, 535], [268, 513], [241, 493], [214, 478], [188, 473], [170, 470], [0, 470]]
    },
    controls: ['head', 'earL', 'earR', 'book', 'armL', 'armR', 'tail'],
    note: '골든리트리버 원화에 맞춘 12관절 메시. 늘어진 양쪽 귀와 앞발·손목, 굽은 꼬리와 꼬리 끝이 독립적으로 움직입니다. 전용 감은 눈을 위에서 아래로 합성하며 원본 알파를 유지하고, 두께가 있는 책장이 표지 위로 넘어갑니다.'
  };
})();
