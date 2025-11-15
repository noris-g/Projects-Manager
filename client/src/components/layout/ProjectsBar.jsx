export default function ProjectsSidebar({ setActivePage, setSelectedProject }) {
  const projects = [
    "CRM Redesign",
    "Internal Tools",
    "Marketing Campaign",
    "Website Migration",
  ];

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold mb-2">Your Projects</h2>

      {projects.map((p) => (
        <button
          key={p}
          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 transition"
          onClick={() => {
            if (setSelectedProject) setSelectedProject(p);  // optional
            setActivePage("calendar");                      // SAME as Sidebar
          }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
