/* 읽기 전용 목록. 제품 localStorage나 실제 시연 상태를 변경하지 않는다. */
(() => {
  'use strict';
  const data=window.GachisupFeatureInventory;
  const $=s=>document.querySelector(s);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels=new Map([...(window.GachisupIA?.screens||[]),...(window.GachisupIA?.sheets||[])].map(s=>[s.id,s.label]));
  const controls={q:$('#search'),group:$('#group-filter'),decision:$('#decision-filter'),proof:$('#proof-filter')};
  let quick='',expandAll=false;
  const featuresById=new Map(data.features.map(f=>[f.id,f]));
  const searchable=new Map(data.features.map(f=>[f.id,[f.id,f.title,f.action,f.world,f.note,...Object.values(f.revision||{}),...f.sources.map(s=>data.sources[s].name)].join(' ').normalize('NFKC').toLocaleLowerCase()]));
  const revisionHTML=f=>f.revision?`<div class="revision-detail"><p class="revision-change">2026.09.11 수정본 · 원본 ${escape(f.revision.ref)} · ${escape(f.revision.change)}</p><dl>${['의도','필요한 이유','기능·지킬 선','유저 플로우','감성 표현'].map(key=>`<div><dt>${escape(key)}</dt><dd>${escape(f.revision[key])}</dd></div>`).join('')}</dl><a href="focus-revision-20260911.md" target="_blank" rel="noopener">수정본 전체 기록 ↗</a></div>`:'';
  const detailLinks=f=>[
    ...f.screens.map(id=>`<a href="ia.html?screen=${encodeURIComponent(id)}" target="_blank" rel="noopener">${f.document?'이전 시연 · ':''}${escape(labels.get(id)||id.toUpperCase())} ↗</a>`),
    ...(f.document?[`<a href="${escape(f.document)}" target="_blank" rel="noopener">제공된 최신 기획 보기 ↗</a>`]:[]),
    ...(f.story?[`<a href="eli5-journey.html#${encodeURIComponent(f.story)}">이야기 그림 보기 ↗</a>`]:[]),
    ...(f.studio?[`<a href="${escape(f.studio)}" target="_blank" rel="noopener">모션 작업실 보기 ↗</a>`]:[])
  ].join('');
  const featureHTML=f=>`<details class="feature" id="feature-${f.id}" data-feature="${f.id}" data-decision="${f.decision}" data-proof="${f.proof}">
    <summary class="feature-summary"><span><span class="feature-title"><span class="feature-id">${f.id}</span><strong>${escape(f.title)}</strong></span><span class="feature-action">${escape(f.action)}</span></span><span class="feature-world"><span class="mobile-label">섬에서는</span>${escape(f.world)}</span><span class="feature-state"><span class="badge decision-${f.decision}">${escape(data.decisions[f.decision])}</span><span class="badge proof">${escape(data.proofs[f.proof])}</span></span></summary>
    <div class="feature-detail"><p class="feature-note">${escape(f.note)}</p>${revisionHTML(f)}<div class="detail-links">${detailLinks(f)}</div><p class="source-heading">문서·코드 근거 · 이 저장소 기준 경로 · 원앱 app/ 경로는 별도 비공개 phone 저장소</p><ul class="source-list">${f.sources.map(id=>{const s=data.sources[id];return `<li><strong>${escape(s.name)}</strong><span class="basis">${escape(s.basis)}</span><code>${escape(s.path)}</code></li>`;}).join('')}</ul></div>
  </details>`;
  const groupFeaturesHTML=g=>g.domains?g.domains.map(d=>`<section class="feature-domain" data-domain="${escape(d.id)}" aria-labelledby="domain-${escape(d.id)}"><div class="domain-heading"><p class="eyebrow">${escape(d.title)} · <span data-domain-count>${g.features.filter(f=>f.domain===d.id).length}</span>개 기능</p><h3 id="domain-${escape(d.id)}">${escape(d.headline)}</h3><p>${escape(d.why)}</p><p>${escape(d.summary)}</p><details><summary>경험 예시와 지킬 선</summary><p>${escape(d.experience)}</p><p>${escape(d.boundary)}</p></details></div>${g.features.filter(f=>f.domain===d.id).map(featureHTML).join('')}</section>`).join(''):g.features.map(featureHTML).join('');
  $('#catalog').innerHTML=data.groups.map((g,index)=>`<section class="feature-group" id="group-${g.id}" data-group="${g.id}" aria-labelledby="heading-${g.id}"><div class="group-heading"><span class="group-number">${String(index+1).padStart(2,'0')}</span><div><h2 id="heading-${g.id}">${escape(g.name)}<small data-group-count></small></h2><p>${escape(g.intro)}</p><p class="place">${escape(g.place)}</p></div></div>${groupFeaturesHTML(g)}</section>`).join('');
  $('#group-index').innerHTML=data.groups.map(g=>`<a href="#group-${g.id}" data-index="${g.id}"><span class="group-letter">${g.features[0].id[0]}</span><span>${escape(g.name)}</span><span class="count">${g.features.length}</span></a>`).join('');
  for(const g of data.groups)controls.group.add(new Option(g.name,g.id));
  for(const [id,label] of Object.entries(data.decisions))controls.decision.add(new Option(label,id));
  for(const [id,label] of Object.entries(data.proofs))controls.proof.add(new Option(label,id));
  $('#total-features').textContent=data.features.length;
  $('#total-groups').textContent=data.groups.length;
  $('#total-screens').textContent=new Set(data.features.flatMap(f=>f.screens)).size;
  const rows=[...document.querySelectorAll('.feature')];
  const sections=[...document.querySelectorAll('.feature-group')];
  function matches(f,tokens){
    return (!controls.group.value||f.group===controls.group.value)
      &&(!controls.decision.value||f.decision===controls.decision.value)
      &&(!controls.proof.value||f.proof===controls.proof.value)
      &&(quick!=='decide'||['proposal','review'].includes(f.decision))
      &&tokens.every(t=>searchable.get(f.id).includes(t));
  }
  function writeURL(){
    const url=new URL(location.href);
    url.searchParams.set('mode','detail');
    url.searchParams.delete('tab');
    // 새 필터를 공유·새로고침할 때 이전 바로가기 항목이 필터를 되돌리지 않게 한다.
    url.hash='';
    for(const [key,control] of Object.entries(controls)){
      if(control.value)url.searchParams.set(key,control.value);else url.searchParams.delete(key);
    }
    if(quick==='decide')url.searchParams.set('view',quick);else url.searchParams.delete('view');
    history.replaceState(null,'',url);
  }
  function syncExpanded(){
    const visible=rows.filter(r=>!r.hidden);
    expandAll=visible.length>0&&visible.every(r=>r.open);
    $('#toggle-details').textContent=expandAll?'근거 모두 접기':'근거 모두 펼치기';
    $('#toggle-details').setAttribute('aria-expanded',String(expandAll));
    $('#toggle-details').hidden=!visible.length;
  }
  function render(updateURL=true){
    const tokens=controls.q.value.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let total=0,groupTotal=0;
    for(const row of rows){row.hidden=!matches(featuresById.get(row.dataset.feature),tokens);if(!row.hidden)total++;}
    for(const domain of document.querySelectorAll('.feature-domain')){
      const count=[...domain.querySelectorAll('.feature')].filter(row=>!row.hidden).length;
      domain.hidden=!count;domain.querySelector('[data-domain-count]').textContent=count;
    }
    for(const section of sections){
      const count=[...section.querySelectorAll('.feature')].filter(r=>!r.hidden).length;
      section.hidden=!count;if(count)groupTotal++;
      section.querySelector('[data-group-count]').textContent=count+'개';
      const index=$(`[data-index="${section.dataset.group}"]`);
      index.hidden=!count;index.querySelector('.count').textContent=count;
      index.setAttribute('aria-current',String(section.dataset.group===controls.group.value));
    }
    $('#result-count').innerHTML=`<strong>${total}개</strong> / 전체 ${data.features.length}개 · ${groupTotal}개 영역`;
    $('#empty').hidden=total>0;
    $('.column-head').hidden=total===0;
    for(const b of document.querySelectorAll('[data-view]')){
      const view=b.dataset.view;
      const active=view==='decide'?quick==='decide':view==='legacy'?controls.decision.value==='review':view==='pending'?controls.proof.value==='pending':!quick&&!Object.values(controls).some(c=>c.value);
      b.setAttribute('aria-pressed',String(active));
    }
    syncExpanded();if(updateURL)writeURL();
  }
  function readURL(){
    const params=new URLSearchParams(location.search);
    for(const [key,c] of Object.entries(controls))c.value=params.get(key)||'';
    quick=params.get('view')==='decide'?'decide':'';
    render(false);
  }
  function reset(){for(const c of Object.values(controls))c.value='';quick='';render();}
  controls.q.addEventListener('input',()=>render());
  for(const key of ['group','decision','proof'])controls[key].addEventListener('change',()=>{if(key==='decision')quick='';render();});
  for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>{
    const view=button.dataset.view;
    for(const c of Object.values(controls))c.value='';quick='';
    if(view==='decide')quick='decide';
    if(view==='legacy')controls.decision.value='review';
    if(view==='pending')controls.proof.value='pending';
    render();
  });
  $('#reset').addEventListener('click',reset);
  $('#empty-reset').addEventListener('click',()=>{reset();controls.q.focus();});
  $('#toggle-details').addEventListener('click',()=>{const next=!expandAll;for(const row of rows)if(!row.hidden)row.open=next;syncExpanded();});
  for(const row of rows)row.addEventListener('toggle',syncExpanded);
  function revealHash(){
    const id=location.hash.slice(1);
    const target=document.getElementById(id);
    if(!target||!target.matches('.feature,.feature-group'))return;
    if(target.hidden||target.closest('.feature-group')?.hidden){
      reset();
      const url=new URL(location.href);url.hash=id;history.replaceState(null,'',url);
    }
    if(target.matches('.feature'))target.open=true;
    requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
  }
  window.addEventListener('popstate',()=>{readURL();revealHash();});
  window.addEventListener('hashchange',revealHash);
  readURL();revealHash();
})();
