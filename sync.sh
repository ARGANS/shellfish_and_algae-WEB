#!/bin/bash

HOST_WEB="10.27.54.10"
USER="${2:-`whoami`}"
DESTINATION_DIR="/profils/$USER/prj"

function action__upload_sources {
    commands="\
rm -rf $DESTINATION_DIR;\
mkdir -p $DESTINATION_DIR;\
tar zx -C $DESTINATION_DIR\
"
    tar --exclude='./.git' --exclude='*.tgz' --exclude='sync.sh' -zc ./ | ssh "$USER@$HOST_WEB" "$commands"
}

function action__dump {
    local destination='/tmp/db_backup'
    mkdir -p $destination
    rm -rf $destination/*
    scp $USER@$HOST_WEB:/profils/$USER/dshbrd_prod.db $destination
    sqlite3 $destination/dshbrd_prod.db .dump > ./dshbrd_prod.dump.sql
    sqlite3 $destination/dshbrd_prod.db .schema > ./dshbrd_prod.schema.sql
}

function help {
    echo './sync.sh upload'
    echo './sync.sh dump'
}

case $1 in
	'upload')
		action__upload_sources;;
	'dump')
		action__dump;;
	*)
	help;;
esac
