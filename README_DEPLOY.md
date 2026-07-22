# 📚 Documentación de Deploy - Índice

## 🎯 Documentos Disponibles

### 1. [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) ⚡ **EMPIEZA AQUÍ**
**Checklist rápido para deploy (5 minutos)**

- Variables de entorno necesarias
- Configuración en Coolify
- Verificación post-deploy
- Pasos críticos después del primer deploy

**👉 Úsalo cuando:** Estés listo para hacer el deploy y necesites una guía paso a paso rápida.

---

### 2. [DEPLOY_COOLIFY.md](./DEPLOY_COOLIFY.md) 📖 **GUÍA COMPLETA**
**Documentación exhaustiva del proceso de deploy**

- Explicación detallada de cada paso
- Configuración de servicios
- Troubleshooting común
- Best practices
- Recursos recomendados

**👉 Úsalo cuando:** Necesites entender a fondo cómo funciona el deploy o tengas problemas.

---

### 3. [REVIEW_DEPLOY.md](./REVIEW_DEPLOY.md) 🔍 **ANÁLISIS TÉCNICO**
**Revisión completa de la configuración Docker**

- Arquitectura del sistema
- Análisis de cada Dockerfile
- Verificación de seguridad
- Optimizaciones implementadas
- Troubleshooting avanzado

**👉 Úsalo cuando:** Necesites entender detalles técnicos, hacer optimizaciones o debugging profundo.

---

### 4. [PRODUCTION_COMMANDS.md](./PRODUCTION_COMMANDS.md) 🛠️ **COMANDOS ÚTILES**
**Guía de comandos para administración diaria**

- Monitoreo y logs
- Gestión de base de datos
- Backups
- Queries útiles
- Scripts de automatización

**👉 Úsalo cuando:** Necesites administrar el sistema en producción día a día.

---

## 🚀 Flujo de Deploy Recomendado

```
1. Lee DEPLOY_CHECKLIST.md
   ↓
2. Genera los secrets (JWT, Postgres)
   ↓
3. Sube el código a Git
   ↓
4. Crea el recurso en Coolify
   ↓
5. Configura variables de entorno
   ↓
6. Asigna dominios (app.* y api.*)
   ↓
7. Click en Deploy
   ↓
8. Espera 5-10 minutos
   ↓
9. Verifica con DEPLOY_CHECKLIST.md
   ↓
10. Login y cambiar contraseña admin
   ↓
11. Desactiva RUN_SEED
   ↓
12. ¡Listo! 🎉
```

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Generar secrets
openssl rand -base64 32  # JWT_ACCESS_SECRET
openssl rand -base64 32  # JWT_REFRESH_SECRET
openssl rand -base64 24  # POSTGRES_PASSWORD

# 2. En Coolify:
# - New Resource → Docker Compose
# - Agregar variables de entorno (ver coolify.env.example)
# - Asignar dominios: app.* y api.*
# - Deploy

# 3. Verificar:
curl https://api.tudominio.com/health
# Debe retornar: {"status":"ok",...}

# 4. Login:
# https://app.tudominio.com
# Email: admin@lumono.com
# Password: admin123

# 5. Cambiar contraseña y desactivar RUN_SEED
```

---

## 📋 Archivos de Configuración Clave

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `docker-compose.yml` | Stack completo (4 servicios) | ✅ Listo |
| `apps/api/Dockerfile` | Backend NestJS | ✅ Optimizado |
| `apps/web/Dockerfile` | Frontend Next.js | ✅ Optimizado |
| `apps/api/docker-entrypoint.sh` | Migraciones automáticas | ✅ Listo |
| `.dockerignore` | Optimización de build | ✅ Listo |
| `.env.example` | Variables locales | ✅ Listo |
| `coolify.env.example` | Variables producción | ✅ Listo |

---

## ✅ Checklist de Preparación

Antes de hacer el deploy, verifica:

- [ ] El código está en Git (GitHub/GitLab/Bitbucket)
- [ ] Has leído `DEPLOY_CHECKLIST.md`
- [ ] Generaste secrets fuertes (no usar valores de ejemplo)
- [ ] Tienes acceso a Coolify
- [ ] Los DNS de tus dominios apuntan al servidor
- [ ] Tienes al menos 2 GB RAM en el servidor (recomendado: 4 GB)

---

## 🔐 Variables de Entorno Críticas

```bash
# Secrets (GENERAR NUEVOS, no usar estos)
JWT_ACCESS_SECRET=<32+ caracteres aleatorios>
JWT_REFRESH_SECRET=<32+ caracteres aleatorios>
POSTGRES_PASSWORD=<password fuerte>

# URLs (Coolify las genera automáticamente)
CORS_ORIGIN=${SERVICE_URL_WEB}
NEXT_PUBLIC_API_URL=${SERVICE_URL_API}

# O configurar manualmente:
# CORS_ORIGIN=https://app.tudominio.com
# NEXT_PUBLIC_API_URL=https://api.tudominio.com

