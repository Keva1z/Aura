# ---- builder stage ----
# Собираем статику Vite (npm run build -> /app/dist)
FROM node:22-alpine AS builder

WORKDIR /app

# Сначала только манифесты — чтобы слой с зависимостями кэшировался
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Копируем исходники и собираем
COPY . .
RUN npm run build

# ---- runtime stage ----
# Лёгкий nginx, который отдаёт готовую статику
FROM nginx:1.27-alpine AS production

# Свой конфиг вместо дефолтного
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Собранный сайт
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
