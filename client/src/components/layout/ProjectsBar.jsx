import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";
import NewProjectPopup from "./NewProjectPopup";

export default function ProjectsBar({
  setActivePage,
  setSelectedProject,
  auth0Id,
}) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    apiClient
      .get("/projects/", { params: { auth0Id } })
      .then((res) => {
        setProjects(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="flex flex-col gap-2 justify-between h-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold mb-2">Your Projects</h2>

        {projects.map((p) => (
          <button
            key={p._id}
            className="w-full text-left p-2 rounded-lg hover:bg-slate-100 transition"
            onClick={() => {
              if (setSelectedProject) setSelectedProject(p); // optional
              setActivePage("calendar"); // SAME as Sidebar
            }}
          >
            {p.title}
          </button>
        ))}
      </div>
      <NewProjectPopup auth0Id={auth0Id} />
    </div>
  );
}
