# Accesibilidad

No es una capa que se añade después: se hace bien desde el principio o se rehace entera.

- **HTML con sentido antes que ARIA.** Un `<button>` es un botón: hace foco, responde a Enter y
  a Espacio y lo anuncia el lector de pantalla. Un `<div onClick>` no es nada de eso. La mejor
  etiqueta ARIA es la que no hace falta poner.
- **Todo lo que se puede hacer con ratón, con teclado**: tabulación en orden lógico, foco
  visible (no lo quites), Escape cierra diálogos y menús, y el foco no se escapa de un modal
  abierto ni se pierde al cerrarlo.
- Imágenes con `alt` que aporte (o `alt=""` si son decorativas). Iconos sin texto: etiqueta
  accesible. Campos de formulario con `<label>` asociado, no solo `placeholder`.
- **El color nunca es la única señal.** Acompáñalo de texto, icono o forma; contraste mínimo
  4.5:1 en texto normal.
- Los errores de un formulario se anuncian y se asocian al campo, no solo se pintan de rojo.
- Nada de texto en tamaño fijo que impida hacer zoom, ni contenido que se rompa al 200%.
- Respeta `prefers-reduced-motion`: no todo el mundo tolera las animaciones.
