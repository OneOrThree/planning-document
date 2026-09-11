/* 로컬 시연의 단일 데이터 모델. 서버 권한·검열·정산을 대신하지 않는다. */
((root)=>{
  'use strict';
  const KEY='gachisup.local.v3',DAY=86400000;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const id=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
  const dateKey=(time=Date.now())=>new Date(time+9*3600000).toISOString().slice(0,10);
  const instant=date=>Date.parse(date+'T00:00:00+09:00');
  const addDate=(date,days)=>dateKey(instant(date)+days*DAY);
  const names=[{id:'me',name:'나',public:true},{id:'momo',name:'모모',public:true},{id:'tofu',name:'두부',public:true},{id:'bam',name:'밤이',public:true},{id:'salt',name:'소금',public:false}];
  function periodRange(period='WEEK',offset=0,now=Date.now()){
    const today=dateKey(now),day=instant(today),weekday=new Date(day+9*3600000).getUTCDay();let from,to;
    if(period==='DAY'){from=addDate(today,offset);to=from;}
    else if(period==='MONTH'){const d=new Date(today+'T12:00:00Z');d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+offset);from=d.toISOString().slice(0,10);d.setUTCMonth(d.getUTCMonth()+1);to=addDate(d.toISOString().slice(0,10),-1);}
    else{from=addDate(today,-((weekday+6)%7)+offset*7);to=addDate(from,6);}
    return {from,to,today,elapsedTo:to<today?to:today};
  }
  function initial(){const today=dateKey();return {version:3,role:'OWNER',samples:true,currentIsland:'home',islands:[{id:'home',name:'느티나무 섬',level:3,members:5},{id:'dawn',name:'새벽의 서재',level:2,members:4}],goals:{focus:60,screen:120},sessions:[],activeSession:null,posts:[{id:'welcome-home',islandId:'home',kind:'notice',title:'오늘도 각자의 속도로.',content:'늦게 와도 괜찮아요.\n모닥불 곁에는 늘 자리가 있으니까.\n\n오늘의 작은 집중을 댓글로 나눠주세요.',author:'momo',createdAt:instant(today)-DAY,pinned:true,attachments:[],sample:true},{id:'share-home',islandId:'home',kind:'share',title:'오늘 읽은 문장 하나',content:'완벽한 하루보다, 다시 시작하는 하루를 모아가요.\n오늘은 어떤 문장이 마음에 남았나요?',author:'tofu',createdAt:instant(today)-DAY/2,pinned:false,attachments:[],sample:true}],comments:[],quests:[{id:'focus-home',islandId:'home',title:'나를 위한 한 시간',category:'FOCUS',type:'DURATION',minutes:60,days:[1,2,3,4,5,6,0],participants:['me','momo','tofu'],active:true},{id:'phone-home',islandId:'home',title:'폰보다 나에게 가까이',category:'SCREEN_TIME',type:'DURATION',minutes:120,days:[1,2,3,4,5,6,0],participants:['momo','tofu'],active:true}],drafts:{},reports:[],letters:[],pokes:[],preferences:{letters:true,pokes:true},preview:{tower:false,post:false}};}
  function create(storage){let data,loadError=null;
    try{const raw=storage?.getItem(KEY);data=raw?JSON.parse(raw):initial();if(data?.version!==3||!Array.isArray(data.posts)||!Array.isArray(data.sessions)||!Array.isArray(data.islands)||!data.goals||!['comments','quests','reports','letters','pokes'].every(k=>Array.isArray(data[k]))||!['drafts','preferences','preview'].every(k=>data[k]&&typeof data[k]==='object'))throw Error('저장된 데이터 형식을 확인할 수 없어요.');}
    catch(e){data=initial();loadError='기존 로컬 데이터를 읽지 못해 임시 모드로 열었어요. 저장소를 확인해주세요.';}
    function commit(change){if(loadError)throw Error(loadError);const next=clone(data);const result=change(next);try{storage?.setItem(KEY,JSON.stringify(next));}catch{throw Error('저장 공간이 부족하거나 브라우저 저장이 차단됐어요. 작성 내용은 화면에 남겨두었습니다.');}data=next;return result;}
    const owner=()=>{if(data.role!=='OWNER')throw Error('그룹장만 할 수 있어요.');};
    const islandExists=islandId=>{if(!data.islands.some(i=>i.id===islandId))throw Error('현재 섬을 찾을 수 없어요.');};
    const postFor=postId=>{const p=data.posts.find(p=>p.id===postId);if(!p)throw Error('삭제되었거나 찾을 수 없는 글이에요.');return p;};
    function sampleSessions(){if(!data.samples)return [];const result=[],today=dateKey();for(let back=0;back<75;back++){const date=addDate(today,-back);for(const island of data.islands){if(!['home','dawn'].includes(island.id))continue;for(let person=0;person<Math.min(island.members,names.length);person++){if((back+person)%9===0&&back!==0)continue;const user=names[person],minutes=back===0?(person===0?(island.id==='home'?35:0):[0,45,30,20,10][person]):20+((back*17+person*23+(island.id==='dawn'?11:0))%100);if(!minutes)continue;const end=Math.min(instant(date)+((9+person*2)*60+minutes)*60000,back===0?Date.now():Infinity);result.push({id:`sample-${island.id}-${date}-${person}`,islandId:island.id,userId:user.id,startedAt:end-minutes*60000,endedAt:end,seconds:minutes*60,tag:['독서','공부','작업'][((back+person)%3)],source:'sample'});}}}return result;}
    const isRest=session=>session.kind==='rest'||session.tag==='휴식';
    const allSessions=()=>[...sampleSessions(),...data.sessions].filter(session=>!isRest(session));
    // 기존 v3 저장소를 유지한다. 휴식도 이력에 남기되 집중 집계 진입점에서 분리한다.
    const restSessions=()=>data.sessions.filter(isRest);
    function restStats({islandId=data.currentIsland,scope='me',period='WEEK',offset=0}={}){
      const range=periodRange(period,offset);
      const sessions=restSessions().filter(s=>(scope==='me'?s.userId==='me':s.islandId===islandId&&names.some(n=>n.id===s.userId&&n.public))&&dateKey(s.endedAt)>=range.from&&dateKey(s.endedAt)<=range.to).sort((a,b)=>b.endedAt-a.endedAt);
      return {range,sessions,seconds:sessions.reduce((sum,s)=>sum+s.seconds,0)};
    }
    const members=islandId=>{const island=data.islands.find(i=>i.id===islandId),extra=data.extraMembers?.[islandId]||[];return [...names.slice(0,Math.max(0,(island?.members||0)-extra.length)),...extra];};
    const screenFor=date=>data.samples&&date<=dateKey()?(date===dateKey()?48:55+(Number(date.slice(-2))*19)%130):null;
    function stats({islandId=data.currentIsland,scope='group',period='WEEK',offset=0,userId=null}={}){
      if(userId&&userId!=='me'&&!names.find(n=>n.id===userId)?.public)return {private:true};
      const range=periodRange(period,offset),previous=periodRange(period,offset-1),all=allSessions().filter(s=>userId?s.userId===userId&&s.islandId===islandId:scope==='me'?s.userId==='me':s.islandId===islandId&&names.some(n=>n.id===s.userId&&n.public));
      const within=(s,r)=>{const d=dateKey(s.endedAt);return d>=r.from&&d<=r.to;};
      const sessions=all.filter(s=>within(s,range)).sort((a,b)=>b.endedAt-a.endedAt),seconds=sessions.reduce((n,s)=>n+s.seconds,0),previousSeconds=all.filter(s=>within(s,previous)).reduce((n,s)=>n+s.seconds,0);
      const cells=[];for(let date=range.from;date<=range.to;date=addDate(date,1)){const entries=sessions.filter(s=>dateKey(s.endedAt)===date);cells.push({date,seconds:entries.reduce((n,s)=>n+s.seconds,0),count:entries.length,screen:scope==='me'?screenFor(date):null,future:date>range.today});}
      const categories=[...new Set(sessions.map(s=>s.tag))].map(tag=>({tag,seconds:sessions.filter(s=>s.tag===tag).reduce((n,s)=>n+s.seconds,0)})).sort((a,b)=>b.seconds-a.seconds);
      const activeDates=new Set(all.filter(s=>s.seconds>0).map(s=>dateKey(s.endedAt)));let streak=0,cursor=activeDates.has(range.today)?range.today:addDate(range.today,-1);while(activeDates.has(cursor)){streak++;cursor=addDate(cursor,-1);}
      const known=cells.filter(c=>!c.future&&c.screen!==null),phone=known.length?known.reduce((n,c)=>n+c.screen,0):null;
      let previousPhone=null;if(data.samples&&scope==='me'){previousPhone=0;for(let d=previous.from;d<=previous.to;d=addDate(d,1))previousPhone+=screenFor(d)||0;}
      const friends=allSessions().filter(s=>s.islandId===islandId&&s.userId!=='me'&&names.some(n=>n.id===s.userId&&n.public)&&within(s,range)),activeFriends=new Set(friends.filter(s=>s.seconds>0).map(s=>s.userId)).size;
      return {range,sessions,seconds,previousSeconds,categories,cells,streak,longest:Math.max(0,...sessions.map(s=>s.seconds)),goalDays:cells.filter(c=>!c.future&&c.seconds>=data.goals.focus*60).length,phone,previousPhone,screenGoalDays:known.filter(c=>c.screen<=data.goals.screen).length,friendAverage:activeFriends?friends.reduce((n,s)=>n+s.seconds,0)/activeFriends:null,activeFriends,me:scope==='me',members:members(islandId)};
    }
    function validatePost(input){islandExists(input.islandId);if(input.kind==='notice')owner();if(!['notice','share'].includes(input.kind))throw Error('글 종류를 확인해주세요.');const title=String(input.title||'').trim(),content=String(input.content||'').trim();if(!title||title.length>100)throw Error('제목을 1~100자로 적어주세요.');if(!content||content.length>5000)throw Error('내용을 1~5,000자로 적어주세요.');const existing=input.id?postFor(input.id):null;if(existing&&(existing.islandId!==input.islandId||existing.kind!==input.kind||existing.author!=='me'&&data.role!=='OWNER'))throw Error('이 글을 수정할 권한이 없어요.');return {title,content,existing};}
    function savePost(input){const {title,content,existing}=validatePost(input);return commit(next=>{const item={id:existing?.id||id(),islandId:input.islandId,kind:input.kind,title,content,pinned:input.kind==='notice'&&!!input.pinned,author:existing?.author||'me',createdAt:existing?.createdAt||Date.now(),updatedAt:Date.now(),attachments:input.attachments||existing?.attachments||[],sample:false};if(item.pinned)next.posts.forEach(p=>{if(p.islandId===item.islandId)p.pinned=false;});next.posts=next.posts.filter(p=>p.id!==item.id);next.posts.unshift(item);delete next.drafts[input.islandId+':'+input.kind+':'+(input.id||'new')];return item.id;});}
    function saveQuest(input){owner();if(input.placeId&&(!placeReady(input.islandId)||input.placeId!=='pier'||input.worldAction!=='fishing'||input.category!=='FOCUS'||input.type!=='TIME_WINDOW'||Number(input.fee||0)!==0))throw Error('완성된 부두에서 무료 시간대 집중 모임을 만들 수 있어요.');const fee=Number(input.fee||0);if(!Number.isInteger(fee)||fee<0||fee>100)throw Error('시연 참가비는 0~100 재화로 정해주세요.');islandExists(input.islandId);const max=input.category==='FOCUS'?1080:720,minutes=Number(input.minutes),days=[...new Set((input.days||[]).map(Number))];if(!['FOCUS','SCREEN_TIME'].includes(input.category)||!['DURATION','TIME_WINDOW'].includes(input.type)||!Number.isInteger(minutes)||minutes<1||minutes>max)throw Error('집중은 1~1,080분, 폰 사용은 1~720분으로 정해주세요.');if(!days.length||days.some(d=>!Number.isInteger(d)||d<0||d>6))throw Error('반복할 요일을 하나 이상 골라주세요.');if(input.type==='TIME_WINDOW'){const parse=t=>/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t||'')?Number(t.slice(0,2))*60+Number(t.slice(3)):NaN;const start=parse(input.start),end=parse(input.end);if(!(start>=0&&end<=1439&&start<end&&minutes<=end-start))throw Error('같은 날의 시작·종료 시각을 정하고 목표를 시간대 길이 이내로 맞춰주세요.');if(input.category==='FOCUS'&&minutes<=5)throw Error('시간대 집중 목표는 6분 이상이에요.');if(input.category==='SCREEN_TIME'&&minutes%15!==0)throw Error('시간대 폰 사용 목표는 15분 단위로 정해주세요.');}if(data.quests.filter(q=>q.islandId===input.islandId&&q.active).length>=4)throw Error('진행 중인 퀘스트는 섬마다 최대 4개예요.');const title=String(input.title||'').trim();if(!title||title.length>100)throw Error('퀘스트 이름을 1~100자로 적어주세요.');return commit(next=>{const q={id:id(),islandId:input.islandId,title,category:input.category,type:input.type,minutes,days,start:input.start||'',end:input.end||'',fee,participants:[],active:true,...(input.placeId?{placeId:input.placeId,worldAction:input.worldAction}:{})};next.quests.unshift(q);delete next.drafts[input.islandId+':quest:new'];return q.id;});}
    // 장소 성장은 선택한 집중만 반영한다. 예시 데이터·휴식·기존 기록을 소급 합산하지 않는다.
    const projectFor=islandId=>data.placeProjects?.[islandId]||{seconds:0,completedAt:null,previewUnlocked:false};
    const placeReady=islandId=>!!(projectFor(islandId).completedAt||projectFor(islandId).previewUnlocked);
    function meetingWindow(q,time=Date.now()){
      const date=dateKey(time),weekday=new Date(instant(date)+9*3600000).getUTCDay();
      return {start:Date.parse(date+'T'+q.start+':00+09:00'),end:Date.parse(date+'T'+q.end+':00+09:00'),scheduled:q.days.includes(weekday)};
    }
    function sessionContext(session){
      const result={};
      if(session.projectId){
        if(session.projectId!=='pier'||session.tag==='휴식')throw Error('부두에는 집중 시간으로 힘을 보탤 수 있어요.');
        result.projectId='pier';
      }
      if(session.questId){
        const q=data.quests.find(q=>q.id===session.questId&&q.active&&q.islandId===session.islandId&&q.placeId==='pier');
        if(!q||!placeReady(session.islandId))throw Error('이 부두 모임은 지금 참여할 수 없어요.');
        if(!q.participants.includes('me'))throw Error('모임에 참여한 뒤 시작해주세요.');
        if(session.tag==='휴식')throw Error('모임은 집중으로 기록해요. 휴식 낚시는 별도로 시작해주세요.');
        const window=meetingWindow(q,session.started);
        if(!window.scheduled||session.started<window.start||session.started>=window.end)throw Error('모임 시간 안에 집중을 시작해주세요.');
        Object.assign(result,{questId:q.id,placeId:'pier',worldAction:'fishing',meetingWindow:window,meetingTitle:q.title});
      }
      return result;
    }
    function questProgress(q){const today=dateKey(),dow=new Date(instant(today)+9*3600000).getUTCDay(),scheduled=q.days.includes(dow);if(q.category==='SCREEN_TIME')return {value:q.type==='TIME_WINDOW'?null:screenFor(today),scheduled,verified:false};let seconds=allSessions().filter(s=>s.userId==='me'&&s.islandId===q.islandId&&dateKey(s.endedAt)===today&&(!q.placeId||s.source==='local'&&s.questId===q.id)).reduce((sum,s)=>{if(q.type==='DURATION')return sum+s.seconds;const start=Date.parse(today+'T'+q.start+':00+09:00'),end=Date.parse(today+'T'+q.end+':00+09:00');return sum+Math.max(0,Math.min(s.endedAt,end)-Math.max(s.startedAt,start))/1000;},0);return {value:Math.floor(seconds/60),scheduled,verified:true};}
    return {get:()=>clone(data),loadError,stats,restStats,restSessions,members,allSessions,dateKey,periodRange,questProgress,
      addIsland(input){const name=String(input.name||'').trim();if(name.length<2||name.length>16||!input.id)throw Error('섬 정보를 확인해주세요.');if(data.islands.some(i=>i.id===input.id))return input.id;if(data.islands.length>=10)throw Error('참여한 섬은 최대 10개예요.');return commit(next=>{next.islands.push({id:input.id,name,level:input.level||1,members:Math.max(1,Math.floor(input.members||1))});return input.id;});},
      enterFirstIsland(input,role='MEMBER'){if(!input.id||String(input.name||'').trim().length<2)throw Error('섬 정보를 확인해주세요.');return commit(next=>{next.islands=[{id:input.id,name:input.name,level:input.level||1,members:Math.max(1,Number(input.members)||1)}];next.currentIsland=input.id;next.role=role;});},
      leaveIsland(islandId){islandExists(islandId);if(data.activeSession)throw Error('활동을 마친 뒤 나갈 수 있어요.');const place=data.islands.find(p=>p.id===islandId);if(data.role==='OWNER'&&place.members>1)throw Error('그룹장을 위임한 뒤 나갈 수 있어요.');commit(next=>{next.islands=next.islands.filter(p=>p.id!==islandId);next.currentIsland=next.islands[0]?.id||null;next.role='MEMBER';});},
      addMember(islandId,person){owner();islandExists(islandId);if(!person?.id||!person.name)throw Error('친구 정보를 확인해주세요.');commit(next=>{next.extraMembers??={};const list=next.extraMembers[islandId]??=[];if(list.some(m=>m.id===person.id))return;list.push({id:person.id,name:person.name,public:true});next.islands.find(p=>p.id===islandId).members++;});},
      configure(patch){return commit(next=>{if(patch.role&&['OWNER','MEMBER'].includes(patch.role))next.role=patch.role;if(typeof patch.samples==='boolean')next.samples=patch.samples;if(patch.currentIsland){islandExists(patch.currentIsland);next.currentIsland=patch.currentIsland;}if(patch.preview)Object.assign(next.preview,patch.preview);if(patch.preferences)Object.assign(next.preferences,patch.preferences);});},
      rename(islandId,name){owner();islandExists(islandId);name=name.trim();if(name.length<2||name.length>16)throw Error('섬 이름은 2~16자로 적어주세요.');if(data.islands.some(i=>i.id!==islandId&&i.name===name))throw Error('이미 같은 이름의 섬이 있어요.');commit(next=>next.islands.find(i=>i.id===islandId).name=name);},
      goals(focus,screen){if(!Number.isInteger(focus)||focus<1||focus>1080||!Number.isInteger(screen)||screen<1||screen>720)throw Error('집중 1~1,080분, 폰 사용 1~720분으로 정해주세요.');commit(next=>next.goals={focus,screen});},
      draft(key,value){commit(next=>{next.drafts[key]=value;});},validatePost,savePost,saveQuest,
      deletePost(postId){const p=postFor(postId);if(p.author!=='me'&&data.role!=='OWNER')throw Error('작성자 또는 그룹장만 삭제할 수 있어요.');commit(next=>{next.posts=next.posts.filter(p=>p.id!==postId);next.comments=next.comments.filter(c=>c.postId!==postId);});},
      comment(postId,content){postFor(postId);content=content.trim();if(!content||content.length>1000)throw Error('댓글을 1~1,000자로 적어주세요.');commit(next=>next.comments.push({id:id(),postId,content,author:'me',createdAt:Date.now()}));},
      deleteComment(commentId){const c=data.comments.find(c=>c.id===commentId);if(!c||c.author!=='me'&&data.role!=='OWNER')throw Error('삭제할 권한이 없어요.');commit(next=>next.comments=next.comments.filter(c=>c.id!==commentId));},
      report(postId,reason){postFor(postId);if(!reason?.trim())throw Error('신고 이유를 골라주세요.');if(data.reports.some(r=>r.postId===postId))throw Error('이미 이 글의 신고를 로컬에 기록했어요.');commit(next=>next.reports.push({id:id(),postId,reason,createdAt:Date.now()}));},
      joinQuest(questId){const q=data.quests.find(q=>q.id===questId&&q.active);if(!q)throw Error('종료된 퀘스트예요.');commit(next=>{const row=next.quests.find(q=>q.id===questId);row.participants=row.participants.includes('me')?row.participants.filter(x=>x!=='me'):[...row.participants,'me'];});},
      endQuest(questId){owner();commit(next=>{const q=next.quests.find(q=>q.id===questId);if(q)q.active=false;});},
      placeProject(islandId=data.currentIsland){islandExists(islandId);const p=projectFor(islandId);return clone({...p,targetSeconds:3600,ready:placeReady(islandId)});},
      previewPlace(islandId=data.currentIsland){owner();islandExists(islandId);if(data.activeSession)throw Error('활동을 마친 뒤 미리볼 수 있어요.');return commit(next=>{next.placeProjects??={};const p=next.placeProjects[islandId]??={seconds:0,completedAt:null,previewUnlocked:false};p.previewUnlocked=true;});},
      placeMemories(islandId=data.currentIsland){return clone(data.sessions.filter(s=>s.islandId===islandId&&s.placeId==='pier'&&s.seconds>0).sort((a,b)=>b.endedAt-a.endedAt));},
      meetingWindow,
      startSession(session){if(data.activeSession)throw Error('진행 중인 활동이 있어요.');if(!Number.isFinite(session.started)||!Number.isFinite(session.duration)||session.duration<=0)throw Error('활동 시간을 확인해주세요.');islandExists(session.islandId);const tag=session.tag||'독서';if(!['독서','공부','작업','휴식'].includes(tag))throw Error('활동 종류를 확인해주세요.');const context=sessionContext({...session,tag});commit(next=>next.activeSession={started:session.started,duration:session.duration,island:session.island,islandId:session.islandId,tag,kind:tag==='휴식'?'rest':'focus',id:id(),...context});},
      finishSession(){const s=data.activeSession;if(!s)return null;const endedAt=Math.min(Date.now(),s.started+s.duration*1000),seconds=Math.max(0,Math.floor((endedAt-s.started)/1000));return commit(next=>{const row={id:s.id,islandId:s.islandId,userId:'me',startedAt:s.started,endedAt,seconds,tag:s.tag||'독서',kind:isRest(s)?'rest':'focus',source:'local',...(s.projectId?{projectId:s.projectId}:{}),...(s.questId?{questId:s.questId,placeId:s.placeId,worldAction:s.worldAction,meetingTitle:s.meetingTitle,meetingSeconds:Math.max(0,Math.floor((Math.min(endedAt,s.meetingWindow.end)-Math.max(s.started,s.meetingWindow.start))/1000))}:{})};if(!next.sessions.some(x=>x.id===s.id)){next.sessions.push(row);if(s.projectId==='pier'&&!isRest(s)){next.placeProjects??={};const p=next.placeProjects[s.islandId]??={seconds:0,completedAt:null,previewUnlocked:false};const contribution=Math.min(seconds,Math.max(0,3600-p.seconds));p.seconds+=contribution;row.projectSeconds=contribution;if(p.seconds>=3600&&!p.completedAt)p.completedAt=endedAt;}}next.activeSession=null;return row;});},
      sendLetter(to,preset){if(!names.some(n=>n.id===to&&n.id!=='me')||!Number.isInteger(preset)||preset<0||preset>2)throw Error('받을 친구와 문구를 골라주세요.');return commit(next=>next.letters.unshift({id:id(),to,from:'me',preset,createdAt:Date.now(),read:false}));},
      poke(to){if(!names.some(n=>n.id===to&&n.id!=='me'))throw Error('친구를 골라주세요.');if(data.pokes.some(p=>p.to===to&&p.date===dateKey()))throw Error('이 친구에게는 오늘 이미 인사를 남겼어요.');commit(next=>next.pokes.push({to,date:dateKey()}));}
    };
  }
  const api={create,periodRange,dateKey,addDate,instant,KEY};if(typeof module!=='undefined')module.exports=api;else root.GachisupStore=api;
})(globalThis);
