#!/usr/bin/env bash
source misc/common.sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" &> /dev/null && pwd )"

function get_dc_flags {
	if [[ "$1" == 'dev' ]]; then
		STAGE='dev'
	else 
		STAGE='prod'
	fi

	echo "-f $DIR/misc/proxy.docker-compose.yml -f $DIR/misc/$STAGE.dashboard.docker-compose.yml -f $DIR/misc/$STAGE.site.docker-compose.yml"
}

function start {
	local ENV_PATH=$(get_env_path $1)
	local DC_FLAG=$(get_dc_flags $1)
	echo "DC_FLAG: $DC_FLAG"

	if [[ "$1" == 'prod' ]]; then
		if [[ ! -f /profils/nmaltsev/dshbrd_prod.db ]]; then
			cp ./dashboard/dshbrd.db ~/dshbrd_prod.db
			echo "DB created"
		fi
	fi

	# if [[ "$1" != 'int' && "$1" != 'dev' ]]; then
	# 	# Verifying the creation of certificate files
	# 	if [[ -f "$PROD_PRIVATE_KEY" && -f "$PROD_PUBLIC_CRT" ]]; then
	# 		cp $PROD_PRIVATE_KEY proxy/certs.prod/private.key
	# 		cp $PROD_PUBLIC_CRT proxy/certs.prod/public.crt
	# 	else
	# 		return 1 2>/dev/null
    #  		exit 1
	# 	fi
	# fi

	docker_up "$DC_FLAG" "$ENV_PATH"
	sleep 5s
	docker_ps "$DC_FLAG" "$ENV_PATH"
	

	# if [[ "$1" == 'int' ]]; then
	# 	docker exec -it nextapp-smos npm run update
	# 	docker exec -it nextapp-smos sh
	# elif [[ "$1" == 'dev' ]]; then
	# 	sleep 5s
	# 	source proxy/tests/test.dev.sh 
	# else 
	# 	sleep 5s
	# 	source proxy/tests/test.prod.sh 
	# fi
}

function logs {
	local ENV_PATH=$(get_env_path $1)
	local DC_FLAG=$(get_dc_flags $1)
	echo "DC_FLAG: $DC_FLAG"
	docker_logs "$DC_FLAG" "$ENV_PATH"
}

function ps {
	local ENV_PATH=$(get_env_path $1)
	local DC_FLAG=$(get_dc_flags $1)
	docker_ps "$DC_FLAG" "$ENV_PATH"
}

function stop {
	local ENV_PATH=$(get_env_path $1)
	local DC_FLAG=$(get_dc_flags $1)
	docker_down "$DC_FLAG" "$ENV_PATH"
}

function config {
	local ENV_PATH=$(get_env_path $1)
	local DC_FLAG=$(get_dc_flags $1)
	compose_config "$DC_FLAG" "$ENV_PATH"
}

function action_export {
	# docker image prune -a

	# network misc_ac_net
	# volume misc_site_out
	# volume misc_site_node_modules
	# volume misc_site_next_dir

	local destination='/home/nmaltsev/Documents/workspace/images'

	for imageName in ac-proxy ac-site ac-dashboard; do
	# do something like: echo $databaseName
		local imageId=$(docker inspect --format='{{.Image}}' $imageName)
		docker save -o $destination/$imageName.tar $imageId
	done
}

function help {
	echo """Commands:
'manage.sh help' - to see this help	
'manage.sh connect [dev|prod]'
'manage.sh config [dev|prod|sim]- to see the dcoker-compose config'
'manage.sh up [dev|prod|sim]' - to start the applications
'manage.sh down [dev|prod]' - to stop the applications
'manage.sh ps [dev|prod]'
'manage.sh logs [dev|prod]'
"""
}

case $1 in
	'up')
		start $2;;
	'help')
		help;;
	'logs')
		logs $2;;
	'ps')
		ps $2;;
	'down')
		stop $2;;
	'connect')
		connect;;
	'config')
		config $2;;
	'export')
		action_export;;
	*)
	help;;
esac

# docker volume rm misc_site_node_modules
