#!/bin/bash
docker service create \
--env-file .env.list \
--name backend-user \
-p 8080:8080 \
stonexjr/udacity-restapi-user
