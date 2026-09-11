/* 원화 알파 경계를 읽기만 한다. 발인지 꼬리인지는 사람이 확인하며 자동 등록·승인하지 않는다. */
const {chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
(async()=>{
  const names=process.argv.slice(2);
  if(!names.length||names.some(n=>!/^[-a-z0-9]+$/.test(n)))throw Error('poses-black의 확장자 없는 원화 이름이 필요합니다.');
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage();await page.goto(url+'cutscenes.html');
    const result=await page.evaluate(async names=>Promise.all(names.map(name=>new Promise((resolve,reject)=>{
      const im=new Image();im.onerror=()=>reject(Error('원화 로드 실패: '+name));
      im.onload=()=>{
        const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;
        const c=canvas.getContext('2d');c.drawImage(im,0,0);const a=c.getImageData(0,0,canvas.width,canvas.height).data;
        let minX=canvas.width,minY=canvas.height,maxX=-1,maxY=-1;
        for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(a[(y*canvas.width+x)*4+3]>128){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
        const bottomRuns=[];let start=null;
        for(let x=0;x<=canvas.width;x++){
          const occupied=x<canvas.width&&maxY>=0&&Array.from({length:Math.min(12,maxY+1)},(_,i)=>a[((maxY-i)*canvas.width+x)*4+3]).some(alpha=>alpha>128);
          if(occupied&&start===null)start=x;
          if(!occupied&&start!==null){bottomRuns.push([start,x-1]);start=null;}
        }
        resolve({name,width:im.width,height:im.height,alphaThreshold:128,bounds:{minX,minY,maxX,maxY},bottomRuns,note:'최하단 12행의 불투명 구간. 실제 발바닥인지 시각 확인 후 등록한다.'});
      };
      im.src='assets/cutscenes/poses-black/'+name+'.png';
    }))),names);
    console.log(JSON.stringify(result,null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
