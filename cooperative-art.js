/* 생성 원본은 보존하고, 시연 엔진의 기존 크로마키·메시 리그 방식을 재사용한다. */
(() => {
  const art={source:'',error:null};
  art.ready=(async()=>{
    const source=new Image();source.src='assets/cooperative-fishing-boat-v1-key.png';await source.decode();
    const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),p=pixels.data;
    for(let i=0;i<p.length;i+=4){
      const key=Math.min(p[i],p[i+2])-p[i+1];
      if(key>45){const alpha=1-Math.min(1,(key-45)/100);p[i+3]=Math.round(p[i+3]*alpha);if(alpha>0){p[i]=Math.min(p[i],p[i+1]+75);p[i+2]=Math.min(p[i+2],p[i+1]+38);}}
    }
    ctx.putImageData(pixels,0,0);art.source=canvas.toDataURL('image/png');
    const bone=(pivot,label)=>({parent:'root',pivot,limit:2,label});
    art.profile={source:art.source,bones:{root:{parent:null,pivot:[500,750],limit:0,label:'공동 보트'},back:bone([266,300],'뒷자리 친구'),middle:bone([487,470],'가운데 친구'),front:bone([715,638],'앞자리 친구')},
      regions:[
        {bone:'back',polygon:[[142,185],[174,131],[218,150],[277,171],[326,125],[354,206],[363,259],[340,294],[279,317],[202,302],[158,270]],feather:18,strength:1},
        {bone:'middle',polygon:[[341,345],[374,294],[417,312],[480,326],[545,287],[572,360],[600,401],[579,456],[521,481],[452,482],[389,461],[347,417]],feather:18,strength:1},
        {bone:'front',polygon:[[580,515],[614,471],[655,487],[704,496],[776,443],[800,508],[838,556],[811,613],[754,641],[692,643],[629,618],[588,574]],feather:18,strength:1}
      ],motions:{idle:{back:{amplitude:.45,frequency:.4,phase:.3},middle:{amplitude:.55,frequency:.38,phase:2},front:{amplitude:.45,frequency:.42,phase:4}},nod:{back:{amplitude:.8,frequency:.8},middle:{amplitude:.8,frequency:.8,phase:.5},front:{amplitude:.8,frequency:.8,phase:1}}}};
  })().catch(e=>{art.error=e.message;});
  art.renderFishing=(rig,boat)=>{
    let overlay=boat.querySelector('.coop-tackle');
    if(!overlay){overlay=document.createElementNS('http://www.w3.org/2000/svg','svg');overlay.setAttribute('viewBox','0 0 1000 1000');overlay.setAttribute('aria-hidden','true');overlay.classList.add('coop-tackle');overlay.innerHTML=[0,1,2].map(i=>'<g><path fill="none" stroke="#f8efdb" stroke-width="2.2"/><g class="coop-float"><ellipse cy="7" rx="22" ry="6" fill="none" stroke="#d7eee1" stroke-width="2"/><path d="M0-16V10" stroke="#775b41" stroke-width="2"/><ellipse rx="5" ry="9" fill="#e9d3ab"/><path d="M-5 0Q0 14 5 0Z" fill="#bb7554"/></g></g>').join('');boat.append(overlay);}
    const tips=[[535,44],[769,211],[968,372]];
    [...overlay.children].forEach((group,i)=>{
      const [x,y]=tips[i],fx=1080+i*62+Math.sin(rig.time*.4+i)*5,fy=330+i*160+Math.sin(rig.time*.8+i)*7;
      group.querySelector('path').setAttribute('d','M'+x+' '+y+'Q'+(fx+8)+' '+((y+fy)*.5)+' '+fx+' '+fy);
      group.querySelector('.coop-float').setAttribute('transform','translate('+fx+' '+fy+')');
    });
    boat.dataset.cooperativeTime=rig.time.toFixed(3);
  };
  window.GachisupCooperativeArt=art;
})();
