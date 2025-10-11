# Sistema de Autenticación Robusto - Casos Edge y Soluciones

## 🎯 Objetivo

Crear un sistema de autenticación que **nunca falle** desde la perspectiva del usuario y maneje
todos los edge cases de manera elegante.

## 📋 Casos Edge Identificados

### 1. **Logout Fallido**

**Problema**: `supabase.auth.signOut()` falla con `AuthSessionMissingError` **Impacto**: Usuario
queda "atrapado" en la UI **Solución**: Logout defensivo

```pseudocode
función signOut():
  try:
    verificar_sesion_supabase()
    if sesion_existe:
      intentar_logout_normal()

  catch error:
    if error == "session_missing":
      log_warning("Sesión ya expirada")
    else:
      log_error(error)

  finally:
    SIEMPRE_limpiar_estado_local()
    NUNCA_lanzar_error_al_UI()
```

### 2. **Desincronización Store vs Supabase**

**Problema**: Store local mantiene datos obsoletos **Impacto**: AuthGuard permite acceso con
sesiones inválidas **Solución**: Supabase como fuente de verdad

```pseudocode
función initialize():
  sesion_real = supabase.getSession()
  store.sincronizar(sesion_real)

  configurar_listener():
    on_auth_change(event, session):
      store.sincronizar(session)
      if event == "SIGNED_OUT":
        limpiar_todo()
```

### 3. **Suspensión del Sistema**

**Problema**: Sistema se suspende, sesión expira, store no se entera **Impacto**: Usuario parece
logueado pero sesión inválida **Solución**: Detección de inactividad + validación

```pseudocode
función detectar_suspension():
  ultimo_tiempo_activo = now()

  cada_minuto():
    tiempo_inactivo = now() - ultimo_tiempo_activo
    if tiempo_inactivo > 30_MINUTOS:
      validar_sesion_actual()
      if sesion_invalida:
        auto_logout("suspension_detected")

  on_visibility_change():
    if pagina_visible:
      validar_sesion_actual()
```

### 4. **PWA en Background**

**Problema**: PWA va a background, vuelve después de horas **Impacto**: Sesión puede haber expirado
**Solución**: Validación al reactivar PWA

```pseudocode
función manejar_pwa():
  if es_pwa():
    on_visibility_change():
      if visible AND es_pwa():
        sesion = supabase.getSession()
        if !sesion:
          auto_logout("pwa_session_lost")
        else if proxima_a_expirar(sesion):
          intentar_refresh()
```

### 5. **Múltiples Tabs**

**Problema**: Usuario hace logout en una tab, otras tabs no se enteran **Impacto**: Estado
inconsistente entre tabs **Solución**: Sincronización via localStorage events

```pseudocode
función sincronizar_tabs():
  on_storage_change(event):
    if event.key == "supabase.auth.token":
      if event.newValue == null:
        // Otra tab hizo logout
        limpiar_estado_local()
        redirect_to_login()
      else:
        // Otra tab hizo login
        re_initialize()
```

### 6. **Sesión Expirada Durante Uso**

**Problema**: Usuario está usando la app, sesión expira silenciosamente **Impacto**: API calls
fallan con 401 **Solución**: Interceptor de requests + auto-refresh

```pseudocode
función interceptor_api():
  on_api_request():
    if response.status == 401:
      try:
        refresh_token()
        retry_request()
      catch:
        auto_logout("token_expired")
```

### 7. **Errores de Red**

**Problema**: Requests de auth fallan por problemas de conectividad **Impacto**: Estados
inconsistentes **Solución**: Retry con backoff + fallback

```pseudocode
función manejar_errores_red():
  try:
    operacion_auth()
  catch NetworkError:
    retry_con_backoff(operacion_auth, max_intentos=3)
    if todos_fallan:
      mostrar_error_conectividad()
      mantener_estado_actual()
```

### 8. **Corrupción de localStorage**

**Problema**: Datos de auth en localStorage se corrompen **Impacto**: App no puede determinar estado
de auth **Solución**: Validación + limpieza

```pseudocode
función validar_storage():
  try:
    datos_auth = localStorage.getItem("supabase.auth.token")
    if datos_corrupted(datos_auth):
      limpiar_storage()
      force_re_authentication()
  catch:
    limpiar_storage()
    redirect_to_login()
```

## 🏗️ Arquitectura de la Solución

### Principios Fundamentales

1. **Supabase es la Fuente de Verdad**
   - Store local es solo cache para UI
   - Siempre validar contra Supabase en operaciones críticas

2. **Logout Nunca Falla**
   - Siempre limpiar estado local
   - Ignorar errores de "session missing"
   - Nunca lanzar errores al UI

3. **Validación Proactiva**
   - Verificar sesión al reactivar app
   - Validar antes de operaciones críticas
   - Auto-refresh cuando sea posible

