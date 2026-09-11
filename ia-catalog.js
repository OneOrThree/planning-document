/* 구조 보기와 실제 시연은 같은 화면 분류와 URL을 사용한다. */
(() => {
  'use strict';
  const S=GachisupIAStructure,$=s=>document.querySelector(s),frame=$('#screen-preview');
  const validActivity=id=>S.activities.some(a=>a.id===id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const activityScreens=new Set(['fo1','fo2','fo3','fo4','sh1','sh2']);
  let current='plaza',view='overview',activity='read',background='',loaded=false,loading=false,loadTimer,overviewScroll=0;
  function readURL(){
    const p=new URLSearchParams(location.search);
    current=S.byId.has(p.get('screen'))?p.get('screen'):'plaza';
    view=p.get('view')==='overview'||!p.has('screen')?'overview':'preview';
    activity=validActivity(p.get('activity'))?p.get('activity'):'read';
    background=['original','refined'].includes(p.get('background'))?p.get('background'):'';
    $('#preview-role').value=p.get('role')==='MEMBER'?'MEMBER':'OWNER';
    $('#preview-width').value=['320','390','768'].includes(p.get('width'))?p.get('width'):'390';
  }
  function url(kind,id=current,selected=activity){
    const p=new URLSearchParams();
    if(kind==='index'){p.set('ia',id);p.set('preview','1');p.set('role',$('#preview-role').value);}
    else{if(kind==='overview')p.set('view','overview');p.set('screen',id);if($('#preview-role').value==='MEMBER')p.set('role','MEMBER');}
    if(activityScreens.has(id)&&validActivity(selected))p.set('activity',selected);
    if(background)p.set('background',background);
    if(['overview','preview'].includes(kind)&&$('#preview-width').value!=='390')p.set('width',$('#preview-width').value);
    return (kind==='index'?'index.html':kind==='mobile'?'mobile.html':'ia.html')+'?'+p;
  }
  const routeLink=(id,cls='screen-node')=>{
    const e=S.byId.get(id);
    return '<a class="'+cls+'" data-screen="'+id+'" href="'+esc(url('preview',id))+'"><code>'+e.code+'</code><span>'+esc(e.name)+'</span><span aria-hidden="true">→</span></a>';
  };
  const normalized=value=>value.toLowerCase().replace(/[\s-]/g,'');
  function matches(e,q){return !q||normalized([e.id,e.code,e.name,e.context,e.description,...e.states].join(' ')).includes(q);}
  function renderLists(){
    const q=normalized($('#screen-search').value.trim());
    const found=S.ordered.filter(e=>matches(e,q)),ids=new Set(found.map(e=>e.id));
    $('#catalog-count').textContent=GachisupIA.screens.length+'개 화면 · '+GachisupIA.sheets.length+'개 보조 시트';
    $('#list-count').textContent=found.length+' / '+S.entries.length;
    $('#search-status').hidden=!q;$('#search-status').textContent=found.length+'개 화면을 찾았어요.';
    $('#search-empty').hidden=found.length>0;$('#list-empty').hidden=found.length>0;
    $('#screen-list').innerHTML=S.groups.map(g=>{
      const entries=[...g.screens,...g.sheets].filter(id=>ids.has(id));
      if(!entries.length)return '';
      return '<p class="screen-group">'+esc(g.name)+'</p>'+entries.map(id=>{
        const e=S.byId.get(id);
        return '<a class="screen-link'+(e.sheet?' is-sheet':'')+'" data-screen="'+id+'" href="'+esc(url('preview',id))+'" '+(id===current?'aria-current="page"':'')+'><small>'+(e.sheet?'↳ ':'')+e.code+'</small><span>'+esc(e.name)+'</span></a>';
      }).join('');
    }).join('');
    const steps=[['on1'],['on2','on3'],['on4'],['on5'],['on5a','on5b'],['on6']];
    $('#onboarding-section').hidden=!steps.flat().some(id=>ids.has(id));
    $('#onboarding-flow').innerHTML=steps.map((step,i)=>{
      const shown=step.filter(id=>ids.has(id));if(!shown.length)return '';
      return '<div class="onboarding-step'+(i===4?' branch':'')+'">'+shown.map(id=>{
        const e=S.byId.get(id);
        if(id==='on3')return '<a class="flow-aside" data-screen="'+id+'" href="'+esc(url('preview',id))+'">'+e.code+' '+e.name+'</a>';
        return '<a class="flow-node" data-screen="'+id+'" href="'+esc(url('preview',id))+'"><code>'+e.code+'</code><strong>'+e.name+'</strong></a>';
      }).join('')+'</div>';
    }).join('');
    $('#onboarding-flow').classList.toggle('is-filtered',!!q);
    $('#home-hub').innerHTML=ids.has('plaza')?'<a class="home-hub" data-screen="plaza" href="'+esc(url('preview','plaza'))+'"><strong><code>PL-1</code>마을 전체</strong><p>건물 탐색 · 길 따라 걷기 · 섬 전체 보기</p><span>화면 보기 →</span></a>':'';
    const activities=S.activities.filter(a=>!q||normalized(a.name+a.place+a.action+a.policy+'활동 집중').includes(q));
    $('#activity-section').hidden=!activities.length;
    $('#activity-branches').innerHTML=activities.map(a=>'<article class="activity-card" data-activity="'+a.id+'"><div class="activity-art"><img src="'+a.asset+'" alt="'+a.place+'에서 '+a.name+'하는 모모" loading="lazy"></div><h3>'+a.name+'<span>'+a.place+'</span></h3><p>'+a.action+'</p><a data-screen="fo2" data-activity="'+a.id+'" href="'+esc(url('preview','fo2',a.id))+'">실제 모션 보기 <span aria-hidden="true">→</span></a><p class="activity-policy">'+a.policy+'</p></article>').join('');
    const features=S.groups.slice(2).filter(g=>[...g.screens,...g.sheets].some(id=>ids.has(id)));
    $('#features-section').hidden=!features.length;
    $('#feature-grid').innerHTML=features.map(g=>{
      const screens=g.screens.filter(id=>ids.has(id)),sheets=g.sheets.filter(id=>ids.has(id));
      return '<section class="feature-group" data-group="'+g.id+'" aria-labelledby="group-'+g.id+'"><header><h3 id="group-'+g.id+'">'+g.name+'<small>'+g.screens.length+'화면'+(g.sheets.length?' · '+g.sheets.length+'시트':'')+'</small></h3><p>'+g.description+'</p></header><ul class="node-list">'+screens.map(id=>'<li>'+routeLink(id)+'</li>').join('')+'</ul>'+(sheets.length?'<ul class="node-list sheet-list" aria-label="'+g.name+' 보조 시트">'+sheets.map(id=>'<li>'+routeLink(id)+'</li>').join('')+'</ul>':'')+(g.note?'<p class="group-note">'+g.note+'</p>':'')+'</section>';
    }).join('');
  }
  function renderDetails(){
    const e=S.byId.get(current),index=S.ordered.indexOf(e);
    $('#screen-title').textContent=e.name;
    $('#screen-context').textContent=e.context+' / '+e.code+(e.sheet?' · 보조 시트':'');
    $('#screen-position').textContent=(index+1)+' / '+S.ordered.length;
    $('#previous-screen').disabled=index===0;$('#next-screen').disabled=index===S.ordered.length-1;
    const connections=(key,other)=>[...new Set(S.links.filter(l=>l[key]===current).map(l=>l[other]))];
    const links=(title,ids)=>ids.length?'<section class="inspector-section"><h2>'+title+'</h2><div class="inspector-links">'+ids.map(id=>'<a data-screen="'+id+'" href="'+esc(url('preview',id))+'"><code>'+S.byId.get(id).code+'</code>'+S.byId.get(id).name+' →</a>').join('')+'</div></section>':'';
    $('#screen-details').innerHTML='<section class="inspector-section"><h2>이 화면의 역할</h2><p>'+esc(e.description)+'</p>'+(e.notice?'<p class="inspector-notice">'+esc(e.notice)+'</p>':'')+'</section><section class="inspector-section"><h2>화면 안에서</h2><ul>'+e.states.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul></section>'+links('들어오는 곳',connections('to','from'))+links('이어지는 화면',connections('from','to'));
    $('#activity-switcher').hidden=!['fo1','fo2'].includes(current);
    $('#activity-switcher').innerHTML=S.activities.map(a=>'<button type="button" data-preview-activity="'+a.id+'" aria-pressed="'+(activity===a.id)+'">'+a.name+' · '+(a.id==='rest'?'낚시':a.place)+'</button>').join('');
    $('#mobile-link').href=url('mobile');$('#standalone-link').href=url('index');
    $('#header-mobile-link').href=url('mobile');
    $('#home-link').href='index.html'+(background?'?background='+background:'');
    $('#overview-tab').href=url('overview');$('#preview-tab').href=url('preview');
    document.title=(view==='overview'?'전체 구조':e.name)+' · 같이숲 화면 설계';
  }
  function fit(){
    if(view!=='preview')return;
    const stage=$('.preview-stage'),width=Number($('#preview-width').value),height=844;
    const scale=Math.max(.1,Math.min(1,stage.clientWidth/width,stage.clientHeight/height));
    frame.width=width;frame.height=height;frame.style.transform='scale('+scale+')';
    $('#preview-fit').style.width=width*scale+'px';$('#preview-fit').style.height=height*scale+'px';
    $('#preview-scale').textContent=width+' × '+height+' · '+Math.round(scale*100)+'%';
  }
  function loadFrame(){
    loaded=true;loading=true;$('#preview-loading').hidden=false;$('#preview-loading').textContent='화면을 불러오는 중이에요.';
    clearTimeout(loadTimer);loadTimer=setTimeout(()=>{$('#preview-loading').textContent='화면을 불러오지 못했어요. 목록에서 다시 선택해주세요.';},20000);
    frame.src=url('index');
  }
  function render({reload=false,push=false}={}){
    document.body.dataset.view=view;
    $('#overview-panel').hidden=view!=='overview';$('#preview-panel').hidden=view!=='preview';
    for(const id of ['overview','preview']){const tab=$('#'+id+'-tab');if(id===view)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current');}
    renderLists();renderDetails();fit();
    const next=url(view);
    if(location.pathname+location.search!==new URL(next,location.href).pathname+new URL(next,location.href).search)history[push?'pushState':'replaceState'](null,'',next);
    if(view==='preview'&&(reload||!loaded))loadFrame();
  }
  function select(id,nextActivity){
    if(!S.byId.has(id))return;
    if(view==='overview')overviewScroll=scrollY;
    current=id;view='preview';if(validActivity(nextActivity))activity=nextActivity;
    render({reload:true,push:true});scrollTo(0,0);
    requestAnimationFrame(()=>$('#screen-list [aria-current]')?.scrollIntoView({block:'nearest',inline:'nearest'}));
    $('#screen-title').focus({preventScroll:true});
  }
  document.addEventListener('click',event=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const route=event.target.closest('a[data-screen]'),tab=event.target.closest('a[data-view]');
    if(route){event.preventDefault();select(route.dataset.screen,route.dataset.activity);}
    else if(tab){event.preventDefault();if(view==='overview')overviewScroll=scrollY;view=tab.dataset.view;render({push:true});scrollTo(0,view==='overview'?overviewScroll:0);}
  });
  $('#screen-search').addEventListener('input',renderLists);
  $('#clear-search').addEventListener('click',()=>{$('#screen-search').value='';renderLists();$('#screen-search').focus();});
  $('#preview-width').addEventListener('change',()=>render({push:true}));
  $('#preview-role').addEventListener('change',()=>render({reload:true,push:true}));
  $('#activity-switcher').addEventListener('click',event=>{const button=event.target.closest('[data-preview-activity]');if(button)select(current,button.dataset.previewActivity);});
  $('#previous-screen').addEventListener('click',()=>{const i=S.ordered.findIndex(e=>e.id===current);if(i>0)select(S.ordered[i-1].id);});
  $('#next-screen').addEventListener('click',()=>{const i=S.ordered.findIndex(e=>e.id===current);if(i<S.ordered.length-1)select(S.ordered[i+1].id);});
  frame.addEventListener('load',()=>{if(frame.contentWindow?.GachisupIAApp){loading=false;clearTimeout(loadTimer);$('#preview-loading').hidden=true;}});
  addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.type!=='gachisup:screen'||!S.byId.has(event.data.id))return;
    if(loading&&event.data.id!==current)return;
    current=event.data.id;
    if(validActivity(event.data.activity))activity=event.data.activity;
    if(['OWNER','MEMBER'].includes(event.data.role))$('#preview-role').value=event.data.role;
    loading=false;clearTimeout(loadTimer);$('#preview-loading').hidden=true;render();
  });
  addEventListener('popstate',()=>{readURL();render({reload:true});});
  new ResizeObserver(fit).observe($('.preview-stage'));
  readURL();render();
})();
