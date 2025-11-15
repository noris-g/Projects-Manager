import React, { useState } from "react";
import calendarImg from "../../assets/calendar-icon.svg"
import groupImg from "../../assets/group-icon.svg"
import chatImg from "../../assets/chat-icon.svg"
import infoImg from "../../assets/info-icon.svg"
import filesImg from "../../assets/files-icon.svg"
import settingsImg from "../../assets/settings-icon.svg"

const navItems = [
  { id: "conversations", label: "Conversations", icon: chatImg },
  { id: "files",         label: "Company files", icon: filesImg },
  { id: "info",          label: "Information",   icon: infoImg },
  { id: "calendar",      label: "Calendar",      icon: calendarImg },
  { id: "settings",      label: "Settings",      icon: settingsImg },
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="w-16 md:w-20 bg-slate-900 text-white flex flex-col items-center py-4">
      <div className="bg-slate-700 w-12 h-12 flex items-center justify-center rounded-xl mb-6 text-xl font-bold">
        AI
      </div>

      <nav className="flex flex-col gap-4 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl
              ${
                activePage === item.id
                  ? "bg-sky-500 text-white"
                  : "hover:bg-slate-700"
              }`}
          >
            <img src={item.icon}></img>
          </button>
        ))}
      </nav>

      <div className="mt-auto w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-sm">
        U
      </div>
    </aside>
  );
}