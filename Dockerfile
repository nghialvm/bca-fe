FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --force
COPY . .
RUN NODE_OPTIONS="--max-old-space-size=8192" npm run build 

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80