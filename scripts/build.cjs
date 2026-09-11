const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname,'..'), output = path.join(root,'_site');
const check = spawnSync(process.execPath,[path.join(__dirname,'check.cjs')],{stdio:'inherit'});
if (check.status !== 0) process.exit(check.status || 1);
// 삭제는 재생성 전용 _site에만 한정한다. 사용자 원본과 이전 저장소에는 접근하지 않는다.
if (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink()) throw new Error('_site는 실제 디렉터리여야 합니다.');
fs.rmSync(output,{recursive:true,force:true}); fs.mkdirSync(output);
const directories = ['assets','assets-improved','diagrams','revisions','references','screenshots','output','docs'];
for (const name of directories) if (fs.existsSync(path.join(root,name))) fs.cpSync(path.join(root,name),path.join(output,name),{recursive:true,filter:src=>path.basename(src)!=='.DS_Store'});
for (const e of fs.readdirSync(root,{withFileTypes:true})) {
  if (e.isFile() && (/\.(html|css|js|md|png|jpg)$/.test(e.name) || e.name === '.nojekyll')) fs.copyFileSync(path.join(root,e.name),path.join(output,e.name));
}
console.log('배포 파일 준비 완료: _site/ (원본·Git·테스트 의존성은 분리)');
