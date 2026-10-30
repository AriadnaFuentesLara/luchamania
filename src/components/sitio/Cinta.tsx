const frases = ["Lucha libre en Costa Rica", "Acción desde la tercera cuerda", "¡Viva la lucha tica!", "Máscaras y campeonatos"];

// La franja negra inclinada con frases, de la identidad de marca.
export default function Cinta() {
  return (
    <div aria-hidden="true" className="-rotate-1 overflow-hidden bg-tinta py-3">
      <p className="flex gap-10 whitespace-nowrap px-4 font-display text-xl font-bold uppercase text-marca sm:text-2xl">
        {[...frases, ...frases].map((frase, i) => (
          <span key={i}>★ {frase}</span>
        ))}
      </p>
    </div>
  );
}