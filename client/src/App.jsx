import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

import Sidebar from "./components/layout/SideBar.jsx";
import TopBar from "./components/layout/TopBar.jsx";
import ProjectsBar from "./components/layout/ProjectsBar.jsx";
import LayoutShell from "./components/layout/LayoutShell.jsx";

import ConversationsPage from "./pages/Conversations/ConversationsPage.jsx";
import FilesPage from "./pages/Files/FilesPage.jsx";
import CalendarPage from "./pages/Calendar/CalendarPage.jsx";
import ToDoPage from "./pages/2do/2do.jsx";
import InfoPage from "./pages/Info/InfoPage.jsx";

export default function App() {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  const [activePage, setActivePage] = useState("conversations");

  // Global state for selected project + conversation
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // ----------------------------------------------
  // 🔥 Create or resolve user record on login
  // ----------------------------------------------
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) return;

    axios
      .post("http://localhost:3000/api/users/signup", {
        email: user.email,
        auth0Id: user.sub,
      })
      .then(() => console.log("User saved or already exists."))
      .catch((err) =>
        console.log("Error saving user (likely exists):", err.message)
      );
  }, [isAuthenticated, isLoading, user]);
  // ----------------------------------------------

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <h1 className="text-3xl font-bold mb-4">Welcome to FactCheck Teams</h1>
        <p className="text-sm text-slate-300 mb-6">
          Please log in to access your projects.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => loginWithRedirect()}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg font-medium"
          >
            Log In
          </button>

          <button
            onClick={() =>
              loginWithRedirect({
                authorizationParams: { screen_hint: "signup" },
              })
            }
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <LayoutShell
      sidebar={
        <Sidebar
          auth0Id={user.sub}
          activePage={activePage}
          setActivePage={setActivePage}
        />
      }
      projectsbar={
        <ProjectsBar
          auth0Id={user.sub}
          setActivePage={setActivePage}
          setSelectedProject={setSelectedProject}
          setSelectedConversation={setSelectedConversation}
        />
      }
      topbar={<TopBar activePage={activePage} />}
    >
      {renderPage(activePage, selectedProject, user.sub)}
    </LayoutShell>
  );
}

// ------------------------------------------------------
// 🔥 FIXED — renderPage now receives auth0Id correctly
// ------------------------------------------------------
function renderPage(page, selectedProject, auth0Id) {
  switch (page) {
    case "conversations":
      return <ConversationsPage />;

    case "files":
      return <FilesPage />;

    case "calendar":
      return <CalendarPage />;

    case "todo":
      return <ToDoPage auth0Id={auth0Id} selectedProject={selectedProject} />;

    case "info":
      return <InfoPage />;

    default:
      return null;
  }
}
