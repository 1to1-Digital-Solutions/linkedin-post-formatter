# Procesos de larga vida

Levantar el juego en un navegador es la única forma de comprobar algunas cosas —que la música
suena, que el aro cae donde debe, que el menú se ve—, así que se hace. Lo que no puede pasar es
dejarlo levantado.

**Un `next dev` de un juego con three.js son ~1,6 GB.** Con trece repos, olvidar uno por repo son
veintiún gigas. Ya ocurrió: se agotó la memoria de la máquina, hubo que forzar la salida de la
terminal y se perdió la conversación entera, con el trabajo a medias y sin commitear.

## Reglas

- **Uno cada vez.** Levanta un servidor, comprueba lo que ibas a comprobar, mátalo. No dejes tres
  abiertos «por si acaso»: volver a arrancarlo cuesta segundos.
- **Mátalo por el puerto, no por el nombre.** `pkill -f next-server` **no** caza `next start`, que
  se llama distinto, ni los navegadores que deja Playwright. El puerto se queda ocupado y el
  siguiente arranque falla con un `EADDRINUSE` que parece otra cosa:

  ```bash
  lsof -ti :3200 | xargs -r kill -9
  ```

- **Antes de terminar, comprueba que no queda nada tuyo.** Desde Organízate:

  ```bash
  ./scripts/procesos.sh          # lista lo que hay suelto por los repos, con su memoria
  ./scripts/procesos.sh --matar  # lo mata
  ```

  Sin argumentos solo mira. Nunca toca Docker ni los procesos de la propia sesión.

- **Los navegadores también cuentan.** Un script de Playwright que se corta a medias deja el
  navegador abierto. Cierra siempre en un `finally`, o pásale un tiempo límite.

- **Puertos distintos por repo.** Cada juego tiene el suyo en su `package.json` (`PORT`). Si
  necesitas dos a la vez, dales puertos distintos en vez de reutilizar uno: así `lsof -ti :<puerto>`
  sigue diciendo qué mataste.

## Qué no hace falta matar

El stack de Supabase (Docker, puertos 54321-54324) y la app de Organízate que el usuario tenga
levantada a mano. Ninguno de los dos es tuyo.
