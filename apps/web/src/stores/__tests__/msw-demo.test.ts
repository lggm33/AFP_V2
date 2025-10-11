import { describe, it, expect } from 'vitest';

describe('MSW Demo - Cómo funciona la interceptación', () => {
  it('demuestra que MSW intercepta requests reales', async () => {
    console.log('🚀 Iniciando test...');
    
    // Hacer una request HTTP real (como lo haría Supabase)
    const response = await fetch('https://test.supabase.co/auth/v1/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    // Esta respuesta viene de MSW, NO de internet
    expect(data).toEqual({ message: 'Logged out successfully' });
    expect(response.status).toBe(200);
    
    console.log('✅ MSW interceptó la request exitosamente!');
  });

  it('demuestra que NO hay servidor web corriendo', async () => {
    console.log('🔍 Verificando que no hay servidor web...');
    
    // Intentar conectar a localhost:3000 (donde correría el dev server)
    try {
      await fetch('http://localhost:3000');
      console.log('❌ ¡Hay un servidor corriendo! (no debería)');
    } catch (error) {
      console.log('✅ Confirmado: NO hay servidor web corriendo');
      console.log('📝 Error esperado:', (error as Error).message);
    }
  });
});
