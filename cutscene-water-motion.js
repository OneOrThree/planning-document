/* 수면만 작은 가로 굴절을 주는 2D 실험. 육지·부두·캐릭터는 변형하지 않는다. */
(() => {
  const W=960,H=1280,clamp=x=>Math.max(0,Math.min(1,x));
  const boundaries={
    shore:[[960,304],[257,304],[267,344],[179,390],[210,493],[378,535],[394,729],[225,785],[210,888],[275,990],[325,1090],[469,1180],[515,1280],[960,1280]],
    home:[[960,304],[382,304],[375,388],[373,426],[417,485],[489,562],[512,644],[512,813],[339,853],[308,931],[337,994],[400,1085],[531,1195],[620,1280],[960,1280]],
  };
  function offset(y,t){
    const depth=clamp((y-310)/760),enter=clamp((y-304)/100);
    return enter*(.32+depth*2.2)*(Math.sin(y*.014-t*.72)+.26*Math.sin(y*.031+t*.41));
  }
  function draw(c,img,scene,t,amount=1){
    const edge=boundaries[scene];if(!edge||!amount)return;
    c.save();c.beginPath();edge.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
    // 원본은 아래에 남겨 두고, 물 영역만 얇은 행으로 샘플링한다. 행 간 변위는 연속이다.
    for(let y=304;y<H;y+=4){
      const height=Math.min(5,H-y),dx=offset(y+2,t)*amount;
      c.drawImage(img,0,y/H*img.height,img.width,height/H*img.height,dx,y,W,height);
    }
    c.restore();
  }
  window.CutsceneWaterMotion={draw,offset,boundaries,width:W,height:H,status:'experimental'};
})();
