# 🛠️ Comandos Útiles - Producción en Coolify

## 🔍 Monitoreo y Logs

### Ver logs en tiempo real
```bash
# Ver logs de un servicio específico
# En Coolify UI: Service → Logs tab

# O en terminal del servidor:
docker logs -f <container-name>

# Ver logs de los últimos 100 líneas
docker logs --tail 100 <container-name>

# Ver logs con timestamp
docker logs -f --timestamps <container-name>

# Ver solo errores
docker logs <container-name> 2>&1 | grep -i error
```

### Estado de contenedores
```bash
# Ver todos los contenedores
docker ps

# Ver recursos (CPU, RAM)
docker stats

# Ver estado de salud
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 🗄️ Base de Datos

### Acceder a Postgres
```bash
# Terminal interactivo
docker exec -it <postgres-container> psql -U lumono -d lumono_inventory

# Ejecutar query directamente
docker exec -it <postgres-container> psql -U lumono -d lumono_inventory -c "SELECT COUNT(*) FROM products;"
```

### Backup de base de datos
```bash
# Crear backup
docker exec <postgres-container> pg_dump -U lumono lumono_inventory > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup comprimido
docker exec <postgres-container> pg_dump -U lumono lumono_inventory | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restaurar backup
cat backup.sql | docker exec -i <postgres-container> psql -U lumono -d lumono_inventory

# Restaurar backup comprimido
gunzip -c backup.sql.gz | docker exec -i <postgres-container> psql -U lumono -d lumono_inventory
```

### Migraciones manuales
```bash
# Acceder al contenedor del API
docker exec -it <api-container> sh

# Ver estado de migraciones
npx prisma migrate status

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Generar Prisma client (si es necesario)
npx prisma generate

# Ver schema actual
npx prisma db pull

# Abrir Prisma Studio (en desarrollo)
npx prisma studio
```

---

## 🔄 Redis

### Acceder a Redis CLI
```bash
# Terminal interactivo
docker exec -it <redis-container> redis-cli

# Comandos útiles dentro de redis-cli:
# PING - verificar conexión
# INFO - información del servidor
# KEYS * - ver todas las keys (⚠️ no usar en producción con muchas keys)
# FLUSHALL - borrar todo (⚠️ cuidado!)
# GET key - obtener valor
# DEL key - eliminar key
```

### Stats de Redis
```bash
# Ver información completa
docker exec <redis-container> redis-cli INFO

# Ver memoria usada
docker exec <redis-container> redis-cli INFO memory

# Ver número de keys
docker exec <redis-container> redis-cli DBSIZE

# Monitor en tiempo real (ver todos los comandos)
docker exec -it <redis-container> redis-cli MONITOR
```

---

## 🔧 Gestión de Servicios

### Reiniciar servicios
```bash
# En Coolify UI: Service → Restart

# O manualmente:
docker restart <container-name>

# Reiniciar solo API
docker restart <api-container>

# Reiniciar solo Web
docker restart <web-container>

# Reiniciar todo el stack
docker compose restart
```

### Ver variables de entorno
```bash
# Ver env vars de un contenedor
docker exec <container-name> env

# Ver solo las de la app
docker exec <container-name> env | grep -E "(JWT|DATABASE|POSTGRES|REDIS|CORS)"
```

### Ejecutar comandos en contenedores
```bash
# Shell interactivo
docker exec -it <container-name> sh

# Ver archivos
docker exec <container-name> ls -la /app

# Ver package.json
docker exec <container-name> cat /app/package.json

# Ver logs de la app (si está en archivo)
docker exec <container-name> tail -f /var/log/app.log
```

---

## 📊 Health Checks

### Verificar estado de servicios
```bash
# API Health
curl https://api.tudominio.com/health

# Frontend (debe retornar HTML)
curl https://app.tudominio.com

# Postgres (desde dentro del servidor)
docker exec <postgres-container> pg_isready -U lumono

# Redis (desde dentro del servidor)
docker exec <redis-container> redis-cli ping
```

### Verificar conectividad entre servicios
```bash
# Desde el contenedor del API, ping a postgres
docker exec <api-container> ping postgres

# Desde el contenedor del API, ping a redis
docker exec <api-container> ping redis

