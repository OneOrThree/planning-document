/* 35개 원본 화면과 9개 도출 시트를 실제 브라우저에서 검사·캡처한다. */
const {chromium}=require('playwright');
const fs=require('node:fs'),vm=require('node:vm');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/ia-manifest.js','utf8'),sandbox);
const routes=[...sandbox.window.GachisupIA.screens,...sandbox.window.GachisupIA.sheets].map(x=>x.id);
(async()=>{const browser=await chromium.launch({headless:true}),results=[];
  try{for(const width of [390,320,768]){const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});
    for(const id of routes){const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('fonts.googleapis'))errors.push(m.text());});
      try{await page.goto(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/index.html?ia=')+id+'&preview=1',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.GachisupIAApp,{timeout:15000});await page.waitForTimeout(180);
        const details=await page.evaluate(()=>{const page=document.querySelector('#ia-page'),sheet=document.querySelector('#ia-sheet'),panel=document.querySelector('#building-panel'),native=document.querySelector('#village-dialog');const host=sheet.open?sheet:native.open?native:!page.hidden?page:panel&&!panel.hidden?panel:document.body;return {route:document.body.dataset.iaScreen,overflow:document.documentElement.scrollWidth>innerWidth+1,text:host.innerText.slice(0,130),scrollHeight:host.scrollHeight,height:host.clientHeight,innerOverflow:[...document.querySelectorAll('.ia-page-content,.ia-sheet,.building-content,.ia-product-grid,.ia-discovery-list,.ia-inline-tabs,.panel-footer')].filter(e=>e.getBoundingClientRect().height>0&&e.scrollWidth>e.clientWidth+2).map(e=>e.className),emptyButtons:[...host.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height>0&&!b.textContent.trim()&&!b.getAttribute('aria-label')&&!b.getAttribute('title')).length};});
        await page.screenshot({path:__dirname+'/screenshots/ia/'+id+'-'+width+'.png'});results.push({id,width,...details,errors});console.log(JSON.stringify(results.at(-1)));}
      catch(e){results.push({id,width,errors:[...errors,e.message]});console.log('FAIL '+id+' '+e.message);}finally{await page.close();}
    }await context.close();}
  }finally{await browser.close();}
  const fails=results.filter(r=>r.errors.length||r.overflow||r.innerOverflow?.length||r.route!==r.id);console.log('IA 화면 검사: '+results.length+'개 / 실패 '+fails.length);if(fails.length){console.log(JSON.stringify(fails,null,2));process.exitCode=1;}
})();
