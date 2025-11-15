export default function LayoutShell({ sidebar, topbar, children }) {
  return (
    <div className="flex h-screen w-screen bg-slate-100">
      {sidebar}

      <div className="flex flex-col flex-1 overflow-hidden">
        {topbar}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}