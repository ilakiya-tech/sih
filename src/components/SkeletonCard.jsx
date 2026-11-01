export default function SkeletonCard() {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 bg-slate-200 rounded w-2/3"></div>
            <div className="h-5 bg-slate-200 rounded w-16"></div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            <div className="h-4 bg-slate-200 rounded w-16"></div>
          </div>
        </div>
        <div className="ml-3 h-8 w-8 bg-slate-200 rounded-full"></div>
      </div>

      <div className="space-y-3 mb-4 mt-6">
        <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-slate-200 rounded-full w-20"></div>
          <div className="h-6 bg-slate-200 rounded-full w-24"></div>
          <div className="h-6 bg-slate-200 rounded-full w-16"></div>
        </div>
      </div>

      <div className="mb-4 mt-6 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-full"></div>
        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        <div className="h-3 bg-slate-200 rounded w-4/6"></div>
      </div>

      <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
        <div className="h-9 bg-slate-200 rounded-xl w-36"></div>
        <div className="h-9 bg-slate-200 rounded-xl flex-1"></div>
      </div>
    </article>
  )
}
