#!/usr/bin/env bash
source misc/common.sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" &> /dev/null && pwd )"
MAIN_DC_PATH="$DIR/misc/docker-compose.yml"
DC_FLAG="-f $MAIN_DC_PATH"

function start {
	local ENV_PATH=$(get_env_path $1)

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
	docker_logs "$DC_FLAG" "$ENV_PATH"
}

function ps {
	local ENV_PATH=$(get_env_path $1)
	docker_ps "$DC_FLAG" "$ENV_PATH"
}

function stop {
	local ENV_PATH=$(get_env_path $1)
	docker_down "$DC_FLAG" "$ENV_PATH"
}

function config {
	bash -c "docker-compose $DC_FLAG --env-file=$ENV_PATH config"
}

function help {
	echo """Commands:
'manage.sh help' - to see this help	
'manage.sh connect'
'manage.sh up [dev|prod|int]' - to start the applications
'manage.sh down [dev|prod|int]' - to stop the applications
'manage.sh ps [dev|prod|int]'
'manage.sh logs [dev|prod|int]'
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
	*)
	help;;
esac
