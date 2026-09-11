(() => {
  const mount = document.getElementById('prologue-options');
  if (!mount) return;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  mount.innerHTML = window.GachisupPrologues.map(option => `<article class="prologue-option" id="prologue-${escape(option.id)}" data-prologue="${escape(option.id)}" data-state="proposal">
    <p class="eyebrow">${escape(option.number)} · ${escape(option.tone)}</p><h3>${escape(option.title)}</h3><p>${escape(option.logline)}</p>
    <details><summary>처음부터 읽기 · 4개 장면</summary><ol>${option.scenes.map(scene=>`<li>${escape(scene)}</li>`).join('')}</ol></details>
    <p><strong>뗏목에 오르는 이유</strong><br>${escape(option.whyRaft)}</p><p><strong>왜 함께인가</strong><br>${escape(option.together)}</p>
    <details><summary>초대·무초대 연결과 제작 범위</summary><dl>${[['실제 초대가 있다면','invite'],['초대가 없다면','discover'],['장점과 주의점','tradeoff'],['연출에 필요한 것','production']].map(([label,key])=>`<div><dt>${label}</dt><dd>${escape(option[key])}</dd></div>`).join('')}</dl></details>
    <p><a href="cutscenes.html?film=${escape(option.id)}-emotion">이 이야기의 영상 연출 3가지 보기 ↗</a></p>
    <p class="prologue-question">${escape(option.question)}</p></article>`).join('');
})();
