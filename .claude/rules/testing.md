# Tests

Los tests son lo que sustituye a la revisión humana del código. No son un trámite: son el
contrato de que lo que hiciste hace lo que dice.

- **Si tocas lógica, deja tests que la cubran.** Si el proyecto aún no tiene tests, añade el
  mínimo para lo que has cambiado (y monta el runner si hace falta).
- Prueba **comportamiento, no implementación**: qué entra, qué sale, qué pasa en los bordes.
  Un test que solo comprueba que se llamó a una función se rompe en cada refactor y no protege
  de nada.
- Cubre primero donde un fallo silencioso haría daño: cálculos, transformaciones de datos,
  validaciones, permisos y control de acceso, y los límites (vacío, nulo, cero, negativo,
  duplicado, muy grande).
- **Un test que no puede fallar no vale.** Antes de darlo por bueno, comprueba que falla si
  rompes a propósito lo que prueba. Esa es la idea de los tests de mutación: si puedes cambiar
  el código y la suite sigue en verde, la red no sujeta nada. Vale para escribir tests y para
  juzgar los que ya existen.
- **La cobertura mide qué se ejecuta, no qué se comprueba.** Un test sin aserciones útiles da
  100% de cobertura y cero garantías: la cobertura es el suelo, no la prueba de que algo está bien.
- Nada de tests que dependan del reloj, de la red o del orden de ejecución: si hoy pasan y
  mañana no sin que nadie toque nada, terminarán ignorados.
- Nombres en español y descriptivos: se leen cuando algo falla, muchas veces meses después.

## Antes de dar por hecha una funcionalidad, mira la cobertura

Es el último paso de cada tarea, no un extra: **pasa el informe de cobertura y mira las líneas
que has añadido o tocado**. Lo que acabas de escribir tiene que quedar al 100%; si hay ramas,
guardas o casos de error sin ejecutar por ningún test, escribe los tests unitarios que faltan
antes de decir que está.

- El número que importa es **el de lo nuevo**, no el global del proyecto. Que el total suba o
  baje unas décimas da igual; que una rama que acabas de introducir no la ejecute nadie, no.
- Cada hueco se cierra con un test **que compruebe algo**, no con uno que solo recorra la línea.
  Si al escribirlo ves que no hay nada que afirmar, sobra el código, no el test.
- Si de verdad hay algo que no se puede cubrir con un test unitario (arranca un proceso, abre
  un navegador, habla con un servicio externo), **dilo en el resumen de la tarea** y explica
  con qué se comprueba en su lugar. Callarlo es lo único que no vale.
- Si el proyecto no mide cobertura todavía, móntala en la misma tarea: sin informe no hay nada
  que revisar, y este paso se convierte en una frase vacía.
