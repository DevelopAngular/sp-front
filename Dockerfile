FROM nginx:alpine

COPY nginx /etc/nginx

COPY dist /sites/smartpass.app/public/app
COPY lavanote-well-known /sites/smartpass.app/public/.well-known/
