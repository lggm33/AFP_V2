# Sistema de Testing - Guía Completa

## 🎯 Objetivo

Esta guía explica cómo funciona nuestro sistema de testing robusto basado en **Vitest + Testing
Library + MSW**, diseñado para testear la lógica de negocio sin necesidad de servidores reales o
navegadores.

## 📋 Tabla de Contenidos

- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Archivos Esenciales](#archivos-esenciales)
- [Flujo de Ejecución](#flujo-de-ejecución)
- [Cómo Agregar Nuevos Tests](#cómo-agregar-nuevos-tests)
- [Comandos Disponibles](#comandos-disponibles)
- [Patrones y Mejores Prácticas](#patrones-y-mejores-prácticas)
- [Troubleshooting](#troubleshooting)

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────┐
│   Vitest        │ ← Test Runner (reemplaza Jest)
├─────────────────┤
│ Testing Library │ ← Utilities para testing
├─────────────────┤
│      MSW        │ ← Mock Service Worker (intercepta HTTP)
├─────────────────┤
│     jsdom       │ ← Simula DOM en Node.js
└─────────────────┘
```

### Principios Fundamentales

1. **No hay servidor web corriendo** - Solo ejecutamos funciones JavaScript
2. **MSW intercepta requests HTTP** - Simula respuestas de APIs sin tocar la red
3. **Mocks de Browser APIs** - localStorage, sessionStorage, etc.
4. **Tests de lógica pura** - Probamos funciones, no UI

## 📁 Archivos Esenciales

### Estructura del Sistema

```
apps/web/
├── vitest.config.ts           # Configuración principal de Vitest
├── src/
│   ├── test-setup.ts          # Setup global (mocks, MSW)
│   ├── test-utils.tsx         # Utilities y helpers
│   ├── mocks/
│   │   ├── server.ts          # Configuración MSW para tests
│   │   └── handlers/
│   │       └── auth.ts        # Handlers HTTP para auth
│   └── stores/__tests__/
│       └── authStore.test.ts  # Tests del auth store
└── package.json               # Scripts de testing
```

### 1. `vitest.config.ts` - Configuración Principal

```typescript
export default defineConfig({
  test: {
    globals: true, // Variables globales (describe, it, expect)
    environment: 'jsdom', // Simula browser en Node.js
    setupFiles: ['./src/test-setup.ts'], // ← PUNTO DE ENTRADA
    css: true, // Soporte para CSS
    coverage: {
      // Configuración de coverage
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### 2. `src/test-setup.ts` - Setup Global

```typescript
import '@testing-library/jest-dom';  // Matchers adicionales
import './mocks/server';             // ← Inicia MSW automáticamente

// Mocks de Browser APIs que no existen en Node.js
global.localStorage = createStorageMock();
global.sessionStorage = createStorageMock();
global.IntersectionObserver = class IntersectionObserver { ... };
global.ResizeObserver = class ResizeObserver { ... };
```

### 3. `src/mocks/server.ts` - MSW Server

```typescript
import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';

export const server = setupServer(...authHandlers);

// ✨ Se ejecuta automáticamente al importar:
beforeAll(() => server.listen()); // Inicia MSW
afterEach(() => server.resetHandlers()); // Reset entre tests
afterAll(() => server.close()); // Cierra al final
```

### 4. `src/mocks/handlers/auth.ts` - HTTP Handlers

```typescript
import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // Logout exitoso
  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Otros endpoints...
];
```

### 5. `src/test-utils.tsx` - Utilities

```typescript
// Custom render con providers
export const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Helpers específicos
export const mockAuthUser = { ... };
export const resetAllMocks = () => { ... };
export const clearSupabaseLocalStorage = () => { ... };
```

## 🔄 Flujo de Ejecución

### Comando → Resultado

```bash
npm run test
```

### 1. **Vitest Inicia**

```
vitest → lee vitest.config.ts → setupFiles: ['./src/test-setup.ts']
```

### 2. **Setup Global se Ejecuta**

```
test-setup.ts → import './mocks/server' → MSW se inicia automáticamente
```

### 3. **MSW se Configura**

```
beforeAll(() => server.listen()) → MSW intercepta HTTP requests
```

### 4. **Tests se Ejecutan**

```
authStore.test.ts → import { useAuthStore } → ejecuta funciones reales
```

### 5. **Interacción con MSW**

```
store.signOut() → supabase.auth.signOut() → fetch() → MSW intercepta → respuesta fake
```

### 6. **Verificación**

```
expect(store.user).toBeNull() → verifica que la lógica funcionó
```

## ➕ Cómo Agregar Nuevos Tests

### 1. Tests de Store/Hooks

```typescript
// src/stores/__tests__/paymentStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { usePaymentStore } from '@/stores/paymentStore';
import { resetAllMocks } from '@/test-utils';

describe('PaymentStore', () => {
  beforeEach(() => {
    resetAllMocks();
    // Reset store state
    usePaymentStore.setState({
      paymentMethods: [],
      loading: false,
    });
  });

  it('should add payment method', async () => {
    const store = usePaymentStore.getState();

    await store.addPaymentMethod({
      name: 'Visa',
      type: 'credit_card',
    });

    const newState = usePaymentStore.getState();
    expect(newState.paymentMethods).toHaveLength(1);
    expect(newState.paymentMethods[0].name).toBe('Visa');
  });
});
```

### 2. Tests de Componentes

```typescript
// src/components/__tests__/AuthGuard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils'; // ← Usa custom render
import { AuthGuard } from '@/components/Auth/AuthGuard';

describe('AuthGuard', () => {
  it('shows loading while initializing', () => {
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects when not authenticated', () => {
    // Mock unauthenticated state
    useAuthStore.setState({ user: null, initialized: true });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    // Should redirect (test navigation)
  });
});
```

### 3. Agregar Nuevos MSW Handlers

```typescript
// src/mocks/handlers/payments.ts
export const paymentHandlers = [
  http.get('/api/payment-methods', () => {
    return HttpResponse.json({
      data: [
        { id: '1', name: 'Visa', type: 'credit_card' },
        { id: '2', name: 'Savings', type: 'bank_account' },
      ],
    });
  }),

  http.post('/api/payment-methods', async ({ request }) => {
    const newMethod = await request.json();
    return HttpResponse.json({
      data: { id: '3', ...newMethod },
    });
  }),
];

// src/mocks/server.ts - agregar a la lista
import { paymentHandlers } from './handlers/payments';
export const server = setupServer(...authHandlers, ...paymentHandlers);
```

### 4. Tests con Override de MSW

```typescript
it('handles API errors gracefully', async () => {
  // Override handler para este test específico
  server.use(
    http.post('/api/payment-methods', () => {
      return HttpResponse.json({ error: 'Validation failed' }, { status: 400 });
    })
  );

  const store = usePaymentStore.getState();
  await store.addPaymentMethod({ name: 'Invalid' });

  expect(store.error).toBe('Validation failed');
});
```

## 🚀 Comandos Disponibles

### Comandos Básicos

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch (rerun al cambiar archivos)
npm run test:watch

# Ejecutar tests una vez y salir
npm run test:run

# Tests con interfaz visual
npm run test:ui

# Tests con coverage
npm run test:coverage
```

### Comandos Avanzados

```bash
# Ejecutar tests específicos
npm run test -- authStore

# Ejecutar tests con patrón
npm run test -- --grep "logout"

# Tests en modo verbose
npm run test -- --reporter=verbose

# Tests con timeout personalizado
npm run test -- --testTimeout=10000
```

### Debugging

```bash
# Tests con logs detallados
npm run test -- --reporter=verbose

# Tests con coverage detallado
npm run test:coverage -- --reporter=text-lcov

# Tests de un archivo específico
npm run test src/stores/__tests__/authStore.test.ts
```

## 📝 Patrones y Mejores Prácticas

### 1. Estructura de Tests

```typescript
describe('ComponentName/StoreName', () => {
  beforeEach(() => {
    // Reset state antes de cada test
    resetAllMocks();
    clearSupabaseLocalStorage();
  });

  describe('feature group', () => {
    it('should do something specific', async () => {
      // 1. Arrange - preparar datos
      const mockData = { ... };

      // 2. Act - ejecutar acción
      const result = await someFunction(mockData);

      // 3. Assert - verificar resultado
      expect(result).toBe(expected);
    });
  });
});
```

### 2. Naming Conventions

```typescript
// ✅ Descriptivo y específico
it('should clean localStorage when logout fails with network error', () => {});

// ❌ Muy genérico
it('should work', () => {});

// ✅ Describe comportamiento
describe('when user is not authenticated', () => {});

// ❌ Describe implementación
describe('AuthGuard component', () => {});
```

### 3. Async/Await Patterns

```typescript
// ✅ Correcto
it('should handle async operations', async () => {
  const result = await store.signOut();
  expect(result).toBeDefined();
});

// ❌ Incorrecto - falta await
it('should handle async operations', () => {
  const result = store.signOut(); // Promise pending
  expect(result).toBeDefined(); // Falla
});
```

### 4. MSW Best Practices

```typescript
// ✅ Handler específico para el test
server.use(
  http.post('/auth/logout', () => {
    return HttpResponse.json({ error: 'session_missing' }, { status: 401 });
  })
);

// ✅ Reset handlers después del test
afterEach(() => {
  server.resetHandlers();
});
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. "localStorage is not defined"

**Problema**: Tu código usa localStorage pero no está mockeado.

**Solución**: Verificar que `test-setup.ts` se está importando:

```typescript
// vitest.config.ts
test: {
  setupFiles: ['./src/test-setup.ts'], // ← Debe estar presente
}
```

#### 2. "fetch is not defined"

**Problema**: MSW no está configurado correctamente.

**Solución**: Verificar import en `test-setup.ts`:

```typescript
// test-setup.ts
import './mocks/server'; // ← Debe estar presente
```

#### 3. Tests fallan por requests no mockeadas

**Problema**: MSW no tiene handler para una URL específica.

**Solución**: Agregar handler o configurar `onUnhandledRequest`:

```typescript
// mocks/server.ts
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' }); // ← Muestra warnings
});
```

#### 4. Estado persistente entre tests

**Problema**: Tests fallan porque el estado no se limpia.

**Solución**: Reset en `beforeEach`:

```typescript
beforeEach(() => {
  resetAllMocks();
  useAuthStore.setState({ user: null, session: null });
});
```

#### 5. Tests lentos

**Problema**: Tests tardan mucho en ejecutar.

**Solución**: Verificar timeouts y handlers:

```typescript
// Evitar timeouts largos en handlers
http.post('/api/slow', async () => {
  await new Promise(resolve => setTimeout(resolve, 30000)); // ❌ Muy lento
  return HttpResponse.json({ data: 'ok' });
});
```

### Logs de Debug

```typescript
// Agregar logs temporales para debugging
it('debug test', async () => {
  console.log('Estado inicial:', useAuthStore.getState());

  await store.signOut();

  console.log('Estado final:', useAuthStore.getState());
  expect(store.user).toBeNull();
});
```

## 📊 Métricas y Coverage

### Interpretar Coverage

```bash
npm run test:coverage
```

```
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
authStore.ts       |   47.71 |    84.21 |   58.33 |   47.71 |
```

- **% Stmts**: Porcentaje de statements ejecutados
- **% Branch**: Porcentaje de branches (if/else) cubiertos
- **% Funcs**: Porcentaje de funciones ejecutadas
- **% Lines**: Porcentaje de líneas ejecutadas

### Objetivos de Coverage

- **Crítico (auth, payments)**: >80%
- **Importante (UI components)**: >60%
- **Utilities**: >90%

## 🎯 Próximos Pasos

### Fase 2: Component Testing

- Tests de AuthGuard
- Tests de formularios
- Tests de componentes de UI

### Fase 3: E2E Testing

- Playwright setup
- User journey tests
- PWA scenarios

### Fase 4: Visual Testing

- Storybook integration
- Visual regression tests
- Cross-browser testing

---

## 📚 Referencias

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

**¿Preguntas?** Consulta esta guía o revisa los tests existentes en
`src/stores/__tests__/authStore.test.ts` como referencia.
