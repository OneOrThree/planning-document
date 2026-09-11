/* 화면 목업이 아닌 이야기 설명. 제품 상태·저장소·세션과 연결하지 않는다. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s);
  const picture=(file,x,y,size)=>`<image href="${file}" x="${x}" y="${y}" width="${size}" height="${size}"/>`;
  const label=(x,y,line,size=20)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="#36594f" font-size="${size}">${line}</text>`;
  const sea='<rect width="820" height="560" fill="#b6cfcb"/><path d="M-40 345q100-24 210 0t210 0t210 0t250 0M30 490q60-18 120 0m355-16q70-20 150 0M62 169q50-14 90 0m400-29q55-16 110 0" fill="none" stroke="#e4ecde" stroke-width="4" stroke-linecap="round"/>';
  const ground='<g data-place="our-island"><ellipse cx="410" cy="325" rx="293" ry="130" fill="#7eaaa5" opacity=".26"/><path d="M116 285Q123 162 276 136Q419 86 615 165Q752 219 699 342Q611 449 351 425Q144 416 116 285Z" fill="#bdab89"/><path d="M116 273Q123 150 276 124Q419 74 615 153Q752 207 699 330Q611 437 351 413Q144 404 116 273Z" fill="#ecdfbf"/><path d="M151 267Q161 174 289 153Q420 113 591 178Q700 222 662 316Q574 398 354 383Q183 376 151 267Z" fill="#a6b78c"/><path d="M225 291Q257 218 418 201T595 302Q500 359 347 332T225 291Z" fill="none" stroke="#d8d0a7" stroke-width="22" stroke-linecap="round"/></g>';
  const tree=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0v40" stroke="#917657" stroke-width="9" stroke-linecap="round"/><path d="M-28 5q-21-33 10-47q8-25 31-8q34-3 28 30q16 30-18 34Z" fill="#86a17b" stroke="#70886a" stroke-width="2.5"/></g>`;
  const flag='<path d="M530 240v-66" stroke="#827051" stroke-width="5" stroke-linecap="round"/><path d="M532 174q22-13 48 0q-10 11 0 24q-25-12-48 0Z" fill="#c69775"/>';
  const pier='<g data-story-place="pier" stroke="#887257" stroke-width="3" stroke-linejoin="round"><path d="m333 323 207 58-21 70-216-65Z" fill="#c8a478"/><path d="m303 386 216 65v14l-216-65Z" fill="#a78962"/><path d="m338 329-19 61m53-51-19 61m53-52-19 61m53-51-19 61m53-51-19 60m53-51-19 61" fill="none"/><path d="M317 387v37m197 22v35m-165-148v36m190 6v38" stroke-width="10" stroke-linecap="round"/></g>';
  const island=finished=>ground+tree(216,210,.8)+tree(600,205,.8)+tree(581,315,.58)+picture('assets-improved/building-town-hall.png',330,140,135)+picture('assets-improved/building-notice-board.png',235,257,70)+flag+(finished?pier:'<path d="m321 362 203 56-16 42-203-60Z" stroke="#978364" stroke-width="3" stroke-dasharray="9 7" fill="#eee0c4" opacity=".7"/>');
  const telescope='<g transform="translate(95 362) rotate(-25)"><path d="M20 22h110v34H20Z" fill="#b79e76" stroke="#7c7058" stroke-width="3"/><rect x="119" y="14" width="27" height="51" rx="5" fill="#e0d0a8" stroke="#7c7058" stroke-width="3"/><path d="M75 58v25m0-6-31 48m31-48 30 48" fill="none" stroke="#7c7058" stroke-width="7" stroke-linecap="round"/></g>';
  const camp=picture('assets/momo-rig-source.png',270,226,138)+picture('assets/capybara-reading-rig-v2.png',402,243,120)+'<ellipse cx="402" cy="368" rx="35" ry="12" fill="#d3c99e"/><path d="m375 365 50 8m-43 0 37-17" stroke="#8e7250" stroke-width="9" stroke-linecap="round"/><path d="M389 359q-14-17 10-39q-1 15 11 19q13 15-1 27Z" fill="#cf9568"/>';
  const scenes=[
    {id:'find',short:'찾아오다',title:'바람이 소개한 낯선 섬.',description:'처음엔 풍경과 모임이 궁금해서 찾아와요. 초대받은 사람은 친구의 편지를 따라 곧장 같은 섬으로 와요.',voice:'“저기는 어떤 사람들이 머물까?”',bridge:'탐색·공개모집·초대 → 첫 인연의 계기',alt:'망원경과 환영 깃발이 있는 섬, 그 섬으로 향하는 작은 뗏목',draw:()=>sea+'<g transform="translate(110 -30) scale(.84)">'+island(false)+'</g><path d="M0 433Q90 385 178 443L235 560H0Z" fill="#e9dcbc"/>'+telescope+picture('assets/momo-walk-front.png',85,401,112)+GachisupRaftArt.solo(535,330,180)+'<path d="M226 150Q343 41 580 102" stroke="#eff2df" stroke-width="5" fill="none" stroke-dasharray="15 10"/>'},
    {id:'stay',short:'함께하다',title:'오늘 목표, 우리 같이 채워보자.',description:'함께할 목표를 정하고 같은 활동에 참여해요. 공부하는 내용은 달라도, 서로의 집중을 보태 이루는 도전과 완성은 우리의 일이에요.',voice:'“우리 같이 시작해서, 함께 해내자.”',bridge:'공통의 약속 → 함께 참여 → 우리가 해낸 결과',alt:'같은 섬의 모닥불에서 함께 집중할 약속에 참여한 캐릭터들',draw:()=>sea+island(false)+camp},
    {id:'build',short:'만들다',title:'우리의 기여가 장소로 남아요.',description:'여러 날 보탠 기여로 작은 부두를 마련해요. 섬의 발전은 장식이 늘어나는 일이면서, 함께 할 수 있는 일이 늘어나는 일이에요.',voice:'“저 부두, 우리가 같이 만든 거야.”',bridge:'공동 기여·성장·꾸미기 → 우리가 만든 장소',alt:'같은 섬에 완성된 작은 부두와 그 앞에 모인 캐릭터들',draw:()=>sea+island(true)+picture('assets/momo-walk-front.png',284,267,130)+picture('assets/red-panda-walk-front-v1.png',438,278,115)+'<path d="m423 105 3 12 12 3-12 3-3 12-3-12-12-3 12-3Z" fill="#f5e8b7"/>'},
    {id:'gather',short:'모이다',title:'완성한 부두가 다음 약속이 돼요.',description:'“오늘 저녁, 우리 부두에서 같이 집중하자!” 같은 약속에 참여하고 서로의 집중을 보태요. 캐릭터들은 같은 뗏목에서 함께 낚시해요.',voice:'“새로 만든 부두에서, 오늘도 같이 하자.”',bridge:'시간 퀘스트·초대·공동 액션 → 다시 만날 약속',alt:'우리가 만든 부두 앞, 같은 뗏목에서 함께 낚시하는 세 캐릭터',draw:()=>sea+island(true)+'<g transform="translate(160 225) scale(.64)">'+GachisupRaftArt.group()+'</g>'},
    {id:'return',short:'돌아오다',title:'이젠, 돌아올 이유가 있어요.',description:'처음 함께한 낚시가 장소의 기억으로 남아요. 다음엔 새 섬을 찾는 대신, 편지나 해도로 익숙한 우리 부두에 돌아와요.',voice:'“오늘도 그 자리에서 만나자.”',bridge:'기록·편지·귀환 → 기억이 이어지는 소속감',alt:'익숙한 같은 섬과 우리 부두의 첫 모임을 담은 기념 엽서',draw:()=>sea+'<g transform="translate(-24 35) scale(.82)">'+island(true)+'</g><g transform="rotate(4 613 315)"><rect x="457" y="174" width="295" height="316" rx="10" fill="#fbf5e6" stroke="#c4b392" stroke-width="2"/><rect x="476" y="193" width="257" height="182" rx="4" fill="#bad1cb"/><g transform="translate(380 157) scale(.47)">'+GachisupRaftArt.group()+'</g>'+label(605,414,'우리 부두의 첫 모임',21)+label(605,446,'함께한 일이 이야기가 돼요',16)+'</g>'}
  ];
  let current=0;
  $('#story-chapters').innerHTML=scenes.map((s,i)=>`<li><button type="button" data-chapter="${s.id}" aria-controls="story-world story-title story-description"><span>${String(i+1).padStart(2,'0')}</span>${s.short}</button></li>`).join('');
  function render(){
    const requested=location.hash.replace('#chapter-','');
    const index=scenes.findIndex(s=>s.id===requested);if(index>=0)current=index;
    const scene=scenes[current];
    $('#story-world').innerHTML=`<svg viewBox="0 0 820 560" aria-hidden="true">${scene.draw()}</svg><span class="story-art-note">이야기 설명용 그림</span>`;
    $('#story-world').setAttribute('aria-label',scene.alt);
    $('#story-title').textContent=scene.title;
    $('#story-description').textContent=scene.description;
    $('#story-voice').textContent=scene.voice;
    $('#story-bridge').textContent=scene.bridge;
    $('#story-kicker').textContent=`${String(current+1).padStart(2,'0')} / 05 · ${scene.short}`;
    for(const button of document.querySelectorAll('[data-chapter]')){
      if(button.dataset.chapter===scene.id)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    }
  }
  function select(index){
    current=index;const url=new URL(location.href);url.hash='chapter-'+scenes[index].id;
    if(location.hash!==url.hash)history.pushState(null,'',url);render();
  }
  $('#story-chapters').addEventListener('click',e=>{const b=e.target.closest('[data-chapter]');if(b)select(scenes.findIndex(s=>s.id===b.dataset.chapter));});
  $('#story-chapters').addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?4:(current+(e.key==='ArrowRight'?1:-1)+5)%5;
    select(next);$(`[data-chapter="${scenes[next].id}"]`).focus({preventScroll:true});
  });
  window.GachisupFeatureStory=scenes;
  window.addEventListener('popstate',render);window.addEventListener('hashchange',render);render();
})();
