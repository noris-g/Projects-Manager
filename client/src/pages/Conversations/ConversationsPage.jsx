import { useState, useRef, useEffect } from "react";

/**
 * ConversationsPage.jsx
 *
 * Messages can contain an optional `flag` object:
 *   flag: {
 *     flaggedByAI: true,
 *     reason: "Misinformation about X",
 *     severity: "high", // optional: low | medium | high
 *     flaggedAt: Date
 *   }
 *
 * The UI will render a small red banner below/inside the message bubble when flag is present.
 * A real app would receive flags from the server (websocket / server push / polling).
 */

export default function ConversationsPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderName: "Alice",
      text: "Welcome to the chat!",
      isOwn: false,
      // example flagged message:
      flag: {
        flaggedByAI: true,
        reason: "Contains outdated info about release date",
        severity: "medium",
        flaggedAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      },
    },
    {
      id: 2,
      senderName: "You",
      text: "Thanks!",
      isOwn: true,
    },
  ]);

  const [myMessage, setMyMessage] = useState("");
  const [otherMessage, setOtherMessage] = useState("");
  const [otherName, setOtherName] = useState("Alice");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message as "You"
  const sendMyMessage = () => {
    if (!myMessage.trim()) return;
    const newMsg = {
      id: Date.now(),
      senderName: "You",
      text: myMessage.trim(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setMyMessage("");
  };

  // Send a message as simulated other user (for testing)
  const sendOtherMessage = () => {
    if (!otherMessage.trim()) return;
    const newMsg = {
      id: Date.now(),
      senderName: otherName || "Unknown",
      text: otherMessage.trim(),
      isOwn: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setOtherMessage("");
  };

  // Simulate receiving a server-side AI flag for a message.
  // In production you'd call this when the server notifies the client (WS, SSE, poll).
  const simulateServerFlag = (messageId, reason, severity = "medium") => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              flag: {
                flaggedByAI: true,
                reason,
                severity,
                flaggedAt: new Date(),
              },
            }
          : m
      )
    );
  };

  // Optional: allow users to acknowledge the flag (UI only here)
  const acknowledgeFlag = (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, flagAcknowledged: true } : m
      )
    );
  };

  // Rendering helper for flag badge text color based on severity
  const severityColor = (sev) => {
    if (sev === "high") return "text-red-700";
    if (sev === "low") return "text-yellow-700";
    return "text-orange-700";
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-md">
      {/* HEADER */}
      <div className="px-4 py-3 border-b bg-slate-100 font-semibold text-lg">
        Conversations
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isOwn ? "items-end" : "items-start"}`}
          >
            {/* Sender name (for group chats) */}
            <div className="text-xs text-gray-500 mb-1">{msg.senderName}</div>

            {/* Message bubble */}
            <div className="relative max-w-[70%]">
              <div
                className={`p-3 rounded-xl shadow wrap-break-words ${
                  msg.isOwn ? "bg-sky-500 text-white rounded-br-none" : "bg-slate-100 text-black rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <div className="text-[10px] text-right opacity-70 mt-1">
                  {/* show formatted time if you keep it on messages, else this is place-holder */}
                  {msg.time || ""}
                </div>
              </div>

              {/* If message is flagged by AI, show a red flag banner below the bubble */}
              {msg.flag && (
                <div className="mt-2 flex items-start gap-2">
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md p-2">
                    <svg
                      className="w-4 h-4 text-red-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 3v18h18" stroke="currentColor" />
                      <path d="M21 3l-6 5 6 5" stroke="currentColor" />
                    </svg>

                    <div className="text-sm">
                      <div className="font-semibold text-red-700">
                        Flagged by AI {msg.flag.severity ? `(${msg.flag.severity})` : ""}
                      </div>
                      <div className="text-xs text-gray-700">{msg.flag.reason}</div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        {new Date(msg.flag.flaggedAt).toLocaleString()}
                        {msg.flagAcknowledged ? " • acknowledged" : ""}
                      </div>
                    </div>

                    {/* Acknowledge button to mark as seen (optional) */}
                    {!msg.flagAcknowledged && (
                      <button
                        onClick={() => acknowledgeFlag(msg.id)}
                        className="ml-3 text-xs px-2 py-1 bg-white border rounded text-red-600 hover:bg-red-50"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* ACTION ROW: left for testing: simulate flag for last message */}
      <div className="px-4 py-2 border-t bg-slate-50 flex gap-2 items-center">
        <button
          onClick={() =>
            simulateServerFlag(
              messages[messages.length - 1]?.id,
              "AI detected possible incorrect statement about timelines",
              "high"
            )
          }
          className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded"
        >
          Simulate AI Flag (last msg)
        </button>

        <div className="text-xs text-gray-500">Use this to see how flags appear</div>
      </div>

      {/* INPUT for Your message */}
      <div className="p-3 border-t flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={myMessage}
          onChange={(e) => setMyMessage(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMyMessage();
            }
          }}
        />
        <button onClick={sendMyMessage} className="bg-sky-500 text-white px-4 py-2 rounded-lg">
          Send
        </button>
      </div>

      {/* INPUT for Other person's message (testing) */}
      <div className="p-3 border-t bg-slate-50 flex gap-2">
        <input
          type="text"
          placeholder="Name (e.g., Alice)"
          value={otherName}
          onChange={(e) => setOtherName(e.target.value)}
          className="w-32 p-2 border rounded-lg"
        />

        <input
          type="text"
          placeholder="Send message as other user..."
          value={otherMessage}
          onChange={(e) => setOtherMessage(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendOtherMessage();
            }
          }}
        />

        <button onClick={sendOtherMessage} className="bg-purple-500 text-white px-4 py-2 rounded-lg">
          Send as Other
        </button>
      </div>
    </div>
  );
}