# Seed inicial (solo primer deploy)
RUN_SEED=true
```

**⚠️ Ver `coolify.env.example` para la lista completa**

---

## 🐛 Problemas Comunes

| Problema | Solución Rápida | Ver |
|----------|----------------|-----|
| API no inicia | Ver logs del servicio API en Coolify | DEPLOY_COOLIFY.md |
| Frontend no conecta | Verificar `NEXT_PUBLIC_API_URL` y rebuild | DEPLOY_COOLIFY.md |
| Migraciones fallan | Verificar conexión a Postgres | REVIEW_DEPLOY.md |
| Build falla por memoria | Aumentar RAM del servidor | REVIEW_DEPLOY.md |
| CORS errors | Verificar `CORS_ORIGIN` en API | PRODUCTION_COMMANDS.md |

---

## 📊 Servicios del Stack

| Servicio | Imagen | Puerto Interno | Puerto Externo | Healthcheck |
|----------|--------|----------------|----------------|-------------|
| **postgres** | postgres:16-alpine | 5432 | - | ✅ pg_isready |
| **redis** | redis:7-alpine | 6379 | - | ✅ redis-cli ping |
| **api** | Custom (NestJS) | 3001 | api.tudominio.com | ✅ /health |
| **web** | Custom (Next.js) | 3000 | app.tudominio.com | ✅ wget / |

---

## 🎯 URLs Finales

Después del deploy:

- **Frontend:** https://app.tudominio.com
- **API:** https://api.tudominio.com
- **API Docs (Swagger):** https://api.tudominio.com/api
- **Health Check:** https://api.tudominio.com/health

---

## 📈 Recursos del Servidor

| Escenario | RAM | vCPU | Disco |
|-----------|-----|------|-------|
| **Mínimo** | 2 GB | 2 | 20 GB |
| **Recomendado** | 4 GB | 2 | 40 GB |
| **Óptimo** | 8 GB | 4 | 80 GB |

---

## 🔒 Seguridad Post-Deploy

1. ✅ Cambiar contraseña del usuario admin
2. ✅ Desactivar seed (`RUN_SEED=false`)
3. ✅ Verificar que Postgres y Redis no están expuestos públicamente
4. ✅ Configurar backups automáticos
5. ✅ Monitorear logs regularmente

---

## 🛠️ Comandos Rápidos

```bash
# Ver logs del API
docker logs -f <api-container>

# Ver estado de servicios
docker ps

# Backup de base de datos
docker exec <postgres-container> pg_dump -U lumono lumono_inventory > backup.sql

# Health check
curl https://api.tudominio.com/health

# Reiniciar servicio
docker restart <container-name>
```

**👉 Ver más comandos en [PRODUCTION_COMMANDS.md](./PRODUCTION_COMMANDS.md)**

---

## 📞 Troubleshooting

Si algo falla:

1. **Ver logs:** En Coolify → Service → Logs
2. **Verificar health:** `curl https://api.tudominio.com/health`
3. **Revisar documentación:**
   - Errores comunes: `DEPLOY_COOLIFY.md` → Troubleshooting
   - Errores avanzados: `REVIEW_DEPLOY.md` → Troubleshooting Avanzado
4. **Comandos útiles:** `PRODUCTION_COMMANDS.md` → Troubleshooting Rápido
5. **Reiniciar servicio:** En Coolify → Service → Restart

---

## 🎓 Aprender Más

### Sobre el Stack
- **Docker Compose:** [docs.docker.com/compose](https://docs.docker.com/compose/)
- **Coolify:** [coolify.io/docs](https://coolify.io/docs)
- **Next.js Deployment:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **NestJS Production:** [docs.nestjs.com/faq/deployment](https://docs.nestjs.com/faq/deployment)
- **Prisma Migrations:** [prisma.io/docs/concepts/components/prisma-migrate](https://prisma.io/docs/concepts/components/prisma-migrate)

### Sobre el Proyecto
- **Arquitectura:** Ver `CLAUDE.md`
- **Backend:** Ver `apps/api/README.md` (si existe)
- **Frontend:** Ver `apps/web/README.md` (si existe)

---

## ✨ Estado del Proyecto

🟢 **LISTO PARA PRODUCCIÓN**

Todos los archivos Docker están configurados y optimizados. El proyecto puede ser desplegado en Coolify siguiendo los pasos del `DEPLOY_CHECKLIST.md`.

**Tiempo estimado para estar en producción:** 15-20 minutos

---

## 📝 Notas Importantes

1. **Variables de entorno:** Se configuran en Coolify, no en archivos `.env`
2. **Build de Next.js:** Necesita `NEXT_PUBLIC_API_URL` en build time
3. **Migraciones:** Se ejecutan automáticamente en cada deploy del API
4. **Seed:** Solo ejecutar en el primer deploy (`RUN_SEED=true`)
5. **Dominios:** Configurar DNS antes del deploy para que SSL funcione
6. **Backups:** Configurar inmediatamente después del primer deploy

---

## 🚀 ¡Todo Listo!

El proyecto está completamente preparado para producción. Solo necesitas:

1. Leer `DEPLOY_CHECKLIST.md`
2. Seguir los pasos
3. ¡Deploy! 🎉

**Si tienes dudas, consulta los documentos correspondientes. ¡Buena suerte con el deploy!**

---

*Última actualización: Julio 2026*
