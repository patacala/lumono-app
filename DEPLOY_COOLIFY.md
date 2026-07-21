# Deploy en Coolify - Checklist Completo

## ✅ Estado de la Configuración

### Archivos Docker (Listos)
- ✅ `docker-compose.yml` - Stack completo con 4 servicios
- ✅ `apps/api/Dockerfile` - Backend NestJS con multi-stage build
- ✅ `apps/web/Dockerfile` - Frontend Next.js standalone
- ✅ `apps/api/docker-entrypoint.sh` - Migraciones automáticas
- ✅ `.dockerignore` - Optimización de contexto
- ✅ `.npmrc` - Configuración NPM

### Variables de Entorno (Revisar antes de deploy)
- ✅ `coolify.env.example` - Template con todas las variables necesarias

---

## 📋 Pasos para Deploy en Coolify

### 1. Crear el Proyecto en Coolify

1. **New Resource → Docker Compose**
2. **Git Repository:**
   - URL de tu repo (GitHub/GitLab/etc)
   - Branch: `main` o la que uses
3. **Build Pack:** Docker Compose
4. **Base Directory:** `/` (raíz del repo)
5. **Docker Compose Location:** `docker-compose.yml`
6. **✅ IMPORTANTE:** Habilitar "Copy base directory to deployment directory"

### 2. Configurar Variables de Entorno

En Coolify, ir a **Environment Variables** y configurar:

```bash
# --- PostgreSQL ---
POSTGRES_USER=lumono
POSTGRES_PASSWORD=<GENERAR_PASSWORD_FUERTE>
POSTGRES_DB=lumono_inventory

# --- JWT Secrets (mínimo 32 caracteres cada uno) ---
JWT_ACCESS_SECRET=<GENERAR_SECRET_ALEATORIO_32_CHARS>
JWT_REFRESH_SECRET=<GENERAR_SECRET_ALEATORIO_32_CHARS>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# --- URLs Públicas ---
# Coolify tiene variables mágicas automáticas:
CORS_ORIGIN=${SERVICE_URL_WEB}
NEXT_PUBLIC_API_URL=${SERVICE_URL_API}

# O configurar manualmente:
# CORS_ORIGIN=https://app.tudominio.com
# NEXT_PUBLIC_API_URL=https://api.tudominio.com

# --- Opcionales ---
LOG_LEVEL=info
RUN_SEED=true  # Solo en el primer deploy, luego cambiar a false
```

**🔐 Generar secrets seguros:**
```bash
# En tu terminal local:
openssl rand -base64 32  # Para JWT_ACCESS_SECRET
openssl rand -base64 32  # Para JWT_REFRESH_SECRET
openssl rand -base64 24  # Para POSTGRES_PASSWORD
```

### 3. Asignar Dominios

En Coolify, cada servicio necesita su dominio:

1. **Servicio `web` (Frontend):**
   - Puerto: 3000
   - Dominio: `app.tudominio.com`
   - ✅ Enable HTTPS

2. **Servicio `api` (Backend):**
   - Puerto: 3001
   - Dominio: `api.tudominio.com`
   - ✅ Enable HTTPS

3. **Servicios `postgres` y `redis`:**
   - NO necesitan dominios (solo internos)

### 4. Primer Deploy

1. Click en **Deploy**
2. Monitorear los logs:
   - `postgres`: debe estar healthy
   - `redis`: debe estar healthy
   - `api`: ejecutará migraciones y seed
   - `web`: build de Next.js

**⏱️ Tiempo estimado:** 5-10 minutos

### 5. Verificación Post-Deploy

Verificar que todo funciona:

```bash
# Health checks
curl https://api.tudominio.com/health
# Debe retornar: {"status":"ok","info":{"database":{"status":"up"},...}}

# Frontend
curl https://app.tudominio.com
# Debe retornar HTML de Next.js

# Login en el frontend con usuario seed:
# Email: admin@lumono.com
# Password: admin123
```

---

## 🔧 Configuración Actual

### docker-compose.yml

