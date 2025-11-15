import React, { useState } from "react";
import calendarImg from "./assets/calendar-icon.svg"
import groupImg from "./assets/group-icon.svg"
import notifImg from "./assets/notif-icon.svg"
import chatImg from "./assets/chat-icon.svg"
import infoImg from "./assets/info-icon.svg"
import filesImg from "./assets/files-icon.svg"
import settingsImg from "./assets/settings-icon.svg"


const navItems = [
  { id: "notifications", label: "Notifications", icon: notifImg },
  { id: "groups",        label: "Groups",        icon: groupImg },
  { id: "conversations", label: "Conversations", icon: chatImg },
  { id: "files",         label: "Company files", icon: filesImg },
  { id: "info",          label: "Information",   icon: infoImg },
  { id: "calendar",      label: "Calendar",      icon: calendarImg },
  { id: "settings",      label: "Settings",      icon: settingsImg },
];

function App() {
  const [activePage, setActivePage] = useState("groups");

  return (
    <div className="h-screen w-screen bg-slate-100 text-slate-900 flex">
      <aside className="flex flex-col items-center gap-4 py-4 px-2 bg-slate-900 text-slate-100 w-16 md:w-20">
        <div className="mb-4 rounded-2xl bg-slate-700 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-lg font-bold">
          AI
        </div>

        <nav className="flex flex-col gap-3 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`relative flex items-center justify-center rounded-2xl w-10 h-10 md:w-12 md:h-12 text-xl transition
                ${
                  activePage === item.id
                    ? "bg-sky-500 text-white"
                    : "bg-transparent hover:bg-slate-700"
                }`}
              title={item.label}
            >
              <img src={item.icon}></img>
            </button>
          ))}
        </nav>

        <div className="mt-auto mb-1 w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-700 flex items-center justify-center text-sm">
          U
        </div>
      </aside>

      <section className="w-64 md:w-80 border-r border-slate-200 bg-white flex flex-col">
        <header className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">
            Your teams, managers, projects
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2">
          <GroupItem name="Finance – Q4 2024" active />
          <GroupItem name="Marketing – Launch prep" />
          <GroupItem name="Class 11B – History" />
          <GroupItem name="All Hands" />
        </div>
      </section>

      <main className="flex-1 flex flex-col">
        <header className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <h1 className="text-lg font-semibold capitalize">
            {activePage.replace("-", " ")}
          </h1>
          <span className="text-xs text-slate-500">
            Ready? Let&apos;s get started!
          </span>
        </header>

        <div className="flex-1 p-0 md:p-6 overflow-hidden">
          {renderActivePage(activePage)}
        </div>
      </main>
    </div>
  );
}


function GroupItem({ name, active }) {
  return (
    <button
      className={`w-full text-left px-3 py-2 rounded-xl text-sm border transition
      ${
        active
          ? "bg-sky-50 border-sky-300 text-sky-800"
          : "bg-white border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="font-medium truncate">{name}</div>
      <div className="text-xs text-slate-500 truncate">
        Last message · 2 min ago
      </div>
    </button>
  );
}


function renderActivePage(page) {
  switch (page) {
    case "notifications":
      return (
        <div className="p-6">
          <p className="text-sm text-slate-600">
            Here you&apos;ll see alerts about new messages, flagged facts, and
            updates.
          </p>
        </div>
      );
    case "groups":
      return (
        <div className="p-6">
          <p className="text-sm text-slate-600">
            Groups overview – later we can show group details, members, and
            pinned documents here.
          </p>
        </div>
      );
    case "conversations":
      return <ConversationsPage />;
    case "files":
      return (
        <div className="p-6">
          <p className="text-sm text-slate-600">
            Company files view – this will match your &quot;Company Documents&quot;
            sketch with uploaded CSVs and reports.
          </p>
        </div>
      );
    case "info":
      return (
        <div className="p-6">
          <p className="text-sm text-slate-600">
            General information / help about the workspace and how
            fact-checking works.
          </p>
        </div>
      );
    case "calendar":
      return (
        <div className="p-6">
          <p className="text-sm text-slate-600">
            Calendar page – later we&apos;ll add your grid with events per
            project.
          </p>
        </div>
      );
    case "settings":
      return (
        <div className="p-6">
          <p className="text-sm text-slate-600">
            Settings page – notifications, permissions, and account preferences.
          </p>
        </div>
      );
    default:
      return null;
  }
}


const initialMessages = [
  {
    id: 1,
    author: "Ana",
    self: false,
    text: "We made 1 million dollars last trimester",
    status: "incorrect",
    explanation: "Official revenue for last trimester is $620,000.",
  },
  {
    id: 2,
    author: "You",
    self: true,
    text: "Can the AI double-check that against the finance report?",
    status: "pending",
    explanation: "",
  },
  {
    id: 3,
    author: "AI fact-checker",
    self: false,
    text: "According to the official document 2024_finance.csv, revenue is $620,000.",
    status: "correct",
    explanation: "",
  },
];

function ConversationsPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const newMessage = {
      id: Date.now(),
      author: "You",
      self: true,
      text: trimmed,
      status: "pending", // later: update after real fact-check
      explanation: "",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
        <div>
          <div className="font-medium text-sm">Finance – Q4 2024</div>
          <div className="text-xs text-slate-500">
            AI fact-checking is enabled for this conversation.
          </div>
        </div>
        <div className="text-xs text-slate-500">
          * This info might be slightly redacted.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-slate-200 bg-white px-3 py-2 flex items-center gap-2"
      >
        <input
          type="text"
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50"
          placeholder="Write a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 active:bg-sky-800 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function ChatMessage({ message }) {
  const { author, self, text, status, explanation } = message;

  const alignment = self ? "items-end" : "items-start";
  const bubbleColor = self
    ? "bg-sky-600 text-white"
    : "bg-white border border-slate-200 text-slate-900";

  return (
    <div className={`flex flex-col ${alignment} gap-1`}>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        {!self && (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-[10px]">
            {author[0]}
          </span>
        )}
        <span>{author}</span>
      </div>

      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${bubbleColor}`}
      >
        <p className="whitespace-pre-wrap break-words">{text}</p>

        {!self && status && status !== "pending" && (
          <div className="mt-2">
            <FactCheckBadge status={status} explanation={explanation} />
          </div>
        )}

        {self && status === "pending" && (
          <div className="mt-2 text-xs opacity-80">
             Waiting for fact-check…
          </div>
        )}
      </div>
    </div>
  );
}

function FactCheckBadge({ status, explanation }) {
  let label = "";
  let style = "";

  if (status === "correct") {
    label = "Verified";
    style = "bg-emerald-100 text-emerald-700 border-emerald-200";
  } else if (status === "incorrect") {
    label = "Conflict with official data";
    style = "bg-rose-100 text-rose-700 border-rose-200";
  } else {
    label = "Not verifiable";
    style = "bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <div
      className={`inline-flex flex-col gap-1 rounded-xl border px-2 py-1 text-xs ${style}`}
    >
      <span className="font-semibold">{label}</span>
      {explanation && <span className="opacity-90">{explanation}</span>}
    </div>
  );
}

export default App;
