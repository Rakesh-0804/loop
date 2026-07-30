export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-slate-800">
        Customer Feedback Intelligence
      </h1>

      <div className="flex items-center gap-4">
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          New Feedback
        </button>
      </div>
    </header>
  );
}