import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";
import NewProjectPopup from "./NewProjectPopup";

export default function ProjectsBar({
  setActivePage,
  setSelectedProject,
  setSelectedConversation,
  auth0Id,
}) {
  const [projects, setProjects] = useState([]);
  const [openProjectId, setOpenProjectId] = useState(null);

  useEffect(() => {
    apiClient
      .get("/projects/", { params: { auth0Id } })
      .then((res) => {
        setProjects(res.data.projects);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
  if (projects.length === 0) return;

  projects.forEach((project, index) => {
    apiClient
      .get("/projects/conversations", {
        params: { projectId: project._id },
      })
      .then((res) => {
        setProjects((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            conversations: res.data,
          };
          return updated;
        });
      })
      .catch((err) => console.log(err));
  });
}, [projects.length]);

  // Determine what conversations the user may access
  const getAllowedConversations = (project) => {
  if (!project) return [];

  const me = project.members?.find((m) => m.userId === auth0Id);
  if (!me) return [];

  const myRole = me.role;

  const conversations = Array.isArray(project.conversations)
    ? project.conversations
    : [];

  return conversations.filter((conv) => {
    const restricted = conv.restrictedToRoles;

    if (!Array.isArray(restricted) || restricted.length === 0) {
      return true; // no restriction => visible to everyone
    }

    return restricted.includes(myRole);
  });
};


  // ⭐ NEW — handle project click
  const handleProjectClick = (project, isOpen) => {
    // Select this project globally
    setSelectedProject(project);
    setSelectedConversation(null);

    // Navigate to To-Do page
    setActivePage("todo");

    // Toggle dropdown open/close
    setOpenProjectId(isOpen ? null : project._id);
  };

  return (
    <div className="flex flex-col gap-2 justify-between h-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold mb-2">Your Projects</h2>

        {projects.map((project) => {
          console.log("**************", project);
          const isOpen = openProjectId === project._id;
          const allowedConvs = getAllowedConversations(project);

          return (
            <div key={project._id} className="flex flex-col">
              {/* Project button */}
              <button
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 transition font-medium"
                onClick={() => handleProjectClick(project, isOpen)}
              >
                {project.title}
              </button>

              {/* Dropdown conversations list */}
              {isOpen && (
                <div className="ml-3 mt-1 flex flex-col gap-1 border-l pl-2">
                  {allowedConvs?.length === 0 && (
                    <div className="text-sm text-gray-400 italic">
                      No conversations available
                    </div>
                  )}

                  {allowedConvs?.map((conv) => (
                    <button
                      key={conv._id}
                      className="text-left p-1 rounded hover:bg-slate-200 text-sm"
                      onClick={() => {
                        setSelectedProject(project);
                        setSelectedConversation(conv);
                        setActivePage("conversations");
                      }}
                    >
                      {conv.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <NewProjectPopup auth0Id={auth0Id} />
    </div>
  );
}
