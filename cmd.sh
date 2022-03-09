#!/bin/bash

IMAGE_SUPERVISOR='ac/supervisor-app'
IMAGE_PROXY='ac/proxy-app'
PROXY_CONTAINER='ac_proxy'
HTTP_PORT=18000
HTTPS_PORT=4443

function build {
    docker build \
        --build-arg WITH_UTILS=true \
		-t $IMAGE_PROXY:1 \
		-t $IMAGE_PROXY:latest \
		-f ./proxy/main.Dockerfile \
		./

}
	
function deploy {
    local container_id=$( docker ps -q -f name=$PROXY_CONTAINER )

    if [[ ! -z "$container_id" ]]; then
        docker stop "$PROXY_CONTAINER"
    fi

   	docker run -dit --rm \
		-p $HTTP_PORT:80 \
		-p $HTTPS_PORT:443 \
		--name $PROXY_CONTAINER \
		$IMAGE_PROXY:latest
}


function run {
    local command="$1"

    case $command in
        'build')
            build
            ;;
        'deploy')
            deploy
            ;;
        *)
            echo 'todo help';;
    esac
}

run "$1"
