/* IA 디자인 시연 전용 모델. 실제 계정·지갑·섬 데이터와 분리한다. */
((root)=>{
  'use strict';
  const KEY='gachisup.ia.design.v1',copy=x=>JSON.parse(JSON.stringify(x));
  const products=[
    {id:'beret',name:'숲빛 베레모',kind:'personal',slot:'head',price:80,art:'beret'},
    {id:'ribbon',name:'산책 리본',kind:'personal',slot:'neck',price:60,art:'ribbon'},
    {id:'glasses',name:'작은 독서 안경',kind:'personal',slot:'face',price:120,art:'glasses'},
    {id:'flower',name:'들꽃 한 송이',kind:'personal',slot:'head',price:50,art:'flower'},
    {id:'bench',name:'함께 앉는 벤치',kind:'island',price:320,art:'bench'},
    {id:'lamp',name:'저녁의 등불',kind:'island',price:180,art:'lamp'},
    {id:'garden',name:'작은 들꽃 화단',kind:'island',price:140,art:'garden'},
    {id:'flag',name:'우리 섬의 깃발',kind:'island',price:90,art:'flag'},
    {id:'table',name:'오크 공부 테이블',kind:'island',price:480,art:'table'}
  ];
  const places=[
    {id:'home',name:'느티나무 섬',code:'NEUTI1',description:'각자의 속도로, 함께 자라는 곳.',members:5,approval:false,theme:'함께 공부'},
    {id:'dawn',name:'새벽의 서재',code:'DAWN02',description:'이른 아침, 조용히 책을 펼쳐요.',members:4,approval:true,theme:'독서'},
    {id:'moon',name:'달빛 도서관',code:'MOON03',description:'하루의 끝에 한 장씩 읽어요.',members:6,approval:true,theme:'독서'},
    {id:'wave',name:'물결 쉼터',code:'WAVE04',description:'작은 몰입과 충분한 휴식.',members:3,approval:false,theme:'자유 집중'},
    {id:'pine',name:'소나무 공부방',code:'PINE05',description:'오늘의 한 문제를 같이 풀어요.',members:8,approval:false,theme:'함께 공부'}
  ];
  function initial(){return {version:1,profile:{name:'모모',coat:'calico',provider:null},membership:null,joined:['home','dawn'],pending:[],islandSettings:{name:'느티나무 섬',description:'각자의 속도로, 함께 자라는 곳.',approval:false,public:true},wallet:480,treasury:1280,owned:[],equipped:{},placed:[],ledger:[{id:'seed',kind:'island',amount:1280,title:'함께 모은 재화',by:'섬 친구들',at:Date.now()-86400000}],applications:[{id:'app-leaf',name:'새싹',message:'저녁마다 한 시간씩 공부하고 싶어요.',status:'pending'},{id:'app-cloud',name:'구름',message:'조용히 책 읽을 자리를 찾고 있어요.',status:'pending'}],preferences:{letters:true,pokes:true,notices:true,quests:true,approvals:true,quiet:false,publicStats:true},blockedApps:['YouTube','Instagram'],permissions:{screen:false,notification:false},drafts:{},readLetters:[],rewardedSessions:[],bets:{}};}
  function create(storage){let value,error=null;try{const raw=storage?.getItem(KEY);value=raw?JSON.parse(raw):initial();if(value.version!==1||!value.profile||!Array.isArray(value.owned)||!Array.isArray(value.joined))throw Error();}catch{value=initial();error='저장된 시연 데이터를 읽지 못했어요. 기존 데이터는 덮어쓰지 않습니다.';}
    function commit(fn){if(error)throw Error(error);const next=copy(value),result=fn(next);try{storage?.setItem(KEY,JSON.stringify(next));}catch{throw Error('브라우저 저장 공간을 확인해주세요. 변경하지 않았어요.');}value=next;return result;}
    value.treasuries??={home:value.treasury,dawn:640};value.islandOwned??={home:value.owned.filter(id=>products.find(p=>p.id===id)?.kind==='island')};value.islandPlaced??={home:value.placed||[]};value.owned=value.owned.filter(id=>products.find(p=>p.id===id)?.kind!=='island');
    value.islandMetadata??={home:value.islandSettings,dawn:{name:'새벽의 서재',description:'이른 아침, 조용히 책을 펼쳐요.',approval:true,public:true}};value.roles??={home:'OWNER',dawn:'MEMBER'};value.ownerNames??={};value.studySlots??={};
    const snapshot=(islandId='home')=>({...copy(value),islandSettings:copy(value.islandMetadata[islandId]||{name:'',description:'',approval:false,public:true}),treasury:value.treasuries[islandId]||0,owned:[...value.owned,...(value.islandOwned[islandId]||[])],placed:[...(value.islandPlaced[islandId]||[])]});
    const owner=role=>{if(role!=='OWNER')throw Error('그룹장만 섬 금고와 설정을 바꿀 수 있어요.');};
    const text=(s,min,max,label)=>{s=String(s||'').trim();if(s.length<min||s.length>max)throw Error(label+'은 '+min+'~'+max+'자로 적어주세요.');return s;};
    return {get:({islandId='home'}={})=>snapshot(islandId),error,products:()=>copy(products),places:()=>copy(places),
      setRole(islandId,role){if(!['OWNER','MEMBER'].includes(role))throw Error('역할을 확인해주세요.');commit(n=>n.roles[islandId]=role);},
      transfer(islandId,to,role){owner(role);if(!to||to==='me')throw Error('위임할 친구를 선택해주세요.');commit(n=>{n.roles[islandId]='MEMBER';n.ownerNames[islandId]=to;});},
      leave(islandId,role,memberCount){if(role==='OWNER'&&memberCount>1)throw Error('그룹장을 위임한 뒤 나갈 수 있어요.');commit(n=>{n.joined=n.joined.filter(id=>id!==islandId);if(n.membership?.id===islandId)n.membership=null;});},
      beginOnboarding(){commit(n=>{n.joined=[];n.membership=null;});},
      profile(patch){const name=text(patch.name??value.profile.name,1,8,'친구 이름');if(patch.coat&&!['calico','cream','gray','brown'].includes(patch.coat))throw Error('털색을 다시 골라주세요.');commit(n=>Object.assign(n.profile,patch,{name}));},
      draft(key,patch){commit(n=>n.drafts[key]={...n.drafts[key],...patch});},
      createIsland(input){const name=text(input.name,2,16,'섬 이름'),description=text(input.description,0,80,'섬 소개');if(value.joined.length>=10)throw Error('참여한 섬은 최대 10개예요.');if(places.some(p=>p.name===name)||value.created?.name===name)throw Error('이미 같은 이름의 섬이 있어요.');return commit(n=>{const place={id:'created-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),name,description,members:1,approval:!!input.approval,code:'MYISLE'};n.created=place;n.joined.push(place.id);n.membership=place;n.islandMetadata[place.id]={name,description,approval:place.approval,public:true};n.roles[place.id]='OWNER';return place;});},
      invite(code){const p=[...places,value.created].filter(Boolean).find(p=>p.code===String(code).trim().toUpperCase());if(!p)throw Error('초대 코드를 찾지 못했어요. 6자리를 다시 확인해주세요.');return copy(p);},
      join(id){const p=[...places,value.created].filter(Boolean).find(p=>p.id===id);if(!p)throw Error('섬을 찾을 수 없어요.');if(value.joined.includes(id))return commit(n=>{n.membership=copy(p);return {status:'joined',place:p};});if(value.joined.length>=10)throw Error('참여한 섬은 최대 10개예요.');if(p.approval){return commit(n=>{if(!n.pending.includes(id))n.pending.push(id);return {status:'pending',place:p};});}return commit(n=>{n.joined.push(id);n.membership=copy(p);return {status:'joined',place:p};});},
      settings(input,role,islandId='home'){owner(role);const name=text(input.name,2,16,'섬 이름'),description=text(input.description,0,80,'섬 소개');commit(n=>n.islandMetadata[islandId]={name,description,approval:!!input.approval,public:!!input.public});},
      review(id,decision,role){owner(role);if(!['approved','declined'].includes(decision))throw Error('승인 상태를 확인해주세요.');return commit(n=>{const a=n.applications.find(a=>a.id===id);if(!a||a.status!=='pending')throw Error('이미 처리한 신청이에요.');a.status=decision;return a;});},
      purchase(id,role,islandId='home'){const p=products.find(p=>p.id===id);if(!p)throw Error('소품을 찾을 수 없어요.');if(p.kind==='island')owner(role);if(snapshot(islandId).owned.includes(id))throw Error('이미 가지고 있는 소품이에요.');const balance=p.kind==='island'?snapshot(islandId).treasury:value.wallet;if(balance<p.price)throw Error('재화가 '+(p.price-balance)+'개 부족해요.');return commit(n=>{if(p.kind==='island'){n.treasuries[islandId]-=p.price;(n.islandOwned[islandId]??=[]).push(id);}else{n.wallet-=p.price;n.owned.push(id);}n.ledger.unshift({id:'purchase-'+islandId+'-'+id,islandId,kind:p.kind,amount:-p.price,title:p.name,by:'나',at:Date.now()});return p;});},
      equip(id,role,islandId='home'){const p=products.find(p=>p.id===id);if(!p||!snapshot(islandId).owned.includes(id))throw Error('먼저 소품을 구매해주세요.');if(p.kind==='island')owner(role);commit(n=>{if(p.kind==='island'){const placed=n.islandPlaced[islandId]||[];n.islandPlaced[islandId]=placed.includes(id)?placed.filter(x=>x!==id):[...placed,id];}else n.equipped[p.slot]=n.equipped[p.slot]===id?null:id;});},
      preference(key,enabled){if(!Object.hasOwn(value.preferences,key))throw Error('설정을 찾을 수 없어요.');commit(n=>n.preferences[key]=!!enabled);},
      placeStudy(slot,role,islandId='home'){owner(role);if(!['west','north'].includes(slot))throw Error('배치 가능한 자리를 골라주세요.');if(!snapshot(islandId).owned.includes('table'))throw Error('먼저 테이블을 구매해주세요.');commit(n=>{n.studySlots[islandId]=slot;const placed=n.islandPlaced[islandId]??=[];if(!placed.includes('table'))placed.push('table');});},
      apps(names){if(!Array.isArray(names)||names.some(n=>!['YouTube','Instagram','TikTok','Safari'].includes(n)))throw Error('앱 목록을 확인해주세요.');commit(n=>n.blockedApps=names);},
      permission(key,enabled){if(!['screen','notification'].includes(key))throw Error('권한을 확인해주세요.');commit(n=>n.permissions[key]=!!enabled);},
      readLetter(id){commit(n=>{if(!n.readLetters.includes(id))n.readLetters.push(id);});},
      reward(session){if(session&&(!session.id||!Number.isFinite(session.seconds)||session.seconds<0))throw Error('세션 기록을 확인해주세요.');if(!session||session.kind==='rest'||session.tag==='휴식'||value.rewardedSessions.includes(session.id))return null;const amount=Math.floor(session.seconds/600);return commit(n=>{n.wallet+=amount;const islandId=session.islandId||'home';n.treasuries[islandId]=(n.treasuries[islandId]||0)+amount;n.rewardedSessions.push(session.id);if(amount>0)n.ledger.unshift({id:'focus-'+session.id,islandId:session.islandId||'home',kind:'island',amount,title:'집중으로 모은 재화',by:'나',at:Date.now()});return amount;});},
      bet(questId,amount){if(!Number.isInteger(amount)||amount<0||amount>100)throw Error('내기는 0~100 재화로 정해주세요.');if(Object.hasOwn(value.bets,questId))throw Error('이미 참여한 내기예요.');if(value.wallet<amount)throw Error('개인 지갑의 재화가 부족해요.');commit(n=>{n.wallet-=amount;n.bets[questId]=amount;n.ledger.unshift({id:'bet-'+questId,kind:'personal',amount:-amount,title:'퀘스트 내기 예치 · 시연',by:'나',at:Date.now()});});}
    };
  }
  const api={create,KEY};if(typeof module!=='undefined')module.exports=api;else{
    root.GachisupIAModel=api;
    if(new URLSearchParams(location.search).has('ia')){
      const memory=new Map(),preview=new URLSearchParams(location.search).get('preview')==='1';
      root.GachisupIAStorage=preview?{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}:{getItem:k=>localStorage.getItem('ia:'+k),setItem:(k,v)=>localStorage.setItem('ia:'+k,v)};
    }
  }
})(globalThis);