4. **Recuperación Automática**
   - Manejar errores sin intervención del usuario
   - Fallbacks para todos los casos edge
   - Logging para debugging

### Componentes del Sistema

```pseudocode
AuthStore:
  - signOut() // Logout defensivo
  - initialize() // Sincronización inicial
  - validateSession() // Validación bajo demanda
  - forceCleanup() // Limpieza de emergencia

AuthGuard:
  - Validar sesión real (no solo store)
  - Manejar estados de loading
  - Redirect inteligente

SuspensionDetector:
  - Detectar inactividad prolongada
  - Validar al reactivar
  - Auto-logout cuando necesario

PWAManager:
  - Manejar estados específicos de PWA
  - Persistencia robusta
  - Validación al foreground

NetworkManager:
  - Retry con backoff
  - Detección de conectividad
  - Fallbacks offline
```

## 🔄 Flujos Principales

### Flujo de Inicialización

```pseudocode
1. App inicia
2. AuthStore.initialize()
3. Obtener sesión real de Supabase
4. Sincronizar con store local
5. Configurar listeners
6. Configurar detectores (suspensión, PWA, etc.)
7. Marcar como inicializado
```

### Flujo de Logout

```pseudocode
1. Usuario hace click en logout
2. AuthStore.signOut()
3. Intentar logout en Supabase (ignorar errores de session missing)
4. Limpiar store local SIEMPRE
5. Limpiar localStorage
6. Redirect a login
7. NUNCA mostrar errores al usuario
```

### Flujo de Validación

```pseudocode
1. Trigger de validación (reactivar app, API error, etc.)
2. Obtener sesión actual de Supabase
3. Comparar con store local
4. Si inconsistente: sincronizar o logout
5. Si expirada: intentar refresh o logout
6. Actualizar store con estado real
```

### Flujo de Recuperación

```pseudocode
1. Detectar error/inconsistencia
2. Intentar recuperación automática
3. Si falla: auto-logout limpio
4. Mostrar mensaje apropiado al usuario
5. Log para debugging
```

## 🎯 Casos de Uso Específicos

### Caso: Usuario deja laptop suspendida

```
Trigger: visibilitychange event
Acción: Validar sesión, auto-logout si expiró
Resultado: Usuario ve login screen con mensaje explicativo
```

### Caso: PWA en background por horas

```
Trigger: PWA vuelve a foreground
Acción: Validar + refresh si es posible
Resultado: Sesión renovada o logout limpio
```

### Caso: Múltiples tabs, logout en una

```
Trigger: localStorage change event
Acción: Sincronizar estado en todas las tabs
Resultado: Todas las tabs muestran login
```

### Caso: API call falla con 401

```
Trigger: HTTP interceptor
Acción: Intentar refresh token, si falla -> logout
Resultado: Request se reintenta o usuario va a login
```

## 📊 Métricas y Monitoreo

### Eventos a Trackear

- `auth_logout_success`
- `auth_logout_failed_but_cleaned`
- `auth_session_expired_detected`
- `auth_auto_logout_triggered`
- `auth_suspension_detected`
- `auth_pwa_reactivation`
- `auth_multi_tab_sync`
- `auth_network_error_recovered`

### Logs Importantes

- Razón de cada auto-logout
- Errores de sincronización
- Fallos de validación
- Recuperaciones exitosas

## 🚀 Plan de Implementación

### Fase 1: Logout Defensivo

- Modificar `createSignOut()` para nunca fallar
- Implementar `forceLocalCleanup()`
- Testing de casos edge de logout

### Fase 2: Validación Robusta

- Mejorar `AuthGuard` con validación real
- Implementar `validateSession()`
- Sincronización bidireccional

### Fase 3: Detección de Suspensión

- Implementar `SuspensionDetector`
- Manejar `visibilitychange` events
- Auto-logout por inactividad

### Fase 4: Soporte PWA

- Implementar `PWAManager`
- Persistencia mejorada
- Validación específica PWA

### Fase 5: Sincronización Multi-Tab

- Listeners de localStorage
- Sincronización automática
- Testing cross-tab

### Fase 6: Recuperación de Errores

- HTTP interceptors
- Retry logic
- Fallbacks offline

## ✅ Criterios de Éxito

1. **Usuario nunca queda "atrapado"** - Logout siempre funciona
2. **Estado siempre consistente** - Store refleja realidad de Supabase
3. **Recuperación automática** - Errores se manejan sin intervención
4. **UX fluida** - Transiciones suaves entre estados
5. **PWA funciona offline** - Degradación elegante sin conectividad
6. **Multi-tab sincronizado** - Estado consistente entre tabs
7. **Logging completo** - Visibilidad de todos los edge cases
