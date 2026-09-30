#!/usr/bin/env bash
set -euo pipefail
project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
dist_root="$project_root/dist"
rm -rf "$dist_root"
mkdir -p "$dist_root"
cp -R "$project_root/site/." "$dist_root/"
touch "$dist_root/.nojekyll"
echo "Built static site in $dist_root"
