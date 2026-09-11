/* 베젤 안에서도 기존 앱 한 인스턴스를 유지한다. 회전은 iframe의 크기만 바꾼다. */
(() => {
  const $=selector=>document.querySelector(selector),frame=$('#mobile-preview');
  const entries=GachisupIAStructure.entries;
  const byId=new Map(entries.map(entry=>[entry.id,entry]));
  const wideScreens=new Set(['plaza','pr3','hb3','fo2']);
  const params=new URLSearchParams(location.search);
  let current=byId.has(params.get('screen'))?params.get('screen'):'plaza',activity=['read','study','rest'].includes(params.get('activity'))?params.get('activity'):'read';
  let preferred=params.get('orientation')==='landscape'?'landscape':'portrait';
  let orientation='portrait',actualSize=false,loadTimer=0,cameraVersion=0;
  $('#mobile-role').value=params.get('role')==='MEMBER'?'MEMBER':'OWNER';
  const names={plaza:'마을',fo1:'활동 시작',fo2:'활동 중',on6:'우리 섬에 입항',pr3:'섬 꾸미기',hb3:'다른 섬 구경'};
  const groups=GachisupIAStructure.groups.map(g=>[g.name,[...g.screens,...g.sheets]]);
  for(const [label,ids] of groups){const group=document.createElement('optgroup');group.label=label;for(const id of ids){const option=document.createElement('option');option.value=id;option.textContent=names[id]||byId.get(id).label.replace(/^\S+\s+/, '');group.append(option);}$('#mobile-screen').append(group);}

  function fit(){
    const stage=$('#preview-stage'),width=orientation==='portrait'?414:868,height=orientation==='portrait'?868:414;
    const style=getComputedStyle(stage),availableW=stage.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),availableH=stage.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
    const scale=actualSize?1:Math.max(.1,Math.min(1,availableW/width,availableH/height));
    const root=document.documentElement.style;
    root.setProperty('--device-scale',scale);root.setProperty('--scaled-w',width*scale+'px');root.setProperty('--scaled-h',height*scale+'px');
    $('#preview-scale').textContent=(actualSize?'원래 크기':'화면 맞춤')+' '+Math.round(scale*100)+'%';
  }
  function rotate(next){
    const changed=orientation!==next;orientation=next;
    const portrait=next==='portrait',root=document.documentElement.style;
    root.setProperty('--screen-w',(portrait?390:844)+'px');root.setProperty('--screen-h',(portrait?844:390)+'px');root.setProperty('--phone-w',(portrait?414:868)+'px');root.setProperty('--phone-h',(portrait?868:414)+'px');
    $('#phone').dataset.orientation=next;frame.width=portrait?390:844;frame.height=portrait?770:390;
    $('#portrait').setAttribute('aria-pressed',portrait);$('#landscape').setAttribute('aria-pressed',!portrait);$('#device-size').textContent=portrait?'390 × 844':'844 × 390';
    fit();
    if(changed){const version=++cameraVersion;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(version!==cameraVersion)return;const api=frame.contentWindow?.GachisupVillage;if(!api)return;if(api.state.session)api.refocus();else if(current==='plaza'&&!api.state.selected){if(api.state.overview)api.overview(false);else api.homeCamera();}}));}
  }
  function update(){
    $('#mobile-screen').value=current;
    const supportsWide=wideScreens.has(current);
    $('#landscape').disabled=!supportsWide;
    $('#landscape').title=supportsWide?'넓은 화면으로 보기':'이 화면은 세로에 맞춰져 있어요';
    rotate(supportsWide?preferred:'portrait');
    const label=names[current]||byId.get(current).label.replace(/^\S+\s+/, '');
    $('#orientation-note').textContent=!supportsWide?label+' · 읽고 작성하는 화면은 세로로 보여요':current==='fo2'?(activity==='rest'?'휴식 · 기본 낚싯대로 낚시하며 쉬어요':'활동 중 · 세로는 몰입, 가로는 풍경과 타이머를 나란히'):current==='pr3'?'섬 꾸미기 · 가로로 돌리면 배치 미리보기와 상품을 나란히':orientation==='landscape'?'마을을 넓게 둘러보세요 · 건물을 누르고 길을 따라 걸어요':'마을 · 건물을 누르고 길을 따라 걸어보세요';
    document.title=label+' · 같이숲 모바일';
    $('#catalog-link').href='ia.html?screen='+current+'&role='+$('#mobile-role').value+(['fo1','fo2','fo3','fo4','sh1','sh2'].includes(current)?'&activity='+activity:'')+(['original','refined'].includes(params.get('background'))?'&background='+params.get('background'):'');
    const query=new URLSearchParams({screen:current});if(preferred==='landscape')query.set('orientation','landscape');if($('#mobile-role').value==='MEMBER')query.set('role','MEMBER');
    if(['original','refined'].includes(params.get('background')))query.set('background',params.get('background'));if(['fo1','fo2','fo3','fo4','sh1','sh2'].includes(current))query.set('activity',activity);
    history.replaceState(null,'','mobile.html?'+query);
  }
  function load(id){
    current=id;update();$('#preview-loading').hidden=false;$('#preview-loading').textContent='우리 숲을 불러오는 중';
    clearTimeout(loadTimer);loadTimer=setTimeout(()=>{$('#preview-loading').textContent='화면을 불러오지 못했어요. 화면 목록에서 다시 선택해주세요.';},15000);
    const query=new URLSearchParams({ia:current,preview:'1',role:$('#mobile-role').value,device:'phone'});
    if(['original','refined'].includes(params.get('background')))query.set('background',params.get('background'));if(['fo1','fo2','fo3','fo4','sh1','sh2'].includes(current))query.set('activity',activity);
    frame.src='index.html?'+query;
  }
  $('#mobile-screen').addEventListener('change',event=>load(event.target.value));
  $('#mobile-role').addEventListener('change',()=>load(current));
  for(const value of ['portrait','landscape'])$('#'+value).addEventListener('click',()=>{preferred=value;update();});
  $('#actual-size').addEventListener('click',()=>{actualSize=!actualSize;$('#actual-size').setAttribute('aria-pressed',actualSize);$('#actual-size').setAttribute('aria-label',actualSize?'화면에 맞춰 보기':'원래 크기로 보기');fit();});
  frame.addEventListener('load',()=>{if(frame.contentDocument?.querySelector('#village-app')){clearTimeout(loadTimer);$('#preview-loading').hidden=true;}});
  addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.type!=='gachisup:screen'||!byId.has(event.data.id))return;current=event.data.id;if(['read','study','rest'].includes(event.data.activity))activity=event.data.activity;if(['OWNER','MEMBER'].includes(event.data.role))$('#mobile-role').value=event.data.role;update();clearTimeout(loadTimer);$('#preview-loading').hidden=true;});
  new ResizeObserver(fit).observe($('#preview-stage'));
  load(current);
})();
