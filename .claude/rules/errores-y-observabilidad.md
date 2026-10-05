# Errores y observabilidad

- **Nunca te tragues un error.** Un `catch` vacío convierte un fallo ruidoso en uno silencioso,
  que es mucho peor: el problema sigue, pero ya nadie se entera.
- Si capturas, es para hacer algo: reintentar, degradar con criterio o traducirlo a un mensaje
  útil. Y deja rastro de lo que pasó.
- **Los mensajes de error los lee una persona.** "Algo salió mal" no ayuda a nadie; di qué
  falló y qué puede hacer al respecto. En español, sin jerga y sin filtrar detalles internos
  (rutas, SQL, trazas) a la interfaz.
- Distingue lo esperable de lo excepcional: que un formulario venga mal rellenado no es un
  error del sistema, es un caso normal con su respuesta.
- Registra lo que servirá para diagnosticar (qué operación, qué identificador, qué falló) y
  **nunca** secretos, tokens ni datos personales.
