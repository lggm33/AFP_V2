# Guía: Aplicar Migraciones a Supabase

## Prerrequisitos

- ✅ Supabase CLI instalado (versión 2.48.3 detectada)
- ✅ Proyecto de Supabase creado
- ✅ Credenciales de acceso

---

## Opción 1: Aplicar a Supabase Cloud (Producción)

### Paso 1: Linkear tu proyecto local con Supabase Cloud

```bash
cd /Users/gabrielgomez/personal/AFP_V2

# Linkear con tu proyecto
supabase link --project-ref <tu-project-ref>
```

**¿Dónde encuentro mi project-ref?**
- Ve a tu dashboard de Supabase
- URL será: `https://supabase.com/dashboard/project/<project-ref>`
- O en Settings → General → Reference ID

**Te pedirá:**
- Database password (la que configuraste al crear el proyecto)

### Paso 2: Verificar conexión

```bash
supabase db remote commit
```

Esto descargará cualquier migración remota existente.

### Paso 3: Aplicar las migraciones

```bash
# Aplicar TODAS las migraciones pendientes
supabase db push
```

**Confirmación:** Te preguntará si estás seguro. Escribe `yes`.

### Paso 4: Verificar que se aplicaron

```bash
# Ver estado de las migraciones
supabase migration list

# Ver las tablas creadas
supabase db remote exec "
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
  ORDER BY table_name;
"
```

---

## Opción 2: Aplicar Localmente (Desarrollo)

### Paso 1: Iniciar Supabase localmente

```bash
cd /Users/gabrielgomez/personal/AFP_V2

# Iniciar servicios locales
supabase start
```

Esto iniciará:
- PostgreSQL (Base de datos)
- API REST
- Auth
- Storage
- Etc.

**Salida esperada:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJh...
service_role key: eyJh...
```

### Paso 2: Las migraciones se aplican automáticamente

Al hacer `supabase start`, las migraciones en `/supabase/migrations/` se aplican automáticamente.

### Paso 3: Verificar

```bash
# Abrir Supabase Studio
open http://localhost:54323

# O verificar por CLI
supabase db remote exec "
  SELECT COUNT(*) as total_tables 
  FROM information_schema.tables 
  WHERE table_schema = 'public';
"
```

---

## Opción 3: Aplicar Manualmente desde Dashboard

### Paso 1: Abrir SQL Editor

1. Ve a tu dashboard: https://supabase.com/dashboard/project/<tu-project>
2. Click en "SQL Editor" en el menú lateral

### Paso 2: Ejecutar cada migración en orden

**IMPORTANTE:** Ejecutar en este orden:

```sql
-- 1. Ejecutar todo el contenido de:
-- supabase/migrations/20251008000001_create_enums.sql

-- 2. Ejecutar todo el contenido de:
-- supabase/migrations/20251008000002_create_payment_methods.sql

-- 3. Ejecutar todo el contenido de:
-- supabase/migrations/20251008000003_create_scheduled_transactions.sql

-- 4. Ejecutar todo el contenido de:
-- supabase/migrations/20251008000004_enhance_transactions.sql

-- 5. Ejecutar todo el contenido de:
-- supabase/migrations/20251008000005_create_transaction_details.sql

-- 6. Ejecutar todo el contenido de:
-- supabase/migrations/20251008000006_create_functions.sql

-- 7. Ejecutar todo el contenido de:
-- supabase/migrations/20251008000007_create_views.sql
```

### Paso 3: Verificar

```sql
-- Verificar tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verificar vistas
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## Comandos Útiles

### Ver migraciones pendientes
```bash
supabase migration list
```

### Aplicar solo UNA migración específica
```bash
supabase db push --file supabase/migrations/20251008000001_create_enums.sql
```

### Ver diferencias entre local y remoto
```bash
supabase db diff
```

### Resetear base de datos local (cuidado!)
```bash
supabase db reset
```

### Ver logs de la base de datos
```bash
supabase logs db
```

### Detener servicios locales
```bash
supabase stop
```

---

