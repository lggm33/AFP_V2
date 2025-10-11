import { describe, it, expect, vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

describe('Flujo Real: Cómo el test hace peticiones HTTP', () => {
  it('demuestra el flujo completo desde test hasta MSW', async () => {
    console.log('🎬 INICIANDO FLUJO COMPLETO...\n');

    // 1. Test ejecuta código real
    console.log('1️⃣ Test ejecuta: useAuthStore.getState().signOut()');
    const store = useAuthStore.getState();
    
    // 2. Spy en fetch para ver qué peticiones se hacen
    const fetchSpy = vi.spyOn(global, 'fetch');
    
    console.log('2️⃣ Ejecutando signOut() (código real de producción)...');
    
    // 3. Ejecutar signOut - esto internamente hará fetch()
    await store.signOut();
    
    // 4. Verificar que fetch fue llamado
    console.log('3️⃣ Verificando que fetch() fue llamado...');
    expect(fetchSpy).toHaveBeenCalled();
    
    // 5. Ver qué URL se llamó
    const fetchCalls = fetchSpy.mock.calls;
    console.log('4️⃣ Peticiones HTTP interceptadas por MSW:');
    
    fetchCalls.forEach((call, index) => {
      const [url, options] = call;
      console.log(`   📡 Petición ${index + 1}:`);
      console.log(`      URL: ${url}`);
      console.log(`      Method: ${options?.method || 'GET'}`);
      console.log(`      Headers:`, options?.headers || 'None');
    });
    
    console.log('\n5️⃣ MSW interceptó estas peticiones y devolvió respuestas mock');
    console.log('6️⃣ Tu código recibió las respuestas como si fueran reales');
    console.log('✅ FLUJO COMPLETADO - Todo funcionó sin servidor real!\n');
    
    // Cleanup
    fetchSpy.mockRestore();
  });

  it('demuestra que el código NO sabe que está siendo mockeado', async () => {
    console.log('🕵️ DEMOSTRANDO TRANSPARENCIA DE MSW...\n');
    
    // Tu código piensa que está hablando con Supabase real
    const store = useAuthStore.getState();
    
    // Pero MSW devuelve respuestas fake
    await store.signOut();
    
    // El resultado es que el estado se limpia (como si fuera real)
    const finalState = useAuthStore.getState();
    
    console.log('🎭 Tu código nunca supo que fue engañado:');
    console.log('   - Hizo petición HTTP real ✅');
    console.log('   - Recibió respuesta "real" ✅'); 
    console.log('   - Procesó el resultado normalmente ✅');
    console.log('   - Estado final limpio:', {
      user: finalState.user,
      session: finalState.session
    });
    
    expect(finalState.user).toBeNull();
    expect(finalState.session).toBeNull();
  });
});
