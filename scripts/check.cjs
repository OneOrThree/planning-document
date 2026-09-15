const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const ignored = new Set(['.git','node_modules','_site','tmp','.hallmark','.omc']);
function filesIn(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).filter(e => !ignored.has(e.name) && e.name !== '.DS_Store')
    .flatMap(e => e.isDirectory() ? filesIn(path.join(dir,e.name)) : [path.join(dir,e.name)]);
}
const failures = [], files = filesIn(root);
let syntax = 0, links = 0;
function check(ok, message) {if (!ok) failures.push(message);}
for (const file of files) {
  const rel = path.relative(root,file), ext = path.extname(file);
  check(!fs.lstatSync(file).isSymbolicLink(), rel + ': 심볼릭 링크는 배포하지 않습니다.');
  check(fs.statSync(file).size < 100 * 1024 * 1024, rel + ': GitHub 단일 파일 한도 초과');
  if (['.js','.cjs'].includes(ext)) {
    const result = spawnSync(process.execPath, ['--check',file], {encoding:'utf8'});
    check(result.status === 0, rel + ': 문법 오류\n' + result.stderr); syntax++;
  }
  if (!['.html','.js','.cjs','.css','.md','.json','.py','.svg','.txt','.yml'].includes(ext)) continue;
  const text = fs.readFileSync(file,'utf8');
  check(!/\/(?:Users|home)\/[\w.-]+\//.test(text), rel + ': 개인 PC 절대 경로');
  check(!/gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9_-]{25,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text), rel + ': 민감 문자열 의심(내용은 출력하지 않음)');
  if (['.html','.css','.js'].includes(ext)) check(!/https?:\/\/(127\.0\.0\.1|localhost)(?::\d+)?\//.test(text), rel + ': 화면의 로컬 서버 주소');
  const references = ext === '.html' ? [...text.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map(m=>m[1])
    : ext === '.css' ? [...text.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(m=>m[1]) : [];
  for (let ref of references) {
    if (/^(?:[a-z]+:|\/\/|#|\?)/i.test(ref) || ref.includes('${')) continue;
    ref = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (!ref) continue;
    check(!ref.startsWith('/'), rel + ': Pages 하위 경로를 벗어나는 링크 ' + ref);
    check(fs.existsSync(path.resolve(path.dirname(file),ref)), rel + ': 없는 연결 파일 ' + ref); links++;
  }
}
const sandbox = {window:{}};
for (const file of ['feature-inventory-data.js','ia-manifest.js','journey-route-data.js']) vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);
const data = sandbox.window.GachisupFeatureInventory, ia = sandbox.window.GachisupIA;
const screenIds = new Set([...ia.screens,...ia.sheets].map(s=>s.id));
const ids = data.features.map(f=>f.id);
check(new Set(ids).size === ids.length, '기능 ID 중복');
for (const f of data.features) {
  check(Boolean(data.decisions[f.decision] && data.proofs[f.proof]), f.id + ': 상태 키 오류');
  check(f.sources.every(id=>data.sources[id]), f.id + ': 출처 키 오류');
  check(f.screens.every(id=>screenIds.has(id) && !data.retiredScreens[id]), f.id + ': IA 연결 오류');
  check(!data.retiredFeatures[f.id], f.id + ': 제외 기능 ID 재사용');
}
for (const [key,source] of Object.entries(data.sources)) {
  check(source.repository === 'phone' ? source.path.startsWith('app/') : fs.existsSync(path.join(root,source.path)), key + ': 출처 경로 오류');
}
for (const [key,route] of Object.entries(sandbox.window.GachisupJourneyRoutes)) {
  check(new Set(route.steps.map(s=>s.id)).size === route.steps.length, key + ': 장면 ID 중복');
  check(route.steps.every(s=>s.title && s.scene && s.action && s.next && s.state && s.boundary), key + ': 장면 필수 필드 누락');
}
const apiSpec = fs.readFileSync(path.join(root,'docs/api/v1/gromo-api-spec.md'),'utf8');
const apiKeys = [...apiSpec.matchAll(/^#### ([a-z][a-z0-9-]*) · /gm)].map(match=>match[1]);
check(/^버전: [^\n]*proposed[^\n]*$/m.test(apiSpec), 'API v1은 협의안 버전으로 표시');
check(apiKeys.length === 98, 'API v1 기능 계약 98개 유지');
check(new Set(apiKeys).size === apiKeys.length, 'API v1 기능 계약 키 중복');
for (const marker of ['## 문서 상태','### 공통 오류 코드 제안','### 건물별 권장 읽기 모델','## 미정 정책']) check(apiSpec.includes(marker), 'API v1 필수 구분 누락: '+marker);
if (failures.length) {console.error(failures.join('\n')); process.exitCode = 1;}
else console.log(JSON.stringify({result:'PASS',files:files.length,syntax,links,features:ids.length,groups:data.groups.length},null,2));
