FROM nginx:alpine

COPY nginx /etc/nginx

COPY dist /sites/smartpass.app/public
