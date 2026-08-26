import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-michket-white flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="font-display text-6xl sm:text-8xl text-michket-gold mb-4">
          404
        </h1>
        <h2 className="font-display text-xl sm:text-2xl text-michket-black mb-3">
          Page introuvable
        </h2>
        <p className="text-sm text-michket-charcoal/60 mb-8 max-w-md mx-auto">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
          Découvrez nos créations artisanales sur notre boutique.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-michket-gold text-white text-sm font-semibold hover:bg-michket-gold-dark transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/collections/all"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-michket-gold text-michket-gold text-sm font-semibold hover:bg-michket-gold/5 transition-colors"
          >
            Voir les collections
          </Link>
        </div>
      </div>
    </main>
  );
}
