import { Editor } from "./_ui/editor";
import { seccion, tenue, tituloSeccion } from "./_ui/estilos";

export default function Pagina() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:pt-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Formato para LinkedIn</h1>
        <p className={`mt-1 ${tenue}`}>
          Pega tu post, destaca lo que quieras y cópialo tal cual a LinkedIn. El texto no sale de este navegador.
        </p>
      </header>

      <Editor />

      <section className={seccion} aria-labelledby="como-se-usa">
        <h2 id="como-se-usa" className={tituloSeccion}>
          Cómo se usa
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          <li>
            Haz doble clic en una palabra (o selecciona un trozo) y pulsa un botón de formato. Pulsarlo otra vez lo
            quita.
          </li>
          <li>Con el cursor sobre una palabra, sin seleccionar nada, el formato se aplica a esa palabra.</li>
          <li>
            Atajos: <kbd>Ctrl/⌘ + B</kbd> negrita, <kbd>Ctrl/⌘ + I</kbd> cursiva, <kbd>Ctrl/⌘ + U</kbd> subrayado,{" "}
            <kbd>Ctrl/⌘ + Mayús + X</kbd> tachado y <kbd>Ctrl/⌘ + Z</kbd> para deshacer.
          </li>
          <li>Los enlaces, #hashtags y @menciones se quedan siempre sin formato, para que sigan funcionando.</li>
          <li>El borrador se guarda en este navegador: puedes cerrar la pestaña y seguir luego.</li>
        </ul>
      </section>

      <section className={seccion} aria-labelledby="antes-de-publicar">
        <h2 id="antes-de-publicar" className={tituloSeccion}>
          Antes de publicar
        </h2>
        <ul className={`list-disc space-y-1.5 pl-5 text-sm ${tenue}`}>
          <li>
            LinkedIn no tiene negrita de verdad: son otros caracteres que se parecen a las letras. Un lector de
            pantalla los lee mal o se los salta, y el buscador de LinkedIn no encuentra esas palabras.
          </li>
          <li>Por eso conviene usarlos solo en unas pocas palabras clave, nunca en párrafos enteros.</li>
          <li>Cada letra con formato cuenta como dos caracteres para el tope de 3000.</li>
        </ul>
      </section>
    </main>
  );
}
