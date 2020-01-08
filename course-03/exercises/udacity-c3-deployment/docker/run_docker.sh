#!/usr/bin/zsh
#docker run -p 80:80 --name reverseproxy \
#--rm stonexjr/nginx:alphine

# build multiple docker images
docker-compose -f docker-compose-build.yaml build --parallel
# push multiple docker images
docker-compose -f docker-compose-build.yaml push
#launch multiple containers
docker-compose -f docker-compose.yaml up