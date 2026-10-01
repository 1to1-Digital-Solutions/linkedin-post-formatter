# Complejidad y tamaño

Estos límites son mecánicos a propósito. No pretenden capturar "código bonito": pretenden que
la deriva se note **pronto**, cuando aún es barata, sin que nadie tenga que leer el diff.

- **Funciones cortas.** Como referencia, más de ~40 líneas o más de ~10 caminos distintos
  (condicionales, bucles, `catch`) es señal de que hay más de una responsabilidad ahí dentro.
- **Pocos parámetros.** A partir de cuatro, agrupa en un objeto con nombres.
- **Anidamiento plano.** Tres niveles de indentación dentro de una función ya cuesta seguirlos:
  salida temprana en vez de `else` gigantes.
- **Un fichero, un tema.** Si un fichero acumula cosas que cambian por razones distintas,
  sepáralo.
- **Duplicación**: dos veces puede ser casualidad; tres es un patrón que hay que extraer. Pero
  no extraigas una abstracción para un único uso: eso es peor que la duplicación.
- **Sin código muerto ni abstracciones especulativas.** Nada de exportaciones sin usar, ficheros
  huérfanos, funciones o parámetros "por si acaso" ni capas de indirección para un único uso: lo
  que no se usa no se prueba, no se revisa y estorba, y es lo que más se acumula cuando nadie lee
  los diffs sin que ninguna métrica lo detecte. Si algo deja de usarse, bórralo en el mismo
  cambio (el historial lo conserva).
- **Nombres que digan la verdad.** Un nombre que ya no describe lo que hace la función es un
  bug de documentación esperando a confundir a alguien.

Cuando el límite estorbe de verdad, sepáralo o justifica por qué en el propio código, con un
comentario que explique el *porqué*. Lo que no vale es superarlo en silencio.
