#!/bin/bash
docker run --rm -it -d \
-p 8080:8080 \
--name reverseproxy \
stonexjr/reverseproxy

