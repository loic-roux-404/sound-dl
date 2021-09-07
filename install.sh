#!/usr/bin/env bash
mkdir -p ~/.sound-dl
cd ~/.sound-dl/

npm i soundcloud-scraper

curl -fSsL https://raw.githubusercontent.com/loic-roux-404/sound-dl/master/src/sc.js > sc
chmod +x sc

ln -sf $(pwd)/sc /usr/local/bin/sc
