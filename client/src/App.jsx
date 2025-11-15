import { useState, useEffect } from "react";
import axios from "axios"; // <-- ADD THIS
import { useAuth0 } from "@auth0/auth0-react";
import Sidebar from "./components/layout/SideBar.jsx";
import TopBar from "./components/layout/TopBar.jsx";
import ProjectsBar from "./components/layout/ProjectsBar.jsx";
import LayoutShell from "./components/layout/LayoutShell.jsx";
import LoginButton from "./components/auth/LoginButton.jsx";
import LogoutButton from "./components/auth/LogoutButton.jsx";
import Profile from "./components/auth/Profile.jsx";

import ConversationsPage from "./pages/Conversations/ConversationsPage.jsx";
import FilesPage from "./pages/Files/FilesPage.jsx";
import CalendarPage from "./pages/Calendar/CalendarPage.jsx";
import SettingsPage from "./pages/Settings/SettingsPage.jsx";
import InfoPage from "./pages/Info/InfoPage.jsx";

export default function App() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [activePage, setActivePage] = useState("groups");

  // ----------------------------------------------
  // 🔥 SAVE USER TO DATABASE AFTER LOGIN/SIGNUP
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
        console.log("Error saving user (likely already exists):", err.message)
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
    const { loginWithRedirect } = useAuth0();

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <h1 className="text-3xl font-bold mb-4">Welcome to FactCheck Teams</h1>
        <p className="text-sm text-slate-300 mb-6">
          Please log in to access your projects.
        </p>

        <div className="flex gap-4">
          {/* Login button */}
          <button
            onClick={() => loginWithRedirect()}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg font-medium"
          >
            Log In
          </button>

          {/* Sign up button */}
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
        <ProjectsBar auth0Id={user.sub} setActivePage={setActivePage} />
      }
      topbar={<TopBar activePage={activePage} />}
    >
      {renderPage(activePage)}
    </LayoutShell>
  );
}

function renderPage(page) {
  switch (page) {
    case "conversations":
      return <ConversationsPage />;
    case "files":
      return <FilesPage />;
    case "calendar":
      return <CalendarPage />;
    case "settings":
      return <SettingsPage />;
    case "info":
      return <InfoPage />;
  }
}
