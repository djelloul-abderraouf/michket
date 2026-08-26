export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-michket-white">
      <div className="michket-container py-4">
        {/* Breadcrumb skeleton */}
        <div className="flex gap-2">
          <div className="h-3 w-12 bg-michket-ivory rounded animate-pulse" />
          <div className="h-3 w-3 bg-michket-ivory rounded animate-pulse" />
          <div className="h-3 w-20 bg-michket-ivory rounded animate-pulse" />
          <div className="h-3 w-3 bg-michket-ivory rounded animate-pulse" />
          <div className="h-3 w-32 bg-michket-ivory rounded animate-pulse" />
        </div>
      </div>

      <div className="michket-container pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-michket-cream rounded animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-16 h-16 bg-michket-cream rounded animate-pulse" />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="space-y-4">
            <div className="h-5 w-20 bg-michket-ivory rounded animate-pulse" />
            <div className="h-8 w-64 bg-michket-ivory rounded animate-pulse" />
            <div className="h-3 w-24 bg-michket-ivory rounded animate-pulse" />
            <div className="h-6 w-32 bg-michket-ivory rounded animate-pulse mt-4" />
            <div className="flex gap-1 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-michket-ivory rounded animate-pulse" />
              ))}
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-3 w-full bg-michket-ivory rounded animate-pulse" />
              <div className="h-3 w-full bg-michket-ivory rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-michket-ivory rounded animate-pulse" />
            </div>
            <div className="h-12 w-full bg-michket-gold/20 rounded animate-pulse mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
