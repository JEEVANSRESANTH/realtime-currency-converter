const Skeleton = ({ className = "", count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${className}`} />
      ))}
    </>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    <div className="flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="skeleton h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="skeleton h-10 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const ConverterSkeleton = () => (
  <div className="glass rounded-2xl p-8 space-y-6 max-w-xl mx-auto">
    <div className="skeleton h-8 w-56 mx-auto" />
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <div className="skeleton h-4 w-16" />
        <div className="skeleton h-12 w-full" />
      </div>
      <div className="flex items-center justify-center">
        <div className="skeleton h-10 w-10 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-16" />
        <div className="skeleton h-12 w-full" />
      </div>
    </div>
    <div className="skeleton h-12 w-full" />
    <div className="skeleton h-12 w-32 ml-auto" />
  </div>
);

export default Skeleton;
