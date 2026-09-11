/* 현재 캐릭터 원본. 과거 momo/동물 시안과 섞지 않는다. */
window.GachisupFigmaCats = Object.freeze([
  {id:'black', name:'검정', avatarNode:'66:92', body:true},
  {id:'cheese', name:'치즈', avatarNode:'66:97', body:true},
  {id:'cream', name:'크림', avatarNode:'66:102', body:true},
  {id:'gray', name:'회색', avatarNode:'66:107', body:true},
  {id:'white', name:'흰색', avatarNode:'66:112', body:true, derived:true},
  {id:'calico', name:'삼색', avatarNode:'66:117', body:true, derived:true},
].map(cat => Object.freeze({...cat,
  avatar:`assets/figma-cats/${cat.id}-avatar.png`,
  standing:cat.body ? `assets/figma-cats/${cat.id}-standing${cat.derived?'-generated':''}.png` : null,
  bodyNode:cat.body && !cat.derived ? '71:108' : null,
  fileKey:'XzlUvx1LGl5OZt6wHr2WRg',
})));
