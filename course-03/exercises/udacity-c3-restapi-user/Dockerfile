FROM node:12

WORKDIR /usr/src/app
#add dependency
COPY package*.json ./
RUN npm ci
#copy app source
COPY . .
EXPOSE 8080
CMD ["npm", "run", "prod"]

# docker build -t stonexjr/udacity-c3-restapi-user .
# docker run -p 8080:8080 --name user stonexjr/udacity-c3-restapi-user