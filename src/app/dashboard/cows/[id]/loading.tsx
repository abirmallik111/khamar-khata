export default function CowProfileLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-(--color-surface-high) rounded w-48"></div>
        <div className="h-10 bg-(--color-surface-high) rounded-full w-24"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-96 bg-(--color-surface-lowest) rounded-md shadow-ambient"></div>
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="h-64 bg-(--color-surface-lowest) rounded-md shadow-ambient"></div>
          <div className="h-64 bg-(--color-surface-lowest) rounded-md shadow-ambient"></div>
        </div>
      </div>
    </div>
  )
}
