#!/bin/bash

HOST_WEB="10.27.54.10"
USER="nmaltsev"

tar --exclude='./.git' --exclude='*.tgz' --exclude='sync.sh' -zc ./ | ssh "$USER@$HOST_WEB" "rm -rf /profils/$USER/prj; mkdir -p /profils/$USER/prj; tar zx -C /profils/$USER/prj"
