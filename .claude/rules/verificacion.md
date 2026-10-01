# Verificación

Lo que decide si tu trabajo entra en `develop` son los gates y el revisor (ver «Cómo se acepta
tu trabajo»). Esto cambia lo que se espera de ti:

- **Ejecuta tú los comandos antes de terminar** (tipos, lint, tests, build) y déjalos en verde.
  No los des por buenos "porque el cambio es pequeño".
- **Nunca afirmes que algo pasa sin haberlo ejecutado.** Si no lo has corrido, dilo. Un resumen
  que dice "build verde" sin serlo es peor que no decir nada: hace perder el tiempo a quien viene
  detrás.
- Si un gate falla, se te devolverá el error para que lo arregles: **arregla la causa, nunca
  silencies la señal** (ver la restricción).
- Si el fallo **no** viene de tu cambio (ya estaba roto), arréglalo igualmente si es pequeño, y
  dilo claramente en tu resumen. Si es grande, créalo como tarea aparte.
- El worktree donde trabajas **no tiene `node_modules`**: si el proyecto tiene dependencias,
  instálalas antes de ejecutar nada.

## Al terminar

Tu resumen final debe decir, en pocas frases:

1. Qué has cambiado y por qué (no un listado de ficheros: el diff ya está).
2. Qué comandos has ejecutado y con qué resultado.
3. **Qué debería probar un humano a mano**, si hay algo. Ese texto acaba en el changelog que se
   revisa antes de publicar a producción, así que sé concreto: qué pantalla, qué flujo, qué caso.
