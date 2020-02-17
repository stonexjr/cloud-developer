#!/bin/bash
docker run --rm -it -d \
--env-file ./.env.list \
--name backend-user \
stonexjr/udacity-restapi-user 

docker run --rm -it -d \
--env-file ./.env.list \
--name backend-feed \
stonexjr/udacity-restapi-feed

docker run --rm -it -d \
--name frontend \
stonexjr/udacity-frontend
