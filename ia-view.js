/* 기존 마을의 색·글꼴·아이콘을 쓰는 IA 공통 표현. */
(() => {
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=key=>Art.icon(key);
  const button=(label,action,value='',kind='primary',extra='')=>`<button type="button" class="ia-button ${kind}" data-ia-action="${action}" data-value="${esc(value)}" ${extra}>${label}</button>`;
  const link=(label,to,kind='ia-row',glyph='arrow')=>`<button type="button" class="${kind}" data-ia-go="${to}"><span>${label}</span>${icon(glyph)}</button>`;
  const heading=(title,copy='')=>`<div class="ia-intro"><h2 tabindex="-1">${title}</h2>${copy?`<p>${copy}</p>`:''}</div>`;
  const note=(text,kind='')=>`<p class="ia-note ${kind}">${text}</p>`;
  const input=(name,label,value='',attrs='')=>`<label class="ia-field"><span>${label}</span><input name="${name}" value="${esc(value)}" ${attrs}></label>`;
  const toggle=(key,label,copy,checked)=>`<label class="ia-toggle"><span><b>${label}</b>${copy?`<small>${copy}</small>`:''}</span><input type="checkbox" data-ia-pref="${key}" ${checked?'checked':''}><i aria-hidden="true"></i></label>`;
  const island=(cls='')=>`<img class="ia-island ${cls}" src="${GachisupBackground.map.src}" alt="잔잔한 바다 위 느티나무 섬">`;
  function prop(id){
    if(id==='table')return '<img class="ia-prop ia-table-sprite" src="'+esc(window.GachisupActivities?.tableAsset||'')+'" alt="">';
    const outline='stroke="#796046" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
    const shapes={
      beret:'<path fill="#7b8c60" d="M17 56C8 23 79 6 91 43Q104 68 58 77Q30 82 17 56Z"/><path fill="#526347" d="M23 62Q58 73 85 55L87 65Q49 88 23 73Z"/><path d="M58 25L55 17"/>',
      flower:'<path d="M54 83Q61 59 48 41" fill="none"/><path fill="#7f9865" d="M53 72Q23 73 25 51Q50 49 53 72Z"/><path fill="#fff0c8" d="M45 42C22 43 20 20 39 20C36 0 61 0 65 19C86 16 91 39 70 44C77 65 53 70 47 51C29 64 15 46 31 35Z"/><circle cx="52" cy="35" r="10" fill="#d5a65e"/>',
      glasses:'<path d="M11 48H20M47 50Q54 42 62 50M89 47H100" fill="none"/><circle cx="33" cy="52" r="17" fill="#eee9d69c"/><circle cx="77" cy="52" r="17" fill="#eee9d69c"/>',
      ribbon:'<path fill="#bd9079" d="M50 40L20 25Q10 49 21 74L49 57M60 40L87 25Q100 49 87 74L60 57"/><path fill="#a77662" d="M45 37H64V60H45Z"/>',
      bench:'<path fill="#bf9b6d" d="M17 28L76 10L88 21L28 41Z"/><path fill="#a57c52" d="M17 28V39L28 52L88 33V21L28 41Z"/><path d="M23 37V62M80 24V45" fill="none"/><path fill="#98704c" d="M23 62V88L32 93V67M79 46V71L87 74V50"/><path fill="#c19a68" d="M10 44L72 25L103 48L42 72Z"/><path fill="#aa7d50" d="M10 44V54L42 81L103 57V48L42 72Z"/><path d="M23 40L54 66M36 36L67 61M48 33L79 57" fill="none"/>',
      lamp:'<path d="M49 89V17H80M45 91H57" fill="none" stroke-width="7"/><path fill="#6d634a" d="M68 24L80 15L92 24V53L80 60L68 53Z"/><path fill="#f4d58b" d="M73 29H87V49H73Z"/><path d="M80 8V16"/>',
      garden:'<path fill="#7a9360" d="M10 63Q10 39 32 48Q45 29 60 46Q85 30 91 54Q110 67 91 81L28 92Q4 84 10 63Z"/>'+[25,48,73,89].map((x,i)=>`<path d="M${x} 77V${45+i%2*13}" fill="none"/><path fill="#f8ead0" d="M${x} ${40+i%2*13}c-10-12-18 4-8 9c-9 13 9 20 11 9c14 5 19-12 8-15c2-14-14-14-11-3Z"/><circle cx="${x+1}" cy="${50+i%2*13}" r="4" fill="#caa662"/>`).join(''),
      flag:'<path d="M28 92V12" fill="none" stroke-width="5"/><path fill="#ecdfbd" d="M31 17Q53 3 67 17L90 14V57Q70 65 56 49L31 57Z"/><path fill="#7c9165" d="M51 38Q39 27 50 24Q61 24 55 36Q72 17 76 29Q76 39 55 39V47"/>'
    };
    return `<svg class="ia-prop" viewBox="0 0 110 110" fill="none" aria-hidden="true"><ellipse cx="55" cy="95" rx="39" ry="6" fill="#74855a22"/><g ${outline}>${shapes[id]||shapes.flower}</g></svg>`;
  }
  function cat(equipped={}){return `<div class="ia-cat"><img src="assets/momo-rig-source.png" alt="책을 읽는 삼색 고양이 모모">${Object.entries(equipped).filter(([,id])=>id).map(([slot,id])=>`<span class="ia-worn ia-worn-${slot}">${prop(id)}</span>`).join('')}</div>`;}
  window.GachisupIAView={esc,icon,button,link,heading,note,input,toggle,island,prop,cat,studyPlots:{west:{name:'숲길 옆',point:[624,433]},north:{name:'회관 아래',point:[828,390]}},decorPositions:{table:[624,433],bench:[752,481],lamp:[693,365],garden:[956,643],flag:[844,753]}};
  window.GachisupIAPages={};
})();
