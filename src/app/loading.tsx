export default function Loading() {
  return (
    <div className="min-h-screen bg-michket-white">
      {/* Hero skeleton */}
      <div className="w-full bg-michket-black animate-pulse">
        <div className="michket-container py-20 sm:py-28">
          <div className="max-w-xl space-y-4">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-8 w-80 bg-white/10 rounded" />
            <div className="h-4 w-64 bg-white/10 rounded" />
            <div className="h-10 w-36 bg-white/10 rounded mt-6" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="michket-container py-12 sm:py-16">
        <div className="space-y-8">
          {/* Section header */}
          <div className="text-center space-y-2">
            <div className="h-3 w-20 bg-michket-ivory mx-auto rounded animate-pulse" />
            <div className="h-6 w-48 bg-michket-ivory mx-auto rounded animate-pulse" />
          </div>

          {/* Product grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-michket-cream rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-michket-ivory rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-michket-ivory rounded animate-pulse" />
                  <div className="h-4 w-20 bg-michket-ivory rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
