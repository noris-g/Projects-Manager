export default function LayoutShell({ sidebar, topbar, projectsbar, children }) {
  return (
    <div className="flex h-screen w-screen bg-slate-100">
      {sidebar}

      {projectsbar && (
        <div className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto">
          {projectsbar}
        </div>
      )}  

      <div className="flex flex-col flex-1 overflow-hidden">
        {topbar}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}