export default function CowsLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-(--color-surface-high) rounded w-48"></div>
        <div className="h-10 bg-(--color-surface-high) rounded-full w-32"></div>
      </div>
      <div className="h-12 bg-(--color-surface-high) rounded-md"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-(--color-surface-lowest) rounded-md shadow-ambient"></div>
        ))}
      </div>
    </div>
  )
}
