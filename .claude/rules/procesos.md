# Procesos de larga vida

Levantar la app o el juego es a veces la única forma de comprobar algo; dejarlo levantado, no.
Un `next dev` con three.js pasa de 1,5 GB, y varios olvidados ya agotaron la memoria de la
máquina y se llevaron una sesión entera con el trabajo sin commitear.

- **Un servidor cada vez**: arráncalo, comprueba lo que ibas a comprobar y páralo.
- **Tu puerto es el del entorno**: `$PORT` (Playwright lo lee de `$E2E_PORT`, que vale lo
  mismo). No escribas uno a mano.
- **Para por puerto o por PID, nunca por patrón**: `lsof -ti :"$PORT" | xargs -r kill`. Un
  patrón no caza `next start` ni los navegadores de Playwright, y sí los procesos de otros.
- **Los navegadores también cuentan**: cierra los de Playwright en un `finally` o con un tiempo
  límite.
- Antes de terminar, comprueba que no queda nada tuyo escuchando. Supabase (Docker) y lo que el
  usuario levantó a mano no son tuyos: no los toques.
