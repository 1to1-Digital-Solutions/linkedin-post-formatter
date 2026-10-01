# Dependencias

Cada paquete que entra se queda: pesa, hay que actualizarlo y amplía la superficie de ataque.

- **Primero mira si ya está resuelto**: en la plataforma (Node, el navegador, el framework) o en
  algo que el repo ya usa. La mitad de las dependencias pequeñas son una función de diez líneas.
- Si hace falta una nueva, **dilo explícitamente en tu resumen y explica por qué**. No la
  cueles en el diff: se integra, pero queda registrada en el changelog que se revisa antes de
  publicar. (Que el paquete sea el oficial lo pide la regla de seguridad.)
- Criterios mínimos antes de proponerla: mantenida, con uso real, licencia compatible, sin
  arrastrar medio ecosistema detrás.
- **No actualices versiones "de paso"** mientras haces otra cosa: una subida de versión es su
  propia tarea, con su propia verificación.
- No toques el gestor de paquetes ni el lockfile a mano. Usa el que ya use el proyecto y
  commitea el lockfile que genere.
- Nada de dependencias solo para tests que ya se pueden escribir con lo que hay.
