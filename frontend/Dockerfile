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
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
