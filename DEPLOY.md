# Деплой Aura на сервер рядом с Shift-Hub

Aura — статический сайт. На сервере уже крутится Shift-Hub, и его **edge-nginx
владеет портами 80/443**. Два процесса не могут слушать один порт, поэтому Aura
не поднимает свой 80/443 — её отдаёт тот же edge-nginx, маршрутизируя по домену
(`server_name`). Aura живёт отдельным контейнером, а edge-nginx дотягивается до
неё по общей docker-сети `web`.

```
                    Cloudflare (proxy, HTTPS)
                              │
                    server :80 / :443
                              │
                ┌─────────────────────────┐
                │  edge-nginx (Shift-Hub)  │   ← маршрут по домену
                └─────────────────────────┘
              shifthub.hopto.org │   │ aura-models.org
                 app_network ────┘   └──── web (общая сеть)
                       │                       │
              ┌────────────────┐        ┌────────────┐
              │ shifthub_front │        │   aura     │  (этот репозиторий)
              │ + backend/db…  │        │  (nginx)   │
              └────────────────┘        └────────────┘
```

## Файлы в этом репозитории

| Файл | Назначение |
|------|-----------|
| `Dockerfile` | Сборка: `node` собирает Vite → `nginx` отдаёт статику |
| `nginx.conf` | nginx **внутри** контейнера Aura (gzip, кэш, отдача файлов) |
| `docker-compose.yml` | Сервис `aura` в внешней сети `web`, без портов на хост |
| `deploy/aura-models.org.conf` | vhost для **edge-nginx** (копируется в Shift-Hub) |
| `.dockerignore` | Что не тащить в build-контекст |

---

## 1. Cloudflare: DNS + SSL

### 1.1 DNS-записи (вкладка **DNS → Records**)
| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `aura-models.org` | `<публичный IP сервера>` | **Proxied** (оранжевое облако) |
| CNAME | `www` | `aura-models.org` | **Proxied** |

### 1.2 SSL/TLS режим (вкладка **SSL/TLS → Overview**)
Выбрать **Full (strict)**.
- ❌ **Flexible** — НЕЛЬЗЯ: origin редиректит 80→443, а CF шлёт HTTP → бесконечный
  редирект-луп.
- ✅ **Full (strict)** — CF ↔ origin по HTTPS с доверенным сертификатом.

> Режим задаётся для зоны (домена) `aura-models.org` и **не влияет** на Shift-Hub —
> это другой домен/зона.

### 1.3 Origin-сертификат (вкладка **SSL/TLS → Origin Server → Create Certificate**)
1. Hostnames: `aura-models.org`, `*.aura-models.org`. Срок — 15 лет.
2. Скачать два блока: **Origin Certificate** и **Private Key** (формат PEM).
3. На сервере положить их в Shift-Hub (эта папка монтируется в edge-nginx как
   `/etc/letsencrypt`):
   ```bash
   mkdir -p ~/Shift-Hub/nginx/ssl/aura-models.org
   nano ~/Shift-Hub/nginx/ssl/aura-models.org/origin.pem   # вставить Origin Certificate
   nano ~/Shift-Hub/nginx/ssl/aura-models.org/origin.key   # вставить Private Key
   chmod 600 ~/Shift-Hub/nginx/ssl/aura-models.org/origin.key
   ```

> Origin-сертификат доверяется **только Cloudflare**, поэтому домен обязан идти
> через CF (оранжевое облако). Хотите когда-нибудь убрать CF — берите Let's Encrypt.

(Опционально в CF: **Always Use HTTPS = On**, **HSTS = On**.)

---

## 2. Edge-nginx (Shift-Hub): сеть + vhost

### 2.1 Общая сеть (один раз на сервере)
```bash
docker network create web
```

### 2.2 Подключить edge-nginx к сети `web`
В `~/Shift-Hub/docker-compose.yml`, в сервисе **nginx**, добавить `web` в networks
и объявить сеть как external:

```yaml
  nginx:
    # ...
    networks:
      - app_network
      - web          # ← добавить

# внизу файла, в секции networks:
networks:
  app_network:
    # ... как было ...
  web:               # ← добавить
    external: true
```

### 2.3 Положить vhost
```bash
cp ~/Aura/deploy/aura-models.org.conf ~/Shift-Hub/nginx/conf.d/aura-models.org.conf
```

### 2.4 Пересоздать edge-nginx (чтобы он зашёл в сеть web и подхватил конфиг)
```bash
cd ~/Shift-Hub
docker compose --profile prod up -d nginx
docker compose exec nginx nginx -t        # проверить конфиг
```

---

## 3. Запуск Aura
```bash
cd ~/Aura
docker compose up -d --build              # собрать образ и поднять контейнер `aura`
```
Edge-nginx теперь резолвит имя `aura` в сети `web` и проксирует на него.
Перечитать конфиг nginx (если ещё не пересоздавали):
```bash
cd ~/Shift-Hub && docker compose exec nginx nginx -s reload
```

Проверить:
```bash
curl -I https://aura-models.org          # должен прийти 200
```

---

## 4. Обновление сайта

**Поменяли текст/код** (`src/...`, `data/content.js`):
```bash
cd ~/Aura && git pull && docker compose up -d --build
```

**Добавили фото моделей** — положить файлы в `public/images/models/`
(`model-1.jpg … model-6.jpg`) и так же пересобрать (`up -d --build`).
Фото запекаются в образ на этапе сборки.

> Если не хотите класть фото в git и пересобирать ради картинок — можно
> примонтировать том вместо запекания: добавить в `docker-compose.yml` сервису
> `aura` строку `volumes: ["./photos:/usr/share/nginx/html/images/models:ro"]`
> и складывать фото в `~/Aura/photos` на сервере.

После деплоя, если меняли картинки/ассеты, можно сбросить кэш CF:
**Cloudflare → Caching → Purge Everything**.

---

## 5. Траблшутинг

| Симптом | Причина / решение |
|---------|-------------------|
| `502 Bad Gateway` | Контейнер `aura` не запущен или не в сети `web`. `docker ps`, `docker network inspect web` (должны быть и `aura`, и `shifthub_nginx`). |
| `host not found in upstream "aura"` при `nginx -t` | edge-nginx не в сети `web` → выполнить шаг 2.2 и пересоздать nginx. |
| Бесконечный редирект | В CF стоит **Flexible**. Поставить **Full (strict)**. |
| `525 / 526` от Cloudflare | Origin-сертификат отсутствует/битый или путь в vhost не совпадает. Проверить файлы в `nginx/ssl/aura-models.org/`. |
| Старый контент после деплоя | Кэш CF — **Purge Everything**; `index.html` уже отдаётся с no-cache. |

### Полезные команды
```bash
docker compose logs -f aura                      # логи Aura (из ~/Aura)
cd ~/Shift-Hub && docker compose logs -f nginx   # логи edge-nginx
docker network inspect web                        # кто в общей сети
```
