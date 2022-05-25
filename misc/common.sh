#!/bin/sh 

# [dev]elopment/[prod]uction/[int]ermediate
COMPOSE_CMD="${DC_PATH:-docker-compose}"

function get_env_path {
	local STAGE
	if [[ "$1" == 'dev' ]]; then
		STAGE='dev'
	else 
		STAGE='prod'
	fi

	echo "$DIR/misc/$STAGE.env"
}

function docker_up {
	sh -c "${COMPOSE_CMD} $1 --env-file=$2 down --remove-orphans"
	sh -c "${COMPOSE_CMD} $1 --env-file=$2 up --build -d"
}

function docker_ps {
	sh -c "${COMPOSE_CMD} $1 --env-file=$2 ps"	
}

function docker_logs {
	sh -c "${COMPOSE_CMD} $1 --env-file=$2 logs -f"
}

function docker_down {
	# `-v` removes all volumes attached
	sh -c "${COMPOSE_CMD} $1 --env-file=$2 down --remove-orphans -v"
}

function compose_config {
	bash -c "${COMPOSE_CMD} $1 --env-file=$2 config"
}

function connect {
	local LIST=$(docker ps -f status=running --format '{{.Names}}')
	local i=1
	for N in $LIST; do
		echo "$i. $N"
		let 'i=i+1' 
	done
	read -p "Enter the number: " linenumber  
	echo $linenumber
	i=1
	for container_name in $LIST; do
		if [[ "$i" == "$linenumber" ]]; then
			break
		fi
		let 'i=i+1' 
	done

	echo "Attaching to the container $container_name"
	docker exec -it $container_name sh
}
