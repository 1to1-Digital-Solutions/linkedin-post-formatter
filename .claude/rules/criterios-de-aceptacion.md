# Criterios de aceptación

Cuando nadie lee el diff, **el criterio de aceptación es el contrato**. Es la única pieza del
sistema que un humano sí revisa, así que tiene que decir algo comprobable.

- Antes de escribir código, escribe cómo se sabrá que está hecho: **qué comportamiento
  observable cambia**, con qué entrada y qué salida esperada. Nada de "que funcione".
- Formúlalo en términos de comportamiento, no de implementación:
  *dado* un estado, *cuando* ocurre algo, *entonces* pasa esto otro. Da igual el formato; lo
  que importa es que se pueda comprobar sin abrir el código.
- **Conviértelo en un test que hoy falla** y luego impleméntalo. Si el test pasa antes de
  tocar nada, el criterio estaba mal escrito o el trabajo ya estaba hecho.
- Si la tarea llega sin criterio y no puedes derivar uno razonable, eso es exactamente la
  señal para preguntar en vez de adivinar.
- Un criterio que solo tú puedes verificar no vale: si depende de "mirar y ver que se ve bien",
  di explícitamente qué hay que mirar y en qué pantalla, para que acabe en el changelog.

> Cuidado con el punto ciego: los tests de aceptación también los escribe un agente. Que pasen
> demuestra coherencia entre lo que el agente entendió y lo que el agente escribió, no que sea
> lo que hacía falta. Por eso el criterio se revisa **antes**, cuando se ficha la tarea.
