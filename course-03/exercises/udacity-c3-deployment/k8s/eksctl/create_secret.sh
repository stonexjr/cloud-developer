#!/bin/bash
kubectl create secret generic env-secret \
--from-literal=POSTGRESS_USERNAME=_insert_username_here_ \
--from-literal=POSTGRESS_PASSWORD=_insert_password_here_

kubectl apply -f ../aws-secret.yaml

kubectl get secret
