"use client";

import { useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent, type SyntheticEvent } from "react";

import { alternar, estilosActivos, quitarFormato, type Cambio } from "@/lib/formato/aplicar";
import type { Estilo } from "@/lib/formato/glifos";
import { caracteresUsados, LIMITE_DEL_POST } from "@/lib/formato/limite";
import { markdownAUnicode } from "@/lib/formato/markdown";

import { guardarBorrador, useBorrador } from "./borrador";
import { escribir } from "./escribir";
import { boton, botonDeFormato, botonPrimario, casilla, tenue } from "./estilos";

/** Cada botón enseña su estilo con CSS; el nombre es lo que lee un lector de pantalla. */
const BOTONES: { estilo: Estilo; nombre: string; clase: string; atajo?: string; teclas?: string }[] = [
  { estilo: "negrita", nombre: "Negrita", clase: "font-bold", atajo: "Ctrl/⌘ + B", teclas: "Control+B Meta+B" },
  { estilo: "cursiva", nombre: "Cursiva", clase: "italic", atajo: "Ctrl/⌘ + I", teclas: "Control+I Meta+I" },
  { estilo: "tachado", nombre: "Tachado", clase: "line-through", atajo: "Ctrl/⌘ + Mayús + X", teclas: "Control+Shift+X Meta+Shift+X" },
  { estilo: "subrayado", nombre: "Subrayado", clase: "underline", atajo: "Ctrl/⌘ + U", teclas: "Control+U Meta+U" },
  { estilo: "mono", nombre: "Código", clase: "font-mono" },
];

const ATAJOS: Record<string, Estilo> = { b: "negrita", i: "cursiva", u: "subrayado" };

const SIN_NADA_QUE_FORMATEAR =
  "Ahí no hay nada a lo que dar formato. Selecciona una palabra o pon el cursor sobre ella. Los enlaces, #hashtags y @menciones se quedan siempre sin formato para que sigan funcionando.";

