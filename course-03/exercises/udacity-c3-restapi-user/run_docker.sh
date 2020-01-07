#!/usr/bin/zsh
docker run -p 8080:8080 --name user \
--env-file ~/.aws/aws-env.list --rm \
-v ~/.aws:/root/.aws \
stonexjr/udacity-restapi-user