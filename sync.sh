#!/bin/bash

HOST_WEB="10.27.54.10"
USER="${2:-`whoami`}"
DESTINATION_DIR="/profils/$USER/prj"

function action__upload_sources {
    local commands="\
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

function action__copy {
    local destination='/tmp/db_backup'
    mkdir -p $destination
    rm -rf $destination/*
    scp $USER@$HOST_WEB:/profils/$USER/dshbrd_prod.db $destination
}

function action__rebuild {
    local commands="/profils/$USER/docker-compose -f $DESTINATION_DIR/misc/proxy.docker-compose.yml -f $DESTINATION_DIR/misc/prod.dashboard.docker-compose.yml -f $DESTINATION_DIR/misc/prod.site.docker-compose.yml --env-file=$DESTINATION_DIR/misc/sim.env up --build -d acsite"

    ssh "$USER@$HOST_WEB" "$commands"
}

function action__rebuild_world {
    local commands="cd $DESTINATION_DIR; ./manage.sh up prod"

    ssh "$USER@$HOST_WEB" "$commands"
}


function help {
    echo './sync.sh upload'
    echo './sync.sh dump'
    echo './sync.sh copy'
    echo './sync.sh rebuild'
    echo './sync.sh rebuild_worldw'
}

case $1 in
	'upload')
		action__upload_sources;;
	'dump')
		action__dump;;
	'copy')
		action__copy;;
   	'rebuild')
	    action__rebuild;;
    'rebuild_world')
	    action__rebuild_world;;
	*)
	help;;
esac
