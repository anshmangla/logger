FROM node:20-alpine as build
WORKDIR /app
# Copy only package files first to leverage Docker layer cache
COPY frontend/package*.json ./
RUN npm install
# Now copy the rest of the frontend source
COPY frontend .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/inject-config.sh /inject-config.sh
RUN chmod +x /inject-config.sh
EXPOSE 80
CMD ["/inject-config.sh"]
