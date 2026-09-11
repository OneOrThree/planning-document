/* 원본 IA의 36개 화살표를 화면의 실제 컨트롤로 따라간다. */
const {chromium}=require('playwright');
const fs=require('node:fs'),vm=require('node:vm'),sandbox={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/ia-manifest.js','utf8'),sandbox);
const go=(p,id)=>p.locator('[data-ia-go="'+id+'"]:visible').last().click();
const selectors={
  'plaza:cp1':'#coop-pier-marker',
  'cp1:bd2':'[data-coop=board]',
  'fo3:cp1':'#building-panel [data-coop=open]',
  'on2:on4':'[data-ia-action=login][data-value=Google]',
  'on4:on5':'button[form=ia-form]',
  'plaza:fo1':'.camp-presence',
  'fo1:fo2':'[data-action=start]:visible',
  'plaza:vh1':'.landmark[data-building=town]',
  'plaza:bd1':'.landmark[data-building=board]',
  'bd1:bd1a':'[data-feature=read-post]',
  'bd1:bd2':'[data-feature=tab-board][data-value=quests]',
  'bd2:bd3':'[data-feature=read-quest]',
  'bd2:bd4':'[data-feature=compose][data-value=quest]',
  'plaza:ob1':'.landmark[data-building=tower]',
  'ob1:ob2':'[data-feature=tab-ranking][data-value=islands]',
  'plaza:po1':'.landmark[data-building=post]',
  'plaza:hb1':'.landmark[data-building=harbor]',
  'hb2:hb3':'[data-ia-action=preview-island][data-value=moon]',
  'plaza:pr1':'#avatar-position'
};
(async()=>{const browser=await chromium.launch(),results=[];try{for(const edge of sandbox.window.GachisupIA.edges){const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await context.newPage();const key=edge.from+':'+edge.to,errors=[];p.on('pageerror',e=>errors.push(e.message));try{await p.goto(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/index.html?ia=')+edge.from+'&preview=1',{waitUntil:'networkidle'});await p.waitForFunction(id=>document.body.dataset.iaScreen===id,edge.from,{timeout:12000});
      if(key==='cp1:fo2'){await p.locator('[data-coop=preview]').click();await p.locator('[data-coop=create]').click();await p.locator('[data-coop=now]').click();await p.locator('[form=coop-meeting-form]').click();await p.locator('[data-coop=join]').click();await p.locator('[data-coop=start-meeting]').click();}
      else if(key==='on5a:on6'){await p.locator('[name=name]').fill('별빛의 정원');await p.locator('button[form=ia-form]').click();}
      else if(key==='on5b:on6'){await p.locator('[data-ia-action=check-invite]').click();await p.locator('[data-ia-action=join-invite]').click();}
      else if(key==='fo2:fo3'){await p.locator('#focus-footer [data-action=finish]').click();await p.locator('#village-dialog [data-action=confirm-finish]').click();}
      else if(selectors[key]){if(key.startsWith('plaza:')&&selectors[key].startsWith('.landmark'))await p.locator('[data-action=overview]').click();await p.locator(selectors[key]).first().click({timeout:6000});}
      else await go(p,edge.to);
      await p.waitForFunction(id=>document.body.dataset.iaScreen===id,edge.to,{timeout:6000});if(errors.length)throw Error(errors.join('\n'));results.push({from:edge.from,to:edge.to,passed:true});console.log('✓ '+key);
    }catch(e){results.push({from:edge.from,to:edge.to,passed:false,error:e.message});console.log('실패 '+key+' '+e.message);await p.screenshot({path:__dirname+'/screenshots/ia/EDGE-'+edge.from+'-'+edge.to+'.png'});}finally{await context.close();}}
  }finally{await browser.close();}
  const failed=results.filter(r=>!r.passed);console.log(JSON.stringify({passed:results.length-failed.length,total:results.length,failed},null,2));if(failed.length)process.exitCode=1;
})();
