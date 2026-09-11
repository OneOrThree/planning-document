/* 활동 분리 회귀 검사. 메모리 저장소만 사용한다. */
const assert=require('node:assert/strict');
const Store=require('./village-store.js');
let raw=null,now=Date.parse('2026-09-08T14:00:00+09:00'),passed=0;
const originalNow=Date.now;
Date.now=()=>now;
const storage={getItem:()=>raw,setItem:(_,value)=>{raw=value;}};
const model=Store.create(storage);
const check=(value,label)=>{assert.ok(value,label);passed++;console.log('✓ '+label);};
try{
  model.configure({samples:false});
  const finish=(tag,seconds)=>{model.startSession({started:now,duration:600,island:'느티나무 섬',islandId:'home',tag});now+=seconds*1000;return model.finishSession();};
  finish('독서',120);finish('공부',180);finish('작업',60);
  const before=model.stats({scope:'me',period:'DAY'});
  check(before.seconds===360,'독서·공부·작업은 집중 시간에 함께 집계');
  const questBefore=model.questProgress(model.get().quests[0]).value;
  const rest=finish('휴식',300);
  check(rest.kind==='rest'&&rest.seconds===300,'휴식 5분 별도 활동 종류로 저장');
  check(model.get().sessions.length===4,'집중·휴식 원본 이력 모두 보존');
  check(model.allSessions().length===3,'집중 집계 진입점은 휴식 제외');
  const after=model.stats({scope:'me',period:'DAY'});
  check(after.seconds===before.seconds,'휴식이 집중 총합에 포함되지 않음');
  check(after.longest===180&&after.streak===before.streak&&after.goalDays===before.goalDays,'최장 집중·연속 집중·목표 달성에 휴식 미반영');
  check(!after.categories.some(c=>c.tag==='휴식'),'집중 과목별 비율에 휴식 미반영');
  check(model.stats({scope:'group',period:'DAY'}).seconds===360,'섬 집중 통계와 순위 기반 합계에서 휴식 제외');
  check(model.questProgress(model.get().quests[0]).value===questBefore,'집중 퀘스트에 휴식 미반영');
  check(model.restStats({scope:'me',period:'DAY'}).seconds===300,'별도 휴식 통계에서 5분 확인');
  check(model.finishSession()===null&&model.restSessions().length===1,'중복 종료로 휴식 이력 중복 저장하지 않음');
  model.startSession({started:now,duration:300,island:'느티나무 섬',islandId:'home',tag:'휴식'});
  const restored=Store.create(storage);
  check(restored.get().activeSession.kind==='rest','새로고침 시 휴식 종류 복원');
  now+=700000;
  check(restored.finishSession().seconds===300,'휴식 자동 완료는 설정 시간을 상한으로 기록');
  check(restored.restStats({scope:'me',period:'DAY'}).seconds===600,'복원된 휴식도 별도 합산');
  check(restored.stats({scope:'me',period:'DAY'}).seconds===360,'휴식 복원·자동 완료 후에도 집중 기록 유지');
  const legacy=JSON.parse(raw);legacy.sessions.push({id:'legacy-rest',tag:'휴식',seconds:90,userId:'me',islandId:'home',endedAt:now,startedAt:now-90000});raw=JSON.stringify(legacy);
  check(Store.create(storage).restStats({period:'DAY'}).seconds===690,'kind가 없는 휴식 태그 이력도 안전하게 분리');
  console.log(`${passed}개 활동 기록 검증 통과`);
}finally{Date.now=originalNow;}
