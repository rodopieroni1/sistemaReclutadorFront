# Etapa 1: build
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -- --configuration production

# Etapa 2: nginx
FROM nginx:alpine

# 👇 Copiar config de nginx (CLAVE)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 👇 Copiar SOLO el build de Angular
COPY --from=build /app/dist/proyecto-reclutador/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]