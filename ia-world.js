/* IA 지갑·섬 상태를 동일한 마을 좌표에 반영한다. 실제 presence 서버는 연결하지 않는다. */
(() => {
  const {prop,decorPositions,icon,esc}=GachisupIAView;
  let decorKey=null,studyKey=null;
  const write=(element,text)=>{if(element&&element.textContent!==text)element.textContent=text;};
  window.GachisupIAWorldSync=c=>{
    const data=c.api.model.get(),id=data.currentIsland,island=data.islands.find(p=>p.id===id),visiting=c.api.state.visiting;
    const count=data.samples?Math.min(3,Math.max(0,(visiting?c.ui.visit?.members||4:island?.members||1)-1)):0;
    document.querySelectorAll('.resident-cat').forEach((el,i)=>{el.hidden=i>=count;});
    for(const selector of ['.camp-presence','.header-presence']){const el=document.querySelector(selector);if(el){const text=selector==='.camp-presence'?(count?count+'명 집중 중':'빈자리에서 시작해요'):(count?'모닥불에 '+count+'명이 있어요':'오늘의 첫 집중을 시작해요');if(el.dataset.countText!==text){el.dataset.countText=text;el.innerHTML='<span class="live-dot"></span>'+text+(selector==='.header-presence'?icon('arrow'):'');}el.title='집중 공간 예시 · 60초마다 시연 상태 확인 · 실제 서버 미연결';}}
    if(c.api.state.session?.tag==='독서'&&!c.api.state.session?.worldAction){const names=['모모','두부','밤이'].slice(0,count);write(document.querySelector('.focus-company'),names.length?names.join(' · ')+'와 함께':'혼자여도 좋아요. 첫 시간을 쌓는 중');}
    const slot=!visiting&&c.data.placed.includes('table')?(c.data.studySlots[id]||'west'):'west',studyNext=id+':'+slot;
    if(studyKey!==studyNext){studyKey=studyNext;c.api.placeStudy(GachisupIAView.studyPlots[slot].point);}
    const key=id+':'+(visiting?'visit':c.data.placed.join(','));if(decorKey!==key){decorKey=key;let layer=document.querySelector('.ia-focus-world-props');if(!layer){layer=document.createElement('div');layer.className='ia-focus-world-props';layer.setAttribute('aria-hidden','true');document.querySelector('#map-layer').append(layer);}layer.innerHTML=visiting?'':c.data.placed.filter(p=>p!=='table'&&decorPositions[p]).map(id=>`<span class="ia-world-prop" data-decor="${id}" style="left:${decorPositions[id][0]}px;top:${decorPositions[id][1]}px">${prop(id)}</span>`).join('');}
    const label=document.querySelector('.avatar-name');if(label)write(label,c.data.profile.name+' · 나');
    if(c.api.state.selected==='tower'&&c.api.features.ui.ranking==='group'&&!document.querySelector('.ia-last-week')){const previous=c.api.model.stats({islandId:id,scope:'group',period:'WEEK',offset:-1}),totals=c.api.model.members(id).filter(m=>m.public).map(m=>({...m,seconds:previous.sessions.filter(s=>s.userId===m.id).reduce((n,s)=>n+s.seconds,0)})).sort((a,b)=>b.seconds-a.seconds);if(totals[0]?.seconds){const badge=document.createElement('p');badge.className='ia-last-week';badge.innerHTML=icon('star')+'지난주 1위 · '+esc(totals[0].id==='me'?c.data.profile.name:totals[0].name)+' · 이번 주 왕관 배지';document.querySelector('.ranking-preview')?.before(badge);}}
  };
})();
