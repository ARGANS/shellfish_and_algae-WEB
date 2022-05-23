#!/bin/bash

HOST_WEB="10.27.54.10"
USER="${1:-`whoami`}"
DESTINATION_DIR="/profils/$USER/prj"
commands="\
rm -rf $DESTINATION_DIR;\
mkdir -p $DESTINATION_DIR;\
tar zx -C $DESTINATION_DIR\
"

tar --exclude='./.git' --exclude='*.tgz' --exclude='sync.sh' -zc ./ | ssh "$USER@$HOST_WEB" "$commands"
