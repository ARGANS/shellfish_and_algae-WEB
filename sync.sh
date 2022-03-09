#!/bin/bash
HOST_WEB="10.27.54.10"
USER="nmaltsev"

# scp -rC "$USER@$HOST_WEB":"/home/$USER/prj" ./
tar --exclude='./.git' --exclude='*.tgz' -zc ./ | ssh "$USER@$HOST_WEB" "mkdir -p /home/$USER/prj; tar zx -C /home/$USER/prj"
# z - for gzip

tar --exclude='./.git' --exclude='*.tgz' -zcvf arch.tgz ./