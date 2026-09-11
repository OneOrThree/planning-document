/* 카피바라 투명 원화(1,254px)를 기준으로 맞춘 0..1000 좌표의 8관절 프로파일. */
(() => {
  'use strict';
  window.GachisupReadingProfiles ||= {};
  window.GachisupReadingProfiles.capybara = {
    id: 'capybara',
    label: '카피바라',
    source: 'assets/capybara-reading-rig-v2.png',
    closedSource: 'assets/capybara-reading-closed-v2.png',
    bones: {
      root: { parent: null, pivot: [514, 885], limit: 2, label: '기준' },
      body: { parent: 'root', pivot: [553, 822], limit: 2, label: '호흡' },
      head: { parent: 'body', pivot: [483, 518], limit: 3, label: '고개' },
      earL: { parent: 'head', pivot: [380, 151], limit: 5, label: '왼쪽 귀' },
      earR: { parent: 'head', pivot: [661, 208], limit: 5, label: '오른쪽 귀' },
      book: { parent: 'body', pivot: [350, 680], limit: 2.5, label: '책' },
      armL: { parent: 'book', pivot: [192, 553], limit: 3, label: '왼쪽 앞발' },
      armR: { parent: 'book', pivot: [665, 610], limit: 3, label: '오른쪽 앞발' }
    },
    regions: [
      {
        bone: 'body', feather: 60, strength: 1,
        polygon: [[241, 459], [686, 462], [773, 506], [811, 599], [857, 715], [880, 793], [855, 861], [779, 890], [672, 889], [581, 869], [486, 857], [376, 860], [303, 832], [234, 749], [198, 636]]
      },
      {
        bone: 'head', feather: 42, strength: 1,
        polygon: [[307, 48], [763, 74], [806, 370], [776, 460], [737, 502], [674, 534], [602, 543], [529, 535], [466, 522], [359, 534], [283, 486], [208, 430], [180, 340], [220, 268]]
      },
      {
        bone: 'earL', feather: 16, strength: 1,
        polygon: [[333, 161], [324, 125], [331, 88], [359, 54], [390, 54], [413, 68], [438, 107], [435, 121], [395, 133], [371, 145]]
      },
      {
        bone: 'earR', feather: 16, strength: 1,
        polygon: [[625, 153], [664, 120], [698, 111], [729, 126], [748, 158], [754, 192], [741, 222], [716, 236], [685, 232], [665, 216], [678, 203], [653, 201]]
      },
      {
        bone: 'book', feather: 13, strength: 1,
        polygon: [[161, 462], [192, 451], [249, 478], [290, 507], [325, 553], [334, 571], [354, 554], [414, 528], [474, 516], [543, 507], [565, 531], [584, 531], [591, 541], [601, 716], [401, 765], [371, 769], [342, 762], [327, 739], [223, 670], [191, 652], [164, 563]]
      },
      {
        bone: 'armL', feather: 15, strength: 0.93,
        polygon: [[166, 538], [188, 542], [216, 558], [226, 583], [238, 612], [228, 642], [209, 656], [180, 654], [158, 641], [145, 617], [142, 587], [150, 558]]
      },
      {
        bone: 'armR', feather: 28, strength: 0.93,
        polygon: [[627, 574], [670, 557], [726, 583], [757, 612], [770, 650], [750, 692], [712, 722], [666, 729], [629, 716], [589, 712], [552, 694], [532, 668], [535, 638], [548, 613], [578, 595], [613, 594]]
      }
    ],
    motions: {
      read: {
        body: { amplitude: 0.1, frequency: 1.25, phase: 0 },
        head: { amplitude: 0.72, frequency: 0.62, phase: 0 },
        earL: { amplitude: 0.72, frequency: 1.02, phase: 0.3 },
        earR: { amplitude: 0.6, frequency: 1.02, phase: -0.65 },
        book: { amplitude: 0.2, frequency: 1.25, phase: 0 },
        armL: { amplitude: 0.16, frequency: 0.84, phase: 0.2 },
        armR: { amplitude: 0.18, frequency: 0.84, phase: 0.65 }
      },
      idle: {
        body: { amplitude: 0.13, frequency: 1.1, phase: 0 },
        head: { amplitude: 0.5, frequency: 0.52, phase: 0.2 },
        earL: { amplitude: 0.95, frequency: 0.94, phase: 0.3 },
        earR: { amplitude: 0.82, frequency: 0.94, phase: -0.7 },
        book: { amplitude: 0.12, frequency: 1.1, phase: 0.15 },
        armL: { amplitude: 0.1, frequency: 0.76, phase: 0 },
        armR: { amplitude: 0.12, frequency: 0.76, phase: 0.65 }
      },
      nod: {
        body: { amplitude: 0.13, frequency: 1.35, phase: 0 },
        head: { amplitude: 1.8, frequency: 1.9, phase: 0 },
        earL: { amplitude: 0.8, frequency: 1.9, phase: -0.45 },
        earR: { amplitude: 0.66, frequency: 1.9, phase: -0.75 },
        book: { amplitude: 0.16, frequency: 1.35, phase: 0 },
        armL: { amplitude: 0.12, frequency: 1, phase: 0.2 },
        armR: { amplitude: 0.14, frequency: 1, phase: 0.6 }
      }
    },
    eyes: [
      { center: [303, 297], radius: [29, 47], lid: '#e39e5f', angle: -1 },
      { center: [554, 357], radius: [58, 50], lid: '#de985b', angle: -15 }
    ],
    page: {
      spine: [334, 570], right: [539, 519], left: [202, 469], lift: 72,
      clip: [[150, 370], [618, 370], [618, 520], [583, 527], [554, 534], [500, 543], [442, 554], [386, 570], [348, 580], [327, 580], [316, 573], [295, 553], [270, 534], [241, 512], [212, 491], [185, 475], [166, 462], [150, 458]]
    },
    controls: ['head', 'earL', 'earR', 'book', 'armL', 'armR'],
    note: '실제 알파 PNG와 카피바라 외형에 맞춘 8관절 가중치 메시. 큰 머리와 작은 귀, 책을 잡은 양쪽 앞발을 작은 각도로 움직입니다. 눈은 전용 감은 눈 원화를 눈 주변에만 합성하고, 책장은 표지 위쪽에서 움직입니다. 꼬리 관절은 없습니다.'
  };
})();
