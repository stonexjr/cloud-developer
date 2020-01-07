FROM beevelop/ionic AS ionic

WORKDIR /usr/src/app
#add dependency
COPY package*.json ./
RUN npm ci
#copy app source
COPY . .
RUN ionic build

## launch frontend
FROM nginx:alpine
COPY --from=ionic /usr/src/app/www /usr/share/nginx/html

# docker build -t stonexjr/udacity-c3-frontend .
# docker run -p 8080:8080 --name feed stonexjr/udacity-c3-frontend