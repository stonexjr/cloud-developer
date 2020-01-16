# cloud-developer
content for Udacity's cloud developer nanodegree

## 1. Setup Docker Environment
You'll need to install docker https://docs.docker.com/install/. Open a new terminal within the project directory and run:

1. Build the images: `docker-compose -f course-03/exercises/udacity-c3-deployment/docker-compose-build.yaml build --parallel`
2. Push the images: `docker-compose -f course-03/exercises/udacity-c3-deployment/docker-compose-build.yaml push`
3. Run the container: `docker-compose -f course-03/exercises/udacity-c3-deployment/docker-compose-build.yaml up`


## 2. Deployment
### Prerequisite: provision AWS EKS clusters
2.1 Install eksctl from [here](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html)  
2.2 Create configmap env-config and secret env-secret and aws-secret.  
There are many environment variables are referenced from inside *-deployment.yaml files.
You must create `env-config` configmap and `env-secret` secret for your kubectl.
Please follow the official instructions on [how to create configmap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/) 
and [how to create secret](https://kubernetes.io/docs/concepts/configuration/secret/). For quick start, 
See [here](https://kubernetes.io/docs/concepts/configuration/secret/#creating-a-secret-manually) for how to prepare 
secret yaml file.
```bash
kubectl create configmap env-config --from-env-file=/path/to/.env.list
kubectl apply -f /path/to/env-secret.yaml
kubectl apply -f /path/to/aws-secret.yaml
```
Note that each row in `.env.list` is a key=value pair.   

2.2 Run the helper script  
`$> course-03/exercises/udacity-c3-deployment/k8s/create_cluster.sh`

### 3. Launch k8s deployment and service
3.1 Prerequisite: install kubectl from [here](https://kubernetes.io/docs/tasks/tools/install-kubectl/)  
3.2 Deployment backend,frontend and reverseproxy services
```bash
cd course-03/exercises/udacity-c3-deployment/k8s
kubectl -f apply backend-feed-deployment.yaml
kubectl -f apply backend-user-deployment.yaml
kubectl -f apply frontend-deployment.yaml
kubectl -f apply reverseproxy-deployment.yaml
```
3.3 Deploy services for the above deployments
```bash
kubectl -f apply backend-feed-service.yaml
kubectl -f apply backend-user-service.yaml
kubectl -f apply frontend-service.yaml
kubectl -f apply reverseproxy-deployment.yaml
```
or simply run `deploy_to_cluster.sh` script in folder `course-03/exercises/udacity-c3-deployment/k8s`  
Without deploy the services, the reverseproxy cannot resolve the hostname `backend-user` and `backend-feed` in the `nginx.conf` file

3.4 port-forward
```bash
k port-forward service/frontend 8100 8100
k port-forward service/reverseproxy 8080 8080
```