## Troubleshooting

### Error: "Project not linked"

**Solución:**
```bash
supabase link --project-ref <tu-project-ref>
```

### Error: "Authentication failed"

**Solución:**
```bash
# Re-login
supabase login

# Luego link nuevamente
supabase link --project-ref <tu-project-ref>
```

### Error: "Migration already applied"

**Solución:** Las migraciones son idempotentes, es seguro. Si ya están aplicadas, no pasará nada.

### Error: "Could not connect to database"

**Verificar:**
```bash
# Para local
supabase status

# Para remoto
supabase projects list
```

### Ver errores detallados

```bash
supabase db push --debug
```

---

## Verificación Post-Migración

### 1. Verificar estructura

```sql
-- Contar tablas
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Esperado: 13 tablas (6 existentes + 7 nuevas)

-- Verificar ENUMs
SELECT COUNT(*) FROM pg_type 
WHERE typtype = 'e' AND typnamespace = (
  SELECT oid FROM pg_namespace WHERE nspname = 'public'
);
-- Esperado: 9 ENUMs (3 existentes + 6 nuevos)

-- Verificar funciones
SELECT COUNT(*) FROM pg_proc 
WHERE pronamespace = (
  SELECT oid FROM pg_namespace WHERE nspname = 'public'
);
-- Esperado: Incluye las 6 nuevas funciones

-- Verificar vistas
SELECT COUNT(*) FROM information_schema.views 
WHERE table_schema = 'public';
-- Esperado: 7 vistas nuevas
```

### 2. Probar funcionalidad básica

```sql
-- Crear un payment method de prueba
INSERT INTO payment_methods (
  user_id,
  name,
  account_type,
  institution_name
) VALUES (
  auth.uid(),
  'Test Credit Card',
  'credit_card',
  'Test Bank'
) RETURNING *;

-- Ver en la vista
SELECT * FROM v_payment_methods_with_stats 
WHERE user_id = auth.uid();
```

---

## Recomendaciones

### ✅ Para Desarrollo

```bash
# Usar ambiente local
supabase start
supabase db reset  # Resetea cuando necesites empezar de cero
```

### ✅ Para Staging

```bash
# Link a proyecto de staging
supabase link --project-ref <staging-ref>

# Aplicar migraciones
supabase db push

# Verificar
supabase db remote exec "SELECT version();"
```

### ✅ Para Producción

```bash
# Link a proyecto de producción
supabase link --project-ref <production-ref>

# SIEMPRE hacer backup primero
# (esto lo haces desde el dashboard de Supabase)

# Aplicar migraciones
supabase db push

# Verificar inmediatamente
supabase db remote exec "
  SELECT COUNT(*) FROM payment_methods;
  SELECT COUNT(*) FROM transactions;
"
```

---

## Próximos Pasos Después de Migrar

### 1. Generar tipos TypeScript

```bash
cd /Users/gabrielgomez/personal/AFP_V2

# Generar tipos actualizados
supabase gen types typescript --local > packages/shared-types/src/database.ts

# O si ya linkeaste con remoto
supabase gen types typescript > packages/shared-types/src/database.ts
```

### 2. Compilar shared-types

```bash
cd packages/shared-types
pnpm build
```

### 3. Actualizar aplicaciones

```bash
# En web app
cd apps/web
pnpm install  # Recargar el shared-types actualizado

# En email-service
cd apps/email-service
pnpm install
```

---

## Resumen de Comandos Principales

```bash
# Setup inicial
supabase login
supabase link --project-ref <tu-project-ref>

# Aplicar migraciones
cd /Users/gabrielgomez/personal/AFP_V2
supabase db push

# Verificar
supabase migration list

# Generar tipos
supabase gen types typescript > packages/shared-types/src/database.ts

# Listo! 🎉
```

---

## Soporte

Si encuentras errores:
1. Revisa los logs: `supabase logs db`
2. Verifica conexión: `supabase status`
3. Consulta docs: https://supabase.com/docs/reference/cli
4. Revisa `/supabase/migrations/README.md`
