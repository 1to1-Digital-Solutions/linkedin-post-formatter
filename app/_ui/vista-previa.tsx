"use client";

import { useState } from "react";

import { CORTES, gancho, type Dispositivo } from "@/lib/formato/gancho";
import { caracteresUsados } from "@/lib/formato/limite";

import { tenue } from "./estilos";

/** Ancho del texto de un post en el feed de LinkedIn y líneas que enseña antes del «…más». */
const DISPOSITIVOS: Record<Dispositivo, { nombre: string; ancho: string; lineas: string }> = {
  escritorio: { nombre: "Escritorio", ancho: "max-w-[555px]", lineas: "line-clamp-5" },
  movil: { nombre: "Móvil", ancho: "max-w-[360px]", lineas: "line-clamp-3" },
};

const opcion =
  "flex min-h-11 cursor-pointer items-center rounded-md border border-borde-campo px-3.5 text-sm font-medium has-[:checked]:border-acento has-[:checked]:bg-acento-suave has-[:checked]:shadow-[inset_0_-3px_0_var(--acento)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foco pointer-fine:min-h-9";

export function VistaPrevia({ texto }: { texto: string }) {
  const [dispositivo, setDispositivo] = useState<Dispositivo>("escritorio");
  const { visible, recortado } = gancho(texto, dispositivo);
  const detras = caracteresUsados(texto.trim()) - caracteresUsados(visible);
  const corte = CORTES[dispositivo];
  const aspecto = DISPOSITIVOS[dispositivo];

  return (
    <section className="rounded-lg border border-borde bg-superficie p-4 sm:p-5" aria-labelledby="vista-previa">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="vista-previa" className="text-base font-semibold">
          Lo que se ve antes del «…más»
        </h2>
        <fieldset className="flex gap-2">
          <legend className="sr-only">Dispositivo de la vista previa</legend>
          {(Object.keys(DISPOSITIVOS) as Dispositivo[]).map((valor) => (
            <label key={valor} className={opcion}>
              <input
                type="radio"
                name="dispositivo"
                value={valor}
                className="sr-only"
                checked={dispositivo === valor}
                onChange={() => setDispositivo(valor)}
              />
              {DISPOSITIVOS[valor].nombre}
            </label>
          ))}
        </fieldset>
      </div>

      <div className={`${aspecto.ancho} rounded-lg border border-borde bg-campo p-3`}>
        <div className="mb-3 flex items-center gap-2" aria-hidden="true">
          <div className="size-10 rounded-full bg-elevada" />
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-28 rounded bg-elevada" />
            <div className="h-2 w-16 rounded bg-elevada" />
          </div>
        </div>
        {texto.trim() === "" ? (
          <p className={`text-sm ${tenue}`}>Aquí verás el principio de tu post tal y como saldrá en el feed.</p>
        ) : (
          <p className={`${aspecto.lineas} text-sm leading-5 whitespace-pre-wrap`}>
            {visible}
            {recortado && <span className={tenue}> …más</span>}
          </p>
        )}
      </div>

      <p className={`mt-3 text-sm ${tenue}`}>
        {recortado
          ? `Se ven ${caracteresUsados(visible)} caracteres; detrás del «…más» quedan ${detras}. `
          : texto.trim() === ""
            ? ""
            : "Se ve entero, sin «…más». "}
        Aproximado: LinkedIn corta en unos {corte.caracteres} caracteres o {corte.lineas} líneas, lo que llegue antes, y
        lo cambia según la app y el ancho de la ventana.
      </p>
    </section>
  );
}
