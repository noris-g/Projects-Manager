import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";
import NewProjectPopup from "./NewProjectPopup";

export default function ProjectsBar({
  setActivePage,
  setSelectedProject,
  setSelectedConversation,
  auth0Id,
}) {
  const [projects, setProjects] = useState([
    {
      _id: 1,
      title: "Proiect Craciun",
    },
    {
      _id: 2,
      title: "Proiect Iarna",
    },
    {
      _id: 3,
      title: "Proiect Birou",
    },
    {
      _id: 4,
      title: "Proiect Foto",
    },
    {
      _id: 5,
      title: "Proiect Demo",
    },
  ]);
  const [openProjectId, setOpenProjectId] = useState(null);
  const [conversationsLoaded, setConversationsLoaded] = useState(new Set());

  // ✅ FETCH PROJECTS (wait for auth0Id)
  // useEffect(() => {
  //   if (!auth0Id) return;

  //   apiClient
  //     .get("/projects", { params: { auth0Id } })
  //     .then((res) => {
  //       setProjects(res.data.projects);
  //     })
  //     .catch((err) => {
  //       console.log(
  //         "Error loading projects:",
  //         err.response?.data || err.message
  //       );
  //     });
  // }, [auth0Id]);

  // ✅ FIXED: Fetch conversations only for projects that haven't been loaded yet
  // useEffect(() => {
  //   if (projects.length === 0) return;

  //   projects.forEach((project) => {
  //     if (!project?._id) return;

  //     // Skip if already loaded conversations for this project
  //     if (conversationsLoaded.has(project._id)) return;

  //     console.log("😎 fetching convos for project", project._id);
  //     apiClient
  //       .get(`/projects/${project._id}/conversations`)
  //       .then((res) => {
  //         console.log("%%%%%%%%%%%%%%%%%%%%%% conversations:", res.data);

  //         // Mark this project as loaded
  //         setConversationsLoaded((prev) => new Set([...prev, project._id]));

  //         // Update the specific project with its conversations
  //         setProjects((prev) =>
  //           prev.map((p) =>
  //             p._id === project._id ? { ...p, conversations: res.data } : p
  //           )
  //         );
  //       })
  //       .catch((err) =>
  //         console.log(
  //           "Error loading conversations:",
  //           err.response?.data || err.message
  //         )
  //       );
  //   });
  // }, [projects, conversationsLoaded]);

  // ✅ Determine what conversations the user may access
  // const getAllowedConversations = (project) => {
  //   if (!project) return [];

  //   const me = project.members?.find((m) => m.userId === auth0Id);
  //   if (!me) return [];

  //   const myRole = me.role;

  //   const conversations = Array.isArray(project.conversations)
  //     ? project.conversations
  //     : [];

  //   return conversations.filter((conv) => {
  //     const restricted = conv.restrictedToRoles;

  //     // No restriction or empty array => visible to everyone
  //     if (!Array.isArray(restricted) || restricted.length === 0) {
  //       return true;
  //     }

  //     // Check if user's role is in the restricted roles
  //     return restricted.includes(myRole);
  //   });
  // };

  // ⭐ handle project click
  const handleProjectClick = (project, isOpen) => {
    setSelectedProject(project);
    setSelectedConversation(null);
    setActivePage("todo");
    setOpenProjectId(isOpen ? null : project._id);
  };

  const allowedConvs = [
    {
      _id: 6,
      title: "Managers"
    },
    {
      _id: 7,
      title: "All"
    },
  ];

  return (
    <div className="flex flex-col gap-2 justify-between h-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold mb-2">Your Projects</h2>

        {projects.map((project) => {
          const isOpen = openProjectId === project._id;
          // const allowedConvs = getAllowedConversations(project);
          console.log("************** allowedConvs", allowedConvs);

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
                        setSelectedConversation(conv._id);
                        setActivePage("conversations");
                      }}
                    >
                      {conv.title}
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
