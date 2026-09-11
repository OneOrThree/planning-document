(() => {
  const params=new URLSearchParams(location.search);
  if(window.self!==window.top||['ia','device','activity','screen','walk'].some(key=>params.has(key)))return;
  const nav=document.querySelector('#prototype-entry');
  if(params.get('background')==='original')for(const link of nav.querySelectorAll('a')){const url=new URL(link.href);url.searchParams.set('background','original');link.href=url.pathname+url.search;}
  document.body.classList.add('prototype-home');nav.hidden=false;
})();
