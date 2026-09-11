const path = require('node:path');
const {spawn} = require('node:child_process');
const {startServer} = require('./serve.cjs');
const root = path.resolve(__dirname,'..');
const tests = ['verify-feature-inventory.cjs','verify-planning-workbench.cjs','verify-journey-routes.cjs','verify-growth-decoration.cjs','verify-feature-story.cjs','scripts/smoke.cjs','scripts/verify-cutscenes.cjs','scripts/verify-cutscene-fur.cjs','scripts/verify-cutscene-cloth.cjs','scripts/verify-cutscene-dock.cjs','scripts/verify-cutscene-tail.cjs','scripts/verify-cutscene-seabirds.cjs','scripts/verify-cutscene-oar-travel.cjs','scripts/verify-cutscene-video-color.cjs'];
(async () => {
  const {server,url} = await startServer({prefix:'/planning-document/'});
  try {
    for (const test of tests) {
      console.log('\n검증: '+test);
      const status = await new Promise((resolve,reject)=>{
        const child=spawn(process.execPath,[path.join(root,test)],{cwd:root,env:{...process.env,BASE_URL:url},stdio:'inherit'});
        child.on('error',reject);child.on('exit',resolve);
      });
      if (status !== 0) throw new Error(test + ' 실패');
    }
  } finally {await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
