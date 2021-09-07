#!/usr/bin/env bash

if ! command -v node &> /dev/null; then
    curl "https://nodejs.org/dist/v14.15.5/node-v14.15.5.pkg" > "$HOME/Downloads/node.pkg" && sudo installer -store -pkg "$HOME/Downloads/node.pkg" -target "/"
fi

if [ ! -f ~/.sound-dl/sc ]; then
    mkdir -p ~/.sound-dl
    cd ~/.sound-dl/

    npm i soundcloud-scraper

    curl -fSsL https://raw.githubusercontent.com/loic-roux-404/sound-dl/master/src/sc.js > sc
    chmod +x sc
fi
