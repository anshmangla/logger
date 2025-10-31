FROM node:20-alpine as build
WORKDIR /app
# Copy only frontend directory since Render builds from repo root
COPY frontend /app
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
