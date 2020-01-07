#!/usr/bin/zsh
docker run -p 8080:8080 --name feed \
--env-file ~/.aws/aws-env.list --rm \
-v ~/.aws:/root/.aws \
stonexjr/udacity-restapi-feed