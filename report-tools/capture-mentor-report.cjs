const fs = require('node:fs/promises');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'tmp/pdfs/mentor-2026-09-08');
const base = process.env.VILLAGE_URL || (process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');
const shots = [];
async function main() {
  await fs.mkdir(out, {recursive: true});
  const browser = await chromium.launch();
  const errors = [];
  try {
    const context = await browser.newContext({viewport: {width:1440,height:1000}, deviceScaleFactor:2, reducedMotion:'reduce'});
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    const ready = async () => {
      await page.locator('#load-state').waitFor({state:'hidden'});
      await page.locator('.avatar-walker[data-walk-state=ready]').waitFor({state:'attached'});
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
    };
    const shot = async (name, selector) => {
      const file = path.join(out, name+'.jpg');
      await (selector ? page.locator(selector) : page).screenshot({path:file,type:'jpeg',quality:89});
      shots.push({name,file,url:page.url(),selector:selector||'viewport'});
      console.log('캡처 '+name);
    };
    const feature = async (action,value) => page.locator(`[data-feature="${action}"]${value===undefined?'':`[data-value="${value}"]`}`).last().click();
    await page.goto(base);await ready();await shot('village-desktop');
    await page.locator('[data-action=quiet]').click();await shot('village-only');
    await page.locator('[data-action=quiet]').click();
    await page.locator('[data-action=zoom-in]').click();await page.locator('[data-action=zoom-in]').click();await shot('village-zoom');
    await page.locator('[data-action=overview]').click();
    await page.setViewportSize({width:390,height:844});await ready();await shot('village-mobile');
    await page.setViewportSize({width:1440,height:1000});
    for (const key of ['camp','town','board','cabin','harbor','tower','post']) {
      await page.goto(base+'/?screen='+key);await ready();
      await page.locator('#building-panel:not([hidden])').waitFor();
      await shot(key+'-panel','#building-panel');
      if(key==='cabin'){
        await feature('tab-stats','me');await feature('period','WEEK');await shot('cabin-personal','#building-panel');
        await feature('tab-detail','phone');await shot('cabin-phone','#building-panel');
      }
      if(key==='board') {
        await feature('tab-board','notice');await shot('board-notices','#building-panel');
        await feature('compose','notice');
        await page.locator('#compose-title').fill('이번 주에는 하루 25분, 함께 읽어요');
        await page.locator('#compose-content').fill('같이숲 프로토타입 시연용 공지입니다.\n\n매일 부담 없이 한 번, 모닥불에 모여 책을 읽어요. 집중을 마치면 오두막에서 각자의 기록을 확인할 수 있어요.');
        await page.locator('[name=pinned]').check();await shot('board-compose','#building-panel');
        await feature('preview');await shot('board-preview','#building-panel');
        await feature('publish-preview');await shot('board-detail','#building-panel');
      }
    }
    await page.setViewportSize({width:390,height:844});
    await page.goto(base+'/?screen=camp');await ready();await shot('camp-mobile');
    await page.locator('#focus-task').selectOption('독서');
    await page.locator('[data-action=start]').click();
    await page.locator('.avatar-reader[data-rig-state=ready]').waitFor();
    await page.waitForTimeout(300);await shot('focus-mobile');
    await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(350);await shot('focus-desktop');
    // 보고용 격리 브라우저에서만 125초가 지난 시연 상태를 만든다.
    await page.evaluate(() => {const now=Date.now;Date.now=()=>now()+125000;});
    await page.waitForTimeout(350);
    await page.locator('[data-action=finish]').click();await page.locator('[data-action=confirm-finish]').click();
    await shot('focus-result','#building-panel');
    for (const id of ['momo','puppy','golden','capybara','red-panda']) {
      await page.goto(base+'/rig.html?character='+id);
      await page.locator('#character-mount[data-rig-state=ready]').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.locator('#timeline').fill('0');
      if(id==='puppy'){
        await shot('reading-studio');
        for(const [label,t] of [['open','0'],['half','4.91'],['closed','4.96'],['page-right','9.85'],['page-middle','10.2'],['page-left','10.55']]){
          await page.locator('#timeline').fill(t);await shot('reading-'+label,'#character-mount');
        }
      }
    }
    for (const id of ['momo','puppy','capybara','red-panda']) {
      await page.goto(base+'/walk.html?character='+id);
      await page.locator('#walk-mount[data-walk-state=ready]').waitFor();
      await page.locator('#walk-cycle').fill('0.25');
      if(id==='red-panda')await shot('walking-studio');
      for(const [label,dir,cycle] of [['front','sw','0.25'],['back','ne','0.75']]){
        await page.locator(`button[data-direction=${dir}]`).click();
        await page.locator('#walk-cycle').fill(cycle);await shot('walk-'+id+'-'+label,'#walk-mount');
      }
      if(id==='puppy'){
        await page.locator('button[data-direction=sw]').click();await page.locator('#walk-bones').click();await shot('walking-bones','#walk-mount');
      }
    }
    if(errors.length)throw Error(errors.join('\n'));
    await fs.writeFile(path.join(out,'captures.json'),JSON.stringify({date:'2026-09-08',errors,shots},null,2));
  } finally { await browser.close(); }
  const tests=['verify-store.cjs','verify-features.cjs','verify-panels.cjs','verify-focus.cjs'];
  const results=[];
  async function run(file) {
    const result=await new Promise(resolve=>{
      const proc=spawn(process.execPath,[file],{cwd:root,env:process.env});let log='';
      proc.stdout.on('data',c=>log+=c);proc.stderr.on('data',c=>log+=c);
      proc.on('close',code=>resolve({file,code,log}));
    });
    await fs.writeFile(path.join(out,result.file+'.log'),result.log);
    const match=[...result.log.matchAll(/(\d+)개(?: 집중| 기능)? 검증 통과/g)].at(-1);
    results.push({file,code:result.code,count:match?Number(match[1]):null});
    console.log('검증 '+file+' '+result.code+' '+(match?.[0]||result.log.slice(-250)));
  }
  await Promise.all([run(tests[0]),run(tests[1])]);
  await Promise.all([run(tests[2]),run(tests[3])]);
  await fs.writeFile(path.join(out,'verification.json'),JSON.stringify(results,null,2));
  if(results.some(r=>r.code!==0))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