# Desde el contenedor del Web, ping a api
docker exec <web-container> ping api
```

---

## 🚀 Deploy y Actualizaciones

### Deploy desde Git
```bash
# En Coolify UI: Click en "Deploy"

# O trigger manual via webhook (configurar en Coolify)
curl -X POST <coolify-webhook-url>
```

### Rebuild forzado
```bash
# En Coolify UI: Service → Force Rebuild

# O manualmente:
docker compose build --no-cache <service-name>
docker compose up -d <service-name>
```

### Rollback a versión anterior
```bash
# En Coolify UI: Deployments → Select previous deployment → Redeploy
```

---

## 🧹 Limpieza y Mantenimiento

### Limpiar imágenes antiguas
```bash
# Limpiar imágenes no usadas
docker image prune -a

# Limpiar todo (imágenes, contenedores, volúmenes no usados)
docker system prune -a --volumes

# Ver espacio usado por Docker
docker system df
```

### Limpiar logs
```bash
# Ver tamaño de logs
du -sh /var/lib/docker/containers/*/*-json.log

# Truncar logs de un contenedor
truncate -s 0 /var/lib/docker/containers/<container-id>/<container-id>-json.log

# Configurar límite de logs (en docker-compose.yml):
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🔐 Seguridad

### Cambiar contraseña de Postgres
```bash
# Acceder a Postgres
docker exec -it <postgres-container> psql -U lumono -d lumono_inventory

# Cambiar contraseña
ALTER USER lumono WITH PASSWORD 'nueva_contraseña_fuerte';
\q

# Actualizar DATABASE_URL en Coolify con la nueva contraseña
# Reiniciar servicio API
```

### Rotar JWT secrets
```bash
# 1. Generar nuevos secrets
openssl rand -base64 32  # JWT_ACCESS_SECRET
openssl rand -base64 32  # JWT_REFRESH_SECRET

# 2. Actualizar en Coolify → Environment Variables
# 3. Redeploy del servicio API
# ⚠️ Todos los usuarios serán deslogueados
```

### Ver usuarios activos (desde la app)
```bash
# Conectar a Postgres
docker exec -it <postgres-container> psql -U lumono -d lumono_inventory

# Ver usuarios
SELECT id, email, name, created_at FROM users WHERE deleted_at IS NULL;

# Ver permisos de un usuario
SELECT u.email, p.name as permission
FROM users u
JOIN user_permissions up ON u.id = up.user_id
JOIN permissions p ON up.permission_id = p.id
WHERE u.email = 'admin@lumono.com';
```

---

## 📈 Queries Útiles

### Productos
```sql
-- Total de productos
SELECT COUNT(*) FROM products WHERE deleted_at IS NULL;

-- Productos con stock bajo (menos de 10)
SELECT p.sku, p.name, i.quantity
FROM products p
JOIN inventory_items i ON p.id = i.product_id
WHERE i.quantity < 10 AND p.deleted_at IS NULL;

-- Productos más vendidos (si tienes tabla de ventas)
SELECT p.name, COUNT(*) as sales
FROM products p
JOIN inventory_movements im ON p.id = im.product_id
WHERE im.type = 'OUT'
GROUP BY p.id
ORDER BY sales DESC
LIMIT 10;
```

### Inventario
```sql
-- Stock total por ubicación
SELECT l.name, SUM(i.quantity) as total_stock
FROM locations l
JOIN inventory_items i ON l.id = i.location_id
WHERE l.deleted_at IS NULL
GROUP BY l.id;

-- Movimientos recientes (últimos 50)
SELECT im.type, p.name, im.quantity, im.created_at, im.created_by
FROM inventory_movements im
JOIN products p ON im.product_id = p.id
ORDER BY im.created_at DESC
LIMIT 50;

-- Stock por producto
SELECT p.name, l.name as location, i.quantity
FROM products p
JOIN inventory_items i ON p.id = i.product_id
JOIN locations l ON i.location_id = l.id
WHERE p.deleted_at IS NULL
ORDER BY p.name;
```

### Usuarios y Permisos
```sql
-- Usuarios activos
SELECT id, email, name, created_at
FROM users
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- Permisos por usuario
SELECT u.email, COUNT(up.permission_id) as permissions_count
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id;
```

---

## 🔥 Troubleshooting Rápido

### Problema: API no responde
```bash
# 1. Ver si el contenedor está corriendo
docker ps | grep api

# 2. Ver logs
docker logs --tail 100 <api-container>

# 3. Reiniciar
docker restart <api-container>

# 4. Si no funciona, ver health de postgres
docker exec <postgres-container> pg_isready -U lumono
```

### Problema: Web no carga
```bash
# 1. Ver logs
docker logs --tail 100 <web-container>

# 2. Verificar que API está funcionando
curl http://api:3001/health

# 3. Reiniciar
docker restart <web-container>
```

### Problema: Out of disk space
```bash
# Ver espacio usado
df -h

# Ver qué está usando más espacio
du -sh /var/lib/docker/*

# Limpiar Docker
docker system prune -a --volumes

# Limpiar logs
find /var/lib/docker/containers/ -name "*.log" -exec truncate -s 0 {} \;
```

### Problema: Out of memory
```bash
# Ver memoria usada
free -h

# Ver procesos que usan más memoria
docker stats --no-stream | sort -k 7 -h

# Reiniciar contenedor que usa mucha RAM
docker restart <container-name>

# Aumentar recursos en Coolify
# Settings → Resources → Memory
```

### Problema: Migraciones fallan
```bash
# Ver estado
docker exec <api-container> npx prisma migrate status

# Ver última migración aplicada
docker exec <postgres-container> psql -U lumono -d lumono_inventory -c "SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1;"

# Marcar migración como aplicada (si ya se aplicó manualmente)
docker exec <api-container> npx prisma migrate resolve --applied <migration-name>

# Marcar migración como rollback
docker exec <api-container> npx prisma migrate resolve --rolled-back <migration-name>
```

---

## 📱 Accesos Rápidos

### URLs de Producción
```bash
# Frontend
https://app.tudominio.com

# API
https://api.tudominio.com

# API Docs (Swagger)
https://api.tudominio.com/api

# Health Check
https://api.tudominio.com/health
```

### Coolify Dashboard
```bash
# Acceder al dashboard de Coolify
https://coolify.tudominio.com

# Ver logs en tiempo real
Dashboard → Project → Service → Logs

# Ver recursos
Dashboard → Project → Service → Resources

# Variables de entorno
Dashboard → Project → Service → Environment
```

---

## 🎯 Scripts de Automatización

### Script de backup automático (crontab)
```bash
#!/bin/bash
# backup.sh - Guardar en /usr/local/bin/lumono-backup.sh

BACKUP_DIR="/backups/lumono"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -1)

mkdir -p $BACKUP_DIR

# Backup de base de datos
docker exec $CONTAINER pg_dump -U lumono lumono_inventory | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Mantener solo los últimos 7 días
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completado: db_$DATE.sql.gz"
```

```bash
# Hacer ejecutable
chmod +x /usr/local/bin/lumono-backup.sh

# Agregar a crontab (todos los días a las 2 AM)
crontab -e
0 2 * * * /usr/local/bin/lumono-backup.sh >> /var/log/lumono-backup.log 2>&1
```

### Script de health check
```bash
#!/bin/bash
# health-check.sh

API_URL="https://api.tudominio.com/health"
WEB_URL="https://app.tudominio.com"

# Check API
if curl -s -f $API_URL > /dev/null; then
    echo "✅ API OK"
else
    echo "❌ API FAIL"
    # Enviar alerta (Slack, email, etc)
fi

# Check Web
if curl -s -f $WEB_URL > /dev/null; then
    echo "✅ WEB OK"
else
    echo "❌ WEB FAIL"
    # Enviar alerta
fi
```

---

## 📞 Contactos de Emergencia

```
⚠️ Si algo falla y no sabes qué hacer:

1. Ver DEPLOY_COOLIFY.md → sección Troubleshooting
2. Ver REVIEW_DEPLOY.md → sección Troubleshooting Avanzado
3. Buscar en logs: docker logs <container>
4. Revisar health checks: curl /health
5. Reiniciar servicio: docker restart <container>
6. Si todo falla: docker compose down && docker compose up -d
```

---

¡Estos comandos cubren el 99% de operaciones del día a día! 🚀
