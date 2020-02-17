#!/bin/bash
eksctl create cluster \
--name udagram-c3-k8s \
--version 1.14 \
--region us-west-2 \
--nodegroup-name standard-workers \
--node-type t3.medium \
--nodes 2 \
--nodes-min 1 \
--nodes-max 3 \
--ssh-access \
--ssh-public-key ~/.ssh/id_rsa.pub \
--managed
