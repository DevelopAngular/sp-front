#!/usr/bin/env bash
set -e


if [[ -f 'src/build-info.ts' ]]; then
  echo 'Could not find src/build-info.ts'
  echo 'You may be in the wrong directory'
  exit 1
fi

release_name=$(sentry-cli releases propose-version)
build_date=$(date)

cat > src/build-info.ts <<EOF

export const RELEASE_NAME = '${release_name}';
export const BUILD_DATE = '${build_date}';


EOF

echo '$ cat src/build-info.ts'
cat src/build-info.ts
echo ''
