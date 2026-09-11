/* 사용자 확정: 이야기 3개 × 연출 3개. 30회 검토 목표는 완료 표시와 분리한다. */
(() => {
  const directions=[
    {id:'emotion',title:'감정 중심',description:'시선과 준비의 작은 행동을 가까이 보고, 떠나기로 하는 마음에 머물러요.',prepareEnd:6.8,walkEnd:10.8,boardingEnd:12.2,departureStart:13.3,seaStart:19.7},
    {id:'journey',title:'여정 중심',description:'책을 챙긴 자리부터 부두·승선·출항까지, 이동의 흐름을 따라가요.',prepareEnd:4.9,walkEnd:9.2,boardingEnd:10.65,departureStart:11.9,seaStart:20.2},
    {id:'storybook',title:'그림책 중심',description:'공책 속 기억과 스케치가 오늘의 바다로 이어져요.',prepareEnd:7.5,walkEnd:11.3,boardingEnd:12.8,departureStart:14.1,seaStart:20.3},
  ];
  const stories=window.GachisupPrologues;
  window.CutsceneProduction={duration:24,targetReviews:30,directions,
    films:stories.flatMap((story,storyIndex)=>directions.map((direction,directionIndex)=>({
      id:story.id+'-'+direction.id,storyId:story.id,storyIndex,directionId:direction.id,directionIndex,
      title:story.title,directionTitle:direction.title,description:direction.description,
      timing:{...direction},duration:24,reviewTarget:30,reviewCompleted:0,status:'draft',
      tuning:{catSize:176,raftWidth:316,jumpHeight:36,landingBounce:5,shadowAlpha:.2,walkStride:15,
        captionSize:30,captionY:1090,waveAlpha:.12,wakeAlpha:.27,paddleAmplitude:.3,
        cameraGain:1,anticipation:.24,bookSize:.64,tailMotion:2.1,headMotion:1.1},
    }))),
  };
})();
