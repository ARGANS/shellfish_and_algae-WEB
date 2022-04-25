ssh nmaltsev@10.27.54.10 -f 'ls -al'
docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}\t{{.Size}}'

To remove all images which are not used by existing containers, use the -a flag:
    docker image prune -a
docker system prune -af
One liner to stop / remove all of Docker containers:
    docker stop $(docker ps -aq)
    docker rm $(docker ps -aq)
    docker rm -fv $(docker ps -aq)

docker ps -aq --format '\t{{.Tag}}'
