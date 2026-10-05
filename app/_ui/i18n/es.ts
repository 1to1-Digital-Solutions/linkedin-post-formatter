import type { Messages } from "./en";

export const es: Messages = {
  title: "Formato para posts de LinkedIn",
  tagline: "Pega tu post, destaca lo que importa y cópialo en LinkedIn. Nada sale de tu navegador.",
  language: "Idioma",
  theme: { toLight: "Cambiar al tema claro", toDark: "Cambiar al tema oscuro" },

  toolbar: "Formato del texto",
  styles: { bold: "Negrita", italic: "Cursiva", strike: "Tachado", underline: "Subrayado", mono: "Código" },
  lists: {
    menu: "Lista",
    bullet: "Viñetas",
    dash: "Guiones",
    arrow: "Flechas",
    check: "Marcas de verificación",
    pointing: "Manos señalando",
    diamond: "Rombos",
    numbered: "Números",
    keycap: "Números en emoji",
  },
  emoji: { button: "Emoji", dialog: "Elige un emoji" },
  shortcutHint: (name, keys) => `${name} (${keys})`,

  post: "Tu post",
  placeholder: "Pega aquí tu post, con su Markdown si lo trae. Luego haz doble clic en una palabra y pulsa Negrita.",
  counter: (used, limit) => `${used} / ${limit} caracteres`,
  over: (count) => `sobran ${count}: LinkedIn no lo publicará`,
  clear: "Vaciar",
  copy: "Copiar para LinkedIn",

  messages: {
    nothingToFormat:
      "Ahí no hay nada a lo que dar formato. Selecciona una palabra o pon el cursor sobre ella. Los enlaces, #hashtags y @menciones se quedan siempre sin formato para que sigan funcionando.",
    noList: "Ahí no hay nada que convertir en lista.",
    copied: "Copiado. Pégalo en LinkedIn.",
    copyFailed: "No se ha podido copiar automáticamente. El texto está seleccionado: cópialo con Ctrl/⌘ + C.",
    cleared: "Texto borrado. Si ha sido sin querer, deshazlo con Ctrl/⌘ + Z.",
  },

  preview: {
    heading: "Antes del «…ver más»",
    device: "Dispositivo de la vista previa",
    desktop: "Escritorio",
    mobile: "Móvil",
    empty: "El principio de tu post, tal y como lo mostrará el feed.",
    more: "…ver más",
    shows: (visible, behind) => `Se ven ${visible} caracteres; ${behind} quedan detrás del «…ver más».`,
    full: "Se ve entero, sin «…ver más».",
    approximate: (characters, lines) =>
      `Aproximado: LinkedIn corta en unos ${characters} caracteres o ${lines} líneas, lo que llegue antes.`,
  },

  options: {
    legend: "Opciones",
    about: (name) => `Sobre «${name}»`,
    convertOnPaste: "Convertir Markdown al pegar",
    convertOnPasteHelp:
      "Lo que pegues con **negrita**, *cursiva*, ~~tachado~~, `código`, títulos o viñetas entra ya convertido. Desactívalo para pegar el texto tal cual.",
    accents: "Dar formato a las letras con tilde",
    accentsHelp:
      "Letras como á, ñ o ü no tienen gemela en negrita en Unicode, así que se escriben como la letra con formato más una tilde combinante. Si algún dispositivo muestra la tilde descolocada, desactívalo y esas letras se quedan normales.",
  },

  help: {
    summary: "Cómo funciona y avisos",
    usage: [
      "Haz doble clic en una palabra (o selecciona un trozo de texto) y pulsa un botón de formato. Pulsarlo otra vez lo quita.",
      "Con el cursor sobre una palabra y nada seleccionado, el formato se aplica a esa palabra.",
      "El menú Lista pone un marcador (viñetas, flechas, marcas, números…) en las líneas seleccionadas; Intro continúa la lista e Intro en un elemento vacío la termina. Elegir el mismo marcador otra vez lo quita.",
      "Los enlaces, #hashtags y @menciones se quedan siempre sin formato para que LinkedIn los siga reconociendo.",
      "El borrador se guarda solo en este navegador. No se envía a ningún sitio.",
    ],
    shortcuts: "Atajos:",
    shortcutList: [
      ["Ctrl/⌘ + B", "negrita"],
      ["Ctrl/⌘ + I", "cursiva"],
      ["Ctrl/⌘ + U", "subrayado"],
      ["Ctrl/⌘ + Mayús + X", "tachado"],
      ["Ctrl/⌘ + Z", "deshacer"],
    ],
    caveats: [
      "LinkedIn no tiene negrita de verdad: son otros caracteres Unicode que se parecen a las letras. Los lectores de pantalla los leen mal o se los saltan, y el buscador de LinkedIn no encuentra esas palabras. Úsalos en unas pocas palabras clave, nunca en párrafos enteros.",
      "Cada letra con formato cuenta como dos caracteres para el límite de 3000.",
    ],
  },

  footer: { madeBy: "Hecho por César Peón · 1to1 Digital Solutions", links: "Enlaces del autor", source: "Código fuente" },
};
