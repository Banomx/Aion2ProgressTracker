#!/usr/bin/env bash
set -euo pipefail
project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
dist_root="$project_root/dist"
rm -rf "$dist_root"
mkdir -p "$dist_root"
cp -R "$project_root/site/." "$dist_root/"
node --input-type=module - "$dist_root" <<'JS'
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const directory=process.argv[2],index=join(directory,'index.html');
let html=readFileSync(index,'utf8');
for(const name of ['styles.css','data.js','schedules.js','app.js']){
  const version=createHash('sha256').update(readFileSync(join(directory,name))).digest('hex').slice(0,12);
  html=html.replaceAll('./'+name+'"','./'+name+'?v='+version+'"');
}
writeFileSync(index,html);
JS
touch "$dist_root/.nojekyll"
echo "Built static site in $dist_root"
