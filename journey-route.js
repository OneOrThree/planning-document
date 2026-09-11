/* 문서 경로 선택만 처리한다. 제품 저장소·권한·타이머에는 접근하지 않는다. */
(() => {
  'use strict';
  const routes = window.GachisupJourneyRoutes;
  const panel = document.getElementById('journey-route');
  if (!routes || !panel) return;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const overview = [...document.querySelectorAll('.journey-converge,.journey-loop,.journey-return')];
  let active = null;
  const href = key => '?tab=journey&route=' + key + '#journey-route';
  function render() {
    const requested = new URLSearchParams(location.search).get('route');
    const routeHash = location.hash === '#journey-route' || location.hash.startsWith('#route-');
    const key = Object.hasOwn(routes, requested) ? requested : (requested || routeHash ? 'invite' : null);
    panel.hidden = !key;
    for (const node of overview) node.hidden = Boolean(key);
    if (key && key !== active) {
      const route = routes[key];
      panel.innerHTML = `<div class="route-heading"><p class="route-label">선택한 경로 · ${escape(route.label)}</p><h3 id="journey-route-title" tabindex="-1">${escape(route.title)}</h3><p>${escape(route.intro)}</p></div>
        <nav class="route-switcher" aria-label="다른 시작 경로 읽기">${Object.entries(routes).map(([id,item]) => `<a href="${href(id)}" data-journey-choice="${id}">${escape(item.label)}</a>`).join('')}</nav>
        <p class="route-reading-note">${escape(route.readingNote || "이야기는 처음부터 끝까지 읽을 수 있어요. 아래 상태는 해당 방향의 확정 여부이며, 대사·세부 순서까지 모두 확정했다는 뜻은 아니에요. 실제 앱 시연이 아닌 기획 문서예요.")}</p>
        <ol class="route-scenes">${route.steps.map((step,index) => `<li id="route-${key}-${step.id}" data-route-scene="${step.id}"><div class="route-scene-heading"><span class="route-scene-number">${String(index+1).padStart(2,'0')}</span><h4>${escape(step.title)}</h4><small>${escape(step.state)}</small></div><p class="route-scene-story">${escape(step.scene)}</p><dl><div><dt>내가 하는 일</dt><dd>${escape(step.action)}</dd></div><div><dt>그다음</dt><dd>${escape(step.next)}</dd></div></dl><details><summary>예외 · 더 정할 부분</summary><p>${escape(step.boundary)}</p></details></li>`).join('')}</ol>
        <div class="planning-crosslink"><a href="${escape(route.source)}">이 경로의 이야기 원문 ↗</a> · <a href="?tab=growth">섬의 발전 흐름 →</a></div>`;
    }
    active = key;
    panel.dataset.activeRoute = key || '';
    for (const link of document.querySelectorAll('[data-journey-choice]')) {
      if (link.dataset.journeyChoice === key) link.setAttribute('aria-current','true');
      else link.removeAttribute('aria-current');
    }
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-journey-choice]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState(null, '', link.getAttribute('href'));
    window.dispatchEvent(new PopStateEvent('popstate'));
    requestAnimationFrame(() => {
      document.getElementById('journey-route-title')?.focus({preventScroll:true});
      panel.scrollIntoView({block:'start'});
    });
  });
  window.addEventListener('popstate', render);
  window.addEventListener('hashchange', render);
  render();
})();
