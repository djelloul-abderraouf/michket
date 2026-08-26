"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-michket-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 text-michket-gold">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl text-michket-black mb-3">
          Oups, une erreur est survenue
        </h1>
        <p className="text-sm text-michket-charcoal/60 mb-6">
          Nous nous excusons pour ce désagrément. Veuillez réessayer ou retourner à l&apos;accueil.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-michket-gold text-white text-sm font-semibold hover:bg-michket-gold-dark transition-colors"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="px-5 py-2.5 text-sm font-medium text-michket-charcoal border border-michket-ivory hover:bg-michket-cream transition-colors"
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </div>
  );
}
