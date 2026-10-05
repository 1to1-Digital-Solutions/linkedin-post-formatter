# Historial — por qué está esto así

No se lee al empezar una sesión: solo cuando la pregunta es «por qué está esto así».

## El research de partida: cómo se da «formato» en LinkedIn

**LinkedIn no tiene formato.** El editor de posts guarda texto plano: descarta el HTML y no
interpreta Markdown. Por eso la negrita de Obsidian se pierde al pegar.

**Lo que hacen todas las webs de «LinkedIn text formatter»** es lo mismo, y es sencillo: cambian
cada letra por otra que se le parece.

- **Negrita, cursiva, monoespaciado**: letras del bloque Unicode *Mathematical Alphanumeric
  Symbols* (U+1D400–U+1D7FF), pensado para fórmulas. Hay alfabetos con serifa, de palo seco,
  caligráficos, góticos… Los que parecen «texto normal en negrita» en el feed son los de palo
  seco: negrita desde U+1D5D4, cursiva desde U+1D608, negrita cursiva desde U+1D63C,
  monoespaciado desde U+1D670; cifras en negrita desde U+1D7EC y monoespaciadas desde U+1D7F6.
  No existen cifras en cursiva.
- **Tachado y subrayado**: una marca combinante detrás de cada carácter (U+0336 y U+0332).
- **Tildes y ñ**: no tienen gemela en ese bloque. Las herramientas malas las dejan en letra
  normal y la palabra queda a medias (`𝗰𝗮𝗺𝗶ó𝗻`); las buenas descomponen la letra (NFD) y escriben
  la letra con estilo seguida de la tilde combinante (`𝗼` + U+0301).
- **Hashtags, menciones y enlaces**: con letras de otro alfabeto dejan de funcionar; las
  herramientas cuidadas los dejan sin formato.

**Las pegas, que son de la técnica y no de la herramienta:**

- **Accesibilidad**: un lector de pantalla lee «mathematical sans-serif bold small a» letra a
  letra, o se salta el texto.
- **Búsqueda**: para el buscador de LinkedIn esas palabras no son palabras.
- **Recuento**: LinkedIn cuenta el tope de 3000 en unidades UTF-16 y cada letra con estilo
  ocupa dos (dato de la documentación para desarrolladores de Buffer).
- **Render**: en dispositivos sin fuente para ese bloque salen cuadrados. Hoy es raro; lo que
  puede variar es dónde cae la tilde combinante.
- De ahí la recomendación común: formato solo en unas pocas palabras ancla y en el gancho,
  nunca en párrafos.

Fuentes consultadas: la guía de formato Unicode de linkedinpreview.com, el formateador de
jasperbernaers.com (el más completo: convierte Markdown, protege hashtags y enlaces, da estilo a
las tildes), los de tryordinal.com, socialrails.com, spurnow.com y supergrow.ai, y la guía de
límites de caracteres de developers.buffer.com.

## Decisiones

- **El editor es un `<textarea>` cuyo contenido ya es el texto final.** Lo que se ve es lo que
  se copia; no hay un modelo de documento aparte ni un paso de «exportar». Dar formato es
  reescribir los caracteres seleccionados. La alternativa (un editor `contentEditable` con
  negrita de verdad que se convierte al copiar) es mucho más código y peor accesibilidad para
  el mismo resultado.
- **Los estilos se leen del propio texto** (`descomponer` en `glifos.ts`): por eso el botón
  sabe si la selección ya está en negrita y la quita, y por eso se puede pegar texto ya
  formateado y seguir editándolo.
- **Solo alfabetos de palo seco.** No tienen huecos (en los de serifa, la `h` cursiva vive en
  otro bloque) y son los que se leen como negrita y cursiva corrientes. Los demás (serifa,
  caligráfica…) solo se reconocen para poder limpiarlos con «Quitar formato» (NFKC).
- **Las tildes llevan formato por defecto**, con una opción para dejarlas en letra normal por si
  algún dispositivo coloca mal la marca combinante. En Chrome de macOS se ven bien; en las apps
  de LinkedIn de Android e iOS está por comprobar.
- **Enlaces, correos, #hashtags y @menciones nunca llevan formato**, ni al convertir Markdown ni
  a mano. «Quitar formato» sí actúa sobre ellos, para arreglar los que llegaron rotos.
- **Markdown: se convierte lo que tiene equivalente** y lo demás se queda como está escrito
  (citas, listas numeradas, imágenes, tablas). Los saltos de línea se respetan todos. Los
  enlaces pasan a `texto (url)` porque LinkedIn solo enlaza direcciones a la vista.
- **Los cambios se «teclean» con `execCommand("insertText")`** sobre el trozo mínimo que cambia
  (`diferencia.ts`). Está obsoleto, pero es lo único que conserva el deshacer del navegador en
  un `<textarea>`; hay camino alternativo si falla.
- **Sin servidor.** No hay nada que guardar ni proteger: página estática, borrador en
  `localStorage`, CSP que impide cargar nada de fuera. La URL es pública pero lleva `noindex`.
- **La vista previa del «…más» es una aproximación declarada.** LinkedIn corta por caracteres o
  por líneas, lo que llegue antes, y lo cambia sin avisar: las guías y los contadores de otras
  herramientas coinciden en unos 210 caracteres o 5 líneas en escritorio y 140 o 3 en móvil
  (authoredup.com, linkedgrow.ai, el artículo de Medium sobre el corte de 210). El corte por
  caracteres y por saltos de línea lo calcula `lib/formato/gancho.ts`; las líneas que se
  envuelven por el ancho (555 px en escritorio, 360 en móvil) las corta el CSS (`line-clamp`).
  Por eso la página dice «aproximado» y repite los números.
- **Mismo stack, tokens de color y reglas que el CRM**, para que el repo se trabaje igual que
  los demás de la suite.
