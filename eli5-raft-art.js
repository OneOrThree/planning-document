/* ELI5 설명용 뗏목 도식. 앱의 원화·리깅·저장소와 독립적이다. */
(() => {
  'use strict';
  const image=(file,x,y,size)=>`<image href="${file}" x="${x}" y="${y}" width="${size}" height="${size}"/>`;
  // 낮은 통나무 판과 두 줄의 결속 밧줄. 배의 선체·옆벽·뱃머리는 쓰지 않는다.
  const deck=()=>`<g data-watercraft-deck="raft"><ellipse cx="464" cy="390" rx="221" ry="23" fill="#78a69f" opacity=".28"/>${Array.from({length:8},(_,i)=>{
    const x=250+i*12,y=302+i*11,endX=590+i*12,endY=270+i*11;
    return `<path d="M${x} ${y}L${endX} ${endY}" fill="none" stroke="#846b4e" stroke-width="27" stroke-linecap="round"/><path d="M${x} ${y-2}L${endX} ${endY-2}" fill="none" stroke="${i%2?'#c9aa7d':'#d6b98c'}" stroke-width="22" stroke-linecap="round"/><path d="M${x+19} ${y-7}q103-14 236-22" fill="none" stroke="#e7cca2" stroke-width="2" stroke-linecap="round"/><ellipse cx="${endX}" cy="${endY}" rx="9" ry="11" fill="#dfc094" stroke="#92714f" stroke-width="2"/><ellipse cx="${endX}" cy="${endY}" rx="4" ry="6" fill="none" stroke="#b08b60" stroke-width="1.5"/>`;
  }).join('')}<g fill="none" stroke-linecap="round"><path d="M311 293 402 378M525 273 616 358" stroke="#806c4e" stroke-width="10"/><path d="M311 292 402 377M525 272 616 357" stroke="#eee0b9" stroke-width="6"/><path d="M313 291 402 376M527 271 616 356" stroke="#baa17a" stroke-width="1.5" stroke-dasharray="3 5"/></g></g>`;
  const solo=(x,y,size=260)=>`<g data-watercraft="raft" transform="translate(${x} ${y})"><g transform="scale(${size/460})"><g transform="translate(-225 -120)">${deck()}</g>${image('assets/momo-walk-front.png',136,8,220)}<path d="M108 137 46 290" fill="none" stroke="#846b4e" stroke-width="8" stroke-linecap="round"/><path d="m39 267 17 7-15 39q-4 8-13 4q-8-3-5-11Z" fill="#cbae80" stroke="#846b4e" stroke-width="3"/></g></g>`;
  const group=()=>`<g data-watercraft="raft">${deck()}${image('assets/momo-walk-front.png',242,141,190)}${image('assets/capybara-walk-front-v1.png',367,129,190)}${image('assets/red-panda-walk-front-v1.png',493,156,172)}<g fill="none" stroke="#826d4f" stroke-width="4" stroke-linecap="round"><path d="M340 338q35-165 54-175M465 330q31-144 48-159M587 324q39-126 57-136"/></g><g fill="none" stroke="#fbf7e8" stroke-width="2"><path d="M394 163q115 82 140 297M513 171q113 86 128 280M644 188q92 71 96 207"/></g><g fill="#bd8468"><circle cx="534" cy="460" r="5"/><circle cx="641" cy="451" r="5"/><circle cx="740" cy="395" r="5"/></g></g>`;
  window.GachisupRaftArt=Object.freeze({deck,solo,group});
})();
