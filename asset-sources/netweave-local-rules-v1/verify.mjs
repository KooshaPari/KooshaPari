import {readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const source = 'asset-sources/netweave-local-rules-v1';
const output = 'output/netweave-local-rules-v1';
const entries = [];
for (const dir of [source, output]) {
  for (const name of readdirSync(dir).filter(n => /\.(png|webp|mp4|blend|py)$/.test(n))) {
    const path = `${dir}/${name}`;
    const entry = {path, bytes:statSync(path).size, sha256:createHash('sha256').update(readFileSync(path)).digest('hex')};
    if (/\.(png|webp|mp4)$/.test(name)) {
      entry.media = JSON.parse(execFileSync('ffprobe', ['-v','error','-show_entries','stream=width,height,codec_name','-show_entries','format=duration,size','-of','json',path], {encoding:'utf8'}));
    }
    entries.push(entry);
  }
}
const pngs = entries.filter(e=>e.path.endsWith('.png'));
if(pngs.length !== 6) throw Error('Expected six renders');
for(const e of pngs) {
  const s=e.media.streams[0], desktop=e.path.includes('desktop');
  if(s.width !== (desktop?1600:800) || s.height !== (desktop?1100:1000)) throw Error('Unexpected dimensions');
}
const manifest={id:'netweave-local-rules-v1',project:'netweave',mode:'system',created:new Date().toISOString(),rights:'Original procedural geometry; no third-party inputs; no license grant asserted',boundary:'Illustrative local-spacing study, not recorded NetWeave output; no congestion-aware rerouting implemented',tools:{blender:'4.4.3 direct application binary',ffmpeg:'8.1.2',encoder:'cwebp'},reviewer:'asset_production_readiness self-review; independent review pending',disposition:'LOCAL-VERIFIED production files; independent acceptance pending',fallback:'poster-mobile.webp and caption transcript',entries};
writeFileSync(`${source}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
writeFileSync(`${output}/verification.json`,JSON.stringify({date:manifest.created,pngCount:pngs.length,dimensionsPassed:true,renderExitCodes:[0,0,0],publication:'Not integrated or published',entries},null,2)+'\n');
console.log(JSON.stringify(entries.map(({path,bytes})=>({path,bytes})),null,2));