**Servicios:**
1. **postgres** (PostgreSQL 16)
   - Puerto: 5432 (interno)
   - Volume: `postgres_data`
   - Healthcheck: ✅

2. **redis** (Redis 7)
   - Puerto: 6379 (interno)
   - Volume: `redis_data`
   - Healthcheck: ✅

3. **api** (NestJS)
   - Puerto: 3001
   - Depends on: postgres, redis
   - Build context: `.`
   - Dockerfile: `apps/api/Dockerfile`
   - Healthcheck: `/health` endpoint
   - Entrypoint: ejecuta migraciones automáticas

4. **web** (Next.js)
   - Puerto: 3000
   - Depends on: api
   - Build context: `.`
   - Dockerfile: `apps/web/Dockerfile`
   - Output: standalone (optimizado)

### Dockerfiles

**apps/api/Dockerfile:**
- Multi-stage: base → deps → builder → runner
- Prisma client generation en build
- Migraciones automáticas en startup
- User no-root: `nestjs:nodejs` (UID 1001)
- Healthcheck: wget al endpoint `/health`

**apps/web/Dockerfile:**
- Multi-stage: base → deps → builder → runner
- Next.js standalone output
- Build con ARG `NEXT_PUBLIC_API_URL`
- User no-root: `nextjs:nodejs` (UID 1001)
- Healthcheck: wget a la raíz

### docker-entrypoint.sh (API)

Ejecuta automáticamente al iniciar el contenedor:
1. Si existen migraciones: `prisma migrate deploy`
2. Si no hay migraciones: `prisma db push --skip-generate`
3. Si `RUN_SEED=true`: ejecuta seed
4. Inicia la app

---

## ⚠️ Puntos Importantes

### 1. Variables Mágicas de Coolify

Coolify v4 genera automáticamente:
- `${SERVICE_URL_WEB}` → URL pública del servicio web
- `${SERVICE_URL_API}` → URL pública del servicio api
- `${SERVICE_PASSWORD_POSTGRES}` → Password autogenerado (opcional)

**Úsalas en las variables de entorno:**
```bash
CORS_ORIGIN=${SERVICE_URL_WEB}
NEXT_PUBLIC_API_URL=${SERVICE_URL_API}
```

### 2. Build de Next.js

El `NEXT_PUBLIC_API_URL` debe estar disponible en **BUILD TIME**, no solo en runtime.

En `docker-compose.yml` ya está configurado:
```yaml
web:
  build:
    args:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
```

### 3. Seed Inicial

- En el primer deploy: `RUN_SEED=true`
- Después del primer deploy: cambiar a `RUN_SEED=false`
- Usuario creado: `admin@lumono.com` / `admin123`
- **⚠️ CAMBIAR LA CONTRASEÑA INMEDIATAMENTE DESPUÉS DEL PRIMER LOGIN**

### 4. Persistencia de Datos

Los volumes `postgres_data` y `redis_data` persisten entre deploys.
- Los datos NO se pierden al hacer redeploy
- Para reset completo: eliminar volumes en Coolify

### 5. Migraciones

Las migraciones se ejecutan automáticamente en cada deploy del servicio `api`:
- Si hay carpeta `prisma/migrations`: ejecuta `prisma migrate deploy`
- Si no hay migraciones: ejecuta `prisma db push`

### 6. CORS

El backend tiene configurado CORS dinámico:
- Variable `CORS_ORIGIN` debe apuntar a la URL del frontend
- En producción: `https://app.tudominio.com`

---

## 🐛 Troubleshooting

### API no conecta con la base de datos

**Síntoma:** Logs del API muestran error de conexión a Postgres

**Solución:**
1. Verificar que el servicio `postgres` está healthy
2. Verificar `DATABASE_URL` en variables de entorno
3. El host debe ser `postgres` (nombre del servicio en Docker Compose)

### Frontend no conecta con API

**Síntoma:** Errores de red en el navegador, "Failed to fetch"

**Solución:**
1. Verificar `NEXT_PUBLIC_API_URL` en variables de entorno
2. Debe ser la URL pública: `https://api.tudominio.com`
3. Verificar CORS en el backend (`CORS_ORIGIN`)
4. **IMPORTANTE:** Si cambias `NEXT_PUBLIC_API_URL`, debes hacer **rebuild** del frontend

### Migraciones fallan

**Síntoma:** API no inicia, logs muestran error de Prisma

**Solución:**
1. Verificar que Postgres está corriendo y healthy
2. Verificar `DATABASE_URL`
3. Si es necesario, hacer reset de la BD (⚠️ perderás datos):
   ```bash
   # En Coolify, en el servicio postgres:
   docker exec -it <postgres-container> psql -U lumono -d lumono_inventory -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
   # Luego redeploy del API
   ```

### Build falla por memoria

**Síntoma:** Build de Docker falla con "out of memory"

**Solución:**
1. En Coolify, aumentar los recursos del proyecto
2. Verificar que no hay procesos zombies consumiendo RAM
3. Limpiar caché de Docker: `docker builder prune -a`

---

## 📊 Recursos Recomendados

Para el stack completo (Postgres + Redis + API + Web):

- **Mínimo:** 2 GB RAM, 2 vCPU, 20 GB disco
- **Recomendado:** 4 GB RAM, 2 vCPU, 40 GB disco
- **Óptimo:** 8 GB RAM, 4 vCPU, 80 GB disco

### Distribución aproximada:
- Postgres: 512 MB - 1 GB RAM
- Redis: 128 MB - 256 MB RAM
- API (NestJS): 512 MB - 1 GB RAM
- Web (Next.js): 512 MB - 1 GB RAM

---

## 🚀 Después del Deploy

### 1. Cambiar contraseña admin

Primer login con:
- Email: `admin@lumono.com`
- Password: `admin123`

**Inmediatamente cambiar la contraseña en el perfil.**

### 2. Deshabilitar seed

En variables de entorno, cambiar:
```bash
RUN_SEED=false
```

Y redeploy el servicio `api`.

### 3. Crear usuarios adicionales

Usar el módulo de usuarios en el dashboard para crear más usuarios.

### 4. Backup de base de datos

Configurar backups automáticos de Postgres en Coolify o usar un cronjob:
```bash
# Backup manual
docker exec <postgres-container> pg_dump -U lumono lumono_inventory > backup.sql
```

### 5. Monitoreo

- Healthchecks están configurados para todos los servicios
- Coolify mostrará el estado en el dashboard
- Configurar alertas en Coolify si es necesario

---

## 📝 Checklist Final

Antes de hacer el deploy, verificar:

- [ ] Repo subido a Git (GitHub/GitLab/Bitbucket)
- [ ] Generar secrets JWT y password Postgres
- [ ] Configurar todas las variables de entorno en Coolify
- [ ] Asignar dominios a los servicios `web` y `api`
- [ ] Verificar que los DNS apuntan al servidor Coolify
- [ ] Hacer el primer deploy
- [ ] Verificar healthchecks (todos green)
- [ ] Login en el frontend
- [ ] Cambiar contraseña admin
- [ ] Deshabilitar seed (`RUN_SEED=false`)
- [ ] Configurar backups

---

## 🎯 URLs Finales

Después del deploy, tendrás:

- **Frontend:** https://app.tudominio.com
- **API:** https://api.tudominio.com
- **API Docs:** https://api.tudominio.com/api (Swagger)
- **Health:** https://api.tudominio.com/health

---

## 💡 Tips Adicionales

1. **Logs en tiempo real:** En Coolify, cada servicio tiene su pestaña de logs
2. **Reiniciar un servicio:** En Coolify, click en el servicio → Restart
3. **Ejecutar comandos en un contenedor:** Usar la terminal de Coolify
4. **Actualizar código:** Push a tu repo → Deploy en Coolify (manual o automático)
5. **Rollback:** Coolify guarda histórico de deploys, puedes volver atrás

---

¡Listo para producción! 🚀
