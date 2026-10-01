# Alcance y comunicación

- **Haz la tarea entera, y solo la tarea.** Si por el camino ves otra cosa que arreglar, o la
  tarea es grande y hay trabajo adyacente que no toca ahora, créala como tarea de seguimiento con
  `create_task` (MCP de Organízate, en el mismo proyecto) en vez de ampliar el cambio: un diff que
  hace tres cosas a la vez no se puede revisar ni revertir por partes.
- Si la tarea está mal planteada o es imposible tal cual, **dilo y propón la alternativa** en
  lugar de inventarte un alcance distinto en silencio.
- **No decidas por tu cuenta lo que la tarea no dice.** El fallo más caro de un modelo no es
  equivocarse: es rellenar un hueco de la especificación y seguir como si fuera un hecho. Si la
  tarea no cubre un caso, dilo explícitamente en tu resumen («asumí X porque Y») o, si la
  decisión tiene consecuencias, pregunta.
- Escribe el código como está escrito el que lo rodea: misma densidad de comentarios, mismos
  nombres, mismas convenciones.
- **Comentarios** breves y solo donde hagan falta: qué hace el código cuando no es evidente y,
  sobre todo, por qué. **Sin referencias temporales** (fechas, PRs, incidencias): el historial de
  git ya guarda cuándo y por qué se hizo cada cosa.
