#!/usr/bin/env bash

if ! command -v node &> /dev/null; then
    curl "https://nodejs.org/dist/v14.15.5/node-v14.15.5.pkg" > "$HOME/Downloads/node.pkg" && sudo installer -store -pkg "$HOME/Downloads/node.pkg" -target "/"
fi

RAW=https://raw.githubusercontent.com/loic-roux-404/sound-dl/master
curl -fSsL ${RAW}/package.json > /tmp/package-install-sound-dl.json

exe=~/.sound-dl/src/sc

function install {
    if [ ! -d  ~/.sound-dl ];then
        mkdir -p ~/.sound-dl/src
        sudo chown -R $USER ~/.sound-dl
    fi

    cd ~/.sound-dl/
    cp -f /tmp/package-install-sound-dl.json ~/.sound-dl/package.json
    npm i
    # Update
    curl -fSsL ${RAW}/src/sc.js > ${exe}
    chmod +x ${exe}
}

if [ ! -f ${exe} ]; then
    install
    exit 0
fi

latest=$(cat /tmp/package-install-sound-dl.json | grep version | awk '{print $2}' | tr -d ',' | tr -d '"')
current=$(/usr/local/bin/node ${exe} -v)

# First install process
if [ "$current" != "$latest" ]; then
    install
fi

# clean
rm -rf /tmp/package-install-sound-dl.json
