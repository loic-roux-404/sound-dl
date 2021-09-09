#!/usr/bin/env bash

function docker-osx {

    local OSX_V=$1

    docker run -it \
        --device /dev/kvm \
        -p 50922:10022 \
        -v /tmp/.X11-unix:/tmp/.X11-unix \
        -e "DISPLAY=${DISPLAY:-:1.1}" \
        sickcodes/docker-osx:${OSX_V}
}

# Infos :
# username is user
# passsword is alpine

# Cataline pre installed
docker-osx ${1:-auto}