export function Editor() {
  const texto = useBorrador();
  const area = useRef<HTMLTextAreaElement>(null);
  const [seleccion, setSeleccion] = useState({ inicio: 0, fin: 0 });
  const [tildes, setTildes] = useState(true);
  const [convertirAlPegar, setConvertirAlPegar] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const activos = useMemo(() => estilosActivos(texto, seleccion, { tildes }), [texto, seleccion, tildes]);
  const usados = caracteresUsados(texto);
  const sobran = usados - LIMITE_DEL_POST;

  function seleccionActual(campo: HTMLTextAreaElement) {
    return { inicio: campo.selectionStart, fin: campo.selectionEnd };
  }

  /** Lleva un cambio al campo y deja la selección donde toca; si no cambió nada, lo dice. */
  function aplicar(cambio: Cambio, sinEfecto: string) {
    const campo = area.current;
    if (!campo) return;
    campo.focus();
    if (!cambio.cambiado) {
      setMensaje(sinEfecto);
      return;
    }
    escribir(campo, cambio.texto);
    campo.setSelectionRange(cambio.seleccion.inicio, cambio.seleccion.fin);
    setSeleccion(cambio.seleccion);
    setMensaje("");
  }

  function darEstilo(estilo: Estilo) {
    const campo = area.current;
    if (!campo) return;
    aplicar(alternar(campo.value, seleccionActual(campo), estilo, { tildes }), SIN_NADA_QUE_FORMATEAR);
  }

  function limpiar() {
    const campo = area.current;
    if (!campo) return;
    aplicar(quitarFormato(campo.value, seleccionActual(campo)), "Ahí no hay formato que quitar.");
  }

  /** Reemplaza todo el texto y deja el cursor al final. */
  function reemplazarTodo(nuevo: string, sinEfecto: string) {
    const campo = area.current;
    if (!campo) return;
    const alFinal = { inicio: nuevo.length, fin: nuevo.length };
    aplicar({ texto: nuevo, seleccion: alFinal, cambiado: nuevo !== campo.value }, sinEfecto);
  }

  function alTeclear(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (!(evento.metaKey || evento.ctrlKey) || evento.altKey) return;
    const tecla = evento.key.toLowerCase();
    const estilo = evento.shiftKey ? (tecla === "x" ? "tachado" : undefined) : ATAJOS[tecla];
    if (!estilo) return;
    evento.preventDefault();
    darEstilo(estilo);
  }

  function alPegar(evento: ClipboardEvent<HTMLTextAreaElement>) {
    const pegado = evento.clipboardData.getData("text/plain");
    if (!convertirAlPegar || pegado === "") return;
    evento.preventDefault();
    const campo = evento.currentTarget;
    const convertido = markdownAUnicode(pegado, { tildes });
    const cursor = campo.selectionStart + convertido.length;
    const nuevo = campo.value.slice(0, campo.selectionStart) + convertido + campo.value.slice(campo.selectionEnd);
    aplicar({ texto: nuevo, seleccion: { inicio: cursor, fin: cursor }, cambiado: true }, "");
  }

  function alSeleccionar(evento: SyntheticEvent<HTMLTextAreaElement>) {
    setSeleccion(seleccionActual(evento.currentTarget));
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setMensaje("Copiado. Ya puedes pegarlo en LinkedIn.");
    } catch {
      // Sin permiso para el portapapeles, queda el camino manual: todo seleccionado y a un atajo.
      area.current?.focus();
      area.current?.select();
      setMensaje("No se ha podido copiar automáticamente. El texto está seleccionado: cópialo con Ctrl/⌘ + C.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-borde bg-superficie shadow-sm">
        <div
          role="toolbar"
          aria-label="Formato del texto"
          aria-controls="post"
          className="sticky top-0 z-10 flex flex-wrap gap-2 rounded-t-lg border-b border-borde bg-superficie p-2 pt-[max(0.5rem,env(safe-area-inset-top))]"
        >
          {BOTONES.map(({ estilo, nombre, clase, atajo, teclas }) => (
            <button
              key={estilo}
              type="button"
              className={botonDeFormato}
              aria-pressed={activos[estilo]}
              aria-keyshortcuts={teclas}
              title={atajo ? `${nombre} (${atajo})` : nombre}
              // Que el clic no le quite el foco al texto: la selección sigue a la vista.
              onMouseDown={(evento) => evento.preventDefault()}
              onClick={() => darEstilo(estilo)}
            >
              <span className={clase}>{nombre}</span>
            </button>
          ))}
          <button type="button" className={boton} onMouseDown={(evento) => evento.preventDefault()} onClick={limpiar}>
            Quitar formato
          </button>
          <button
            type="button"
            className={`${boton} sm:ml-auto`}
            title="Convierte el Markdown de todo el texto: **negrita**, *cursiva*, ~~tachado~~, `código`, títulos y viñetas"
            onMouseDown={(evento) => evento.preventDefault()}
            onClick={() =>
              reemplazarTodo(markdownAUnicode(texto, { tildes }), "No hay Markdown que convertir en el texto.")
            }
          >
            Convertir Markdown
          </button>
        </div>

        <label htmlFor="post" className="sr-only">
          Tu post
        </label>
        <textarea
          id="post"
          ref={area}
          value={texto}
          onChange={(evento) => {
            guardarBorrador(evento.target.value);
            setMensaje("");
          }}
          onSelect={alSeleccionar}
          onKeyDown={alTeclear}
          onPaste={alPegar}
          placeholder="Pega aquí tu post, con su Markdown si lo trae. Luego haz doble clic en una palabra y pulsa Negrita."
          spellCheck
          lang="es"
          rows={14}
          aria-describedby="contador"
          className="block min-h-[45dvh] w-full resize-y bg-campo px-4 py-3 text-base leading-relaxed text-texto -outline-offset-2 placeholder:text-tenue"
        />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-b-lg border-t border-borde p-2 pl-4">
          <p id="contador" className={`text-sm ${sobran > 0 ? "font-semibold text-peligro" : tenue}`}>
            {usados} de {LIMITE_DEL_POST} caracteres
            {sobran > 0 && ` · sobran ${sobran}: LinkedIn no dejará publicarlo`}
          </p>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              className={boton}
              disabled={texto === ""}
              onClick={() => {
                reemplazarTodo("", "");
                setMensaje("Texto borrado. Si ha sido sin querer, deshazlo con Ctrl/⌘ + Z.");
              }}
            >
              Vaciar
            </button>
            <button type="button" className={botonPrimario} disabled={texto === ""} onClick={copiar}>
              Copiar para LinkedIn
            </button>
          </div>
        </div>
      </div>

      <p role="status" className="min-h-5 text-sm">
        {mensaje}
      </p>

      <fieldset className="rounded-lg border border-borde bg-superficie px-4 py-3">
        <legend className="px-1 text-sm font-semibold">Opciones</legend>
        <label className={casilla}>
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-primario"
            checked={convertirAlPegar}
            onChange={(evento) => setConvertirAlPegar(evento.target.checked)}
          />
          <span>
            Convertir el Markdown al pegar
            <span className={`block ${tenue}`}>
              Lo que pegues con <code>**negrita**</code>, <code>*cursiva*</code>, <code>~~tachado~~</code>, títulos o
              viñetas entra ya convertido.
            </span>
          </span>
        </label>
        <label className={casilla}>
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-primario"
            checked={tildes}
            onChange={(evento) => setTildes(evento.target.checked)}
          />
          <span>
            Dar formato también a las letras con tilde y a la ñ
            <span className={`block ${tenue}`}>
              Se escriben como la letra con formato más su tilde. Si en algún dispositivo la tilde se ve descolocada,
              desmárcalo y esas letras se quedarán en texto normal.
            </span>
          </span>
        </label>
      </fieldset>
    </div>
  );
}
