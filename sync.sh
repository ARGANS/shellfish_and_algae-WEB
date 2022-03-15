#!/bin/bash

HOST_WEB="10.27.54.10"
USER="nmaltsev"

# scp -rC "$USER@$HOST_WEB":"/home/$USER/prj" ./
tar --exclude='./.git' --exclude='*.tgz' --exclude='sync.sh' -zc ./ | ssh "$USER@$HOST_WEB" "rm -rf /profils/$USER/prj; mkdir -p /profils/$USER/prj; tar zx -C /profils/$USER/prj"
## z - for gzip
# tar --exclude='./.git' --exclude='*.tgz' -zcvf arch.tgz ./
