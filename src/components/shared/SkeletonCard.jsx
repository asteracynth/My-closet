export default function SkeletonCard({ count = 1 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="card overflow-hidden animate-pulse">
      <div className="aspect-square bg-lavender-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 rounded bg-lavender-100 w-3/4" />
        <div className="h-3 rounded bg-lavender-50 w-1/2" />
      </div>
    </div>
  ));
}

export function SkeletonRow({ count = 3 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="card p-4 flex gap-3 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-lavender-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded bg-lavender-100 w-1/3" />
        <div className="h-3 rounded bg-lavender-50 w-1/2" />
      </div>
    </div>
  ));
}
