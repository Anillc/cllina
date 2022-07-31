#!/usr/bin/env bash
set -e

export SECRETS=${SECRETS:-$PWD/secrets.json}
export BOT_PATH=$(dirname $(realpath "$0"))
export NODE_PATH=$BOT_PATH/node_modules

$BOT_PATH/node_modules/.bin/koishi start $BOT_PATH/koishi.ts \
  -- -r ts-node/register/transpile-only --experimental-vm-modules