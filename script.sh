#!/usr/bin/env sh
set -e

case $1 in
    postinstall)
        if [ ! -d "bin" ]; then
            mkdir -p bin
            cd bin
            wget -O dhall.tar.bz2 https://github.com/dhall-lang/dhall-haskell/releases/download/1.41.1/dhall-json-1.7.10-x86_64-linux.tar.bz2
            tar xf dhall.tar.bz2
        fi
        ;;
    start)
        ./bin/bin/dhall-to-yaml --file koishi.dhall > koishi.yml
        yarn koishi start -- -r ts-node/register/transpile-only --experimental-vm-modules --enable-source-maps
        ;;
    *)
        echo unknown command
esac