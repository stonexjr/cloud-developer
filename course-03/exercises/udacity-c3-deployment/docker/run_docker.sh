#!/usr/bin/zsh
docker run -p 80:80 --name reverseproxy \
--rm stonexjr/nginx:alphine