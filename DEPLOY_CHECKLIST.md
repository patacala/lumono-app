# 🚀 Checklist Rápido - Deploy en Coolify

## ⚡ Configuración en Coolify (5 minutos)

### 1. Crear Recurso
- **Tipo:** Docker Compose
- **Build Pack:** Docker Compose
- **Base Directory:** `/`
- **Docker Compose Location:** `docker-compose.yml`
- ✅ **Habilitar:** "Copy base directory to deployment directory"

### 2. Variables de Entorno (COPIAR TODAS)

```bash
# PostgreSQL
POSTGRES_USER=lumono
POSTGRES_PASSWORD=<GENERAR_CON_openssl_rand_-base64_24>
POSTGRES_DB=lumono_inventory

# JWT (mínimo 32 caracteres cada uno)
JWT_ACCESS_SECRET=<GENERAR_CON_openssl_rand_-base64_32>
JWT_REFRESH_SECRET=<GENERAR_CON_openssl_rand_-base64_32>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# URLs (Coolify las genera automáticamente)
CORS_ORIGIN=${SERVICE_URL_WEB}
NEXT_PUBLIC_API_URL=${SERVICE_URL_API}

# Opcional
LOG_LEVEL=info
RUN_SEED=true
```

**🔐 Generar secrets en tu terminal:**
```bash
openssl rand -base64 32  # JWT_ACCESS_SECRET
openssl rand -base64 32  # JWT_REFRESH_SECRET
openssl rand -base64 24  # POSTGRES_PASSWORD
```

### 3. Asignar Dominios

| Servicio | Puerto | Dominio | HTTPS |
|----------|--------|---------|-------|
| `web` | 3000 | `app.tudominio.com` | ✅ |
| `api` | 3001 | `api.tudominio.com` | ✅ |
| `postgres` | - | NO ASIGNAR | - |
| `redis` | - | NO ASIGNAR | - |

### 4. Deploy
Click en **Deploy** y esperar 5-10 minutos.

---

## ✅ Verificación Post-Deploy

```bash
# 1. Health del API
curl https://api.tudominio.com/health
# Debe retornar: {"status":"ok",...}

# 2. Frontend carga
curl https://app.tudominio.com
# Debe retornar HTML

# 3. Login en el dashboard
# Email: admin@lumono.com
# Password: admin123
```

---

## ⚠️ CRÍTICO - Después del Primer Deploy

1. **Login con admin@lumono.com / admin123**
2. **Cambiar contraseña inmediatamente**
3. **En Coolify, cambiar variable:**
   ```bash
   RUN_SEED=false
   ```
4. **Redeploy del servicio `api`**

---

## 🐛 Si algo falla...

### API no inicia
```bash
# Ver logs del servicio api en Coolify
# Verificar que postgres esté "healthy" (verde)
# Verificar DATABASE_URL en variables de entorno
```

### Frontend no conecta con API
```bash
# Verificar NEXT_PUBLIC_API_URL apunta a https://api.tudominio.com
# Si lo cambias, debes hacer REBUILD del servicio web
# Verificar CORS_ORIGIN en el API apunta a https://app.tudominio.com
```

### Build falla por memoria
```bash
# En Coolify, aumentar recursos del servidor
# Mínimo: 2 GB RAM, 2 vCPU
# Recomendado: 4 GB RAM, 2 vCPU
```

---

## 📊 Recursos Necesarios

| Configuración | RAM | vCPU | Disco |
|---------------|-----|------|-------|
| Mínimo | 2 GB | 2 | 20 GB |
| Recomendado | 4 GB | 2 | 40 GB |
| Óptimo | 8 GB | 4 | 80 GB |

---

## 📝 URLs Finales

- Frontend: `https://app.tudominio.com`
- API: `https://api.tudominio.com`
- API Docs (Swagger): `https://api.tudominio.com/api`
- Health: `https://api.tudominio.com/health`

---

## 🎯 Siguiente Deploy (Updates)

1. Hacer cambios en tu código
2. `git commit && git push`
3. En Coolify: Click en **Deploy** (o configurar auto-deploy)
4. Las migraciones se ejecutan automáticamente

---

¡Listo! 🎉

**Ver documentación completa:** `DEPLOY_COOLIFY.md`
