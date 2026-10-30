/** Skeleton shown while an admin page loads its data. */
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse">
      <div className="h-9 w-48 rounded-lg bg-line" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-line" />
        ))}
      </div>
      <div className="mt-8 h-64 rounded-2xl bg-line" />
    </div>
  );
}
