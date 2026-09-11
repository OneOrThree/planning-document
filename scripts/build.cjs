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
let excludedReviewImages=0;
const publishFile=src=>{
  if(path.basename(src)==='.DS_Store')return false;
  const relative=path.relative(root,src).split(path.sep).join('/');
  // 확대 검토 원본은 Git에 보존한다. Pages에는 JSON 근거와 실제 영상만 중복 없이 싣는다.
  if(/^output\/cutscenes\/(details|reviews|asset-qa)\/.*\.(png|jpe?g|webp|gif)$/i.test(relative)){excludedReviewImages++;return false;}
  return true;
};
for (const name of directories) if (fs.existsSync(path.join(root,name))) fs.cpSync(path.join(root,name),path.join(output,name),{recursive:true,filter:publishFile});
for (const e of fs.readdirSync(root,{withFileTypes:true})) {
  if (e.isFile() && (/\.(html|css|js|md|png|jpg)$/.test(e.name) || e.name === '.nojekyll')) fs.copyFileSync(path.join(root,e.name),path.join(output,e.name));
}
const sizeOf=dir=>fs.readdirSync(dir,{withFileTypes:true}).reduce((sum,e)=>sum+(e.isDirectory()?sizeOf(path.join(dir,e.name)):fs.statSync(path.join(dir,e.name)).size),0);
const bytes=sizeOf(output);if(bytes>=1_000_000_000)throw new Error('Pages 배포 묶음이 1 GB에 도달했습니다. 원본 삭제 대신 공개 산출물 구성을 조정하세요.');
console.log(JSON.stringify({publishedBytes:bytes,excludedReviewImages,reviewOriginals:'Git 저장소에 보존'}));
console.log('배포 파일 준비 완료: _site/ (원본·Git·테스트 의존성은 분리)');
