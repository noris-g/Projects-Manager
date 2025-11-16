// src/pages/ConversationsPage.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { socket } from "../../socket/socket.js";

/**
 * ConversationsPge.jsx
 *
 * - Uses route param `:conversationId` (assumes route: /conversations/:conversationId)
 * - Reads userId from localStorage (adjust to your auth solution if needed)
 * - Loads conversation from GET /api/conversations/:conversationId
 * - Joins socket room "conversationId" and sends/receives messages
 *
 * Messages structure (from backend conversation model):
 *   {
 *     _id,
 *     content,
 *     senderId,
 *     flag: { flaggedByAI, reason, severity, flaggedAt },
 *     createdAt
 *   }
 *
 * NOTE: This file removes the second "other user" input (as requested).
 */

export default function ConversationsPage() {
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [myMessage, setMyMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Replace this with your real auth user id retrieval if needed
  const userId = localStorage.getItem("userId") || "anonymous";

  // Auto-scroll helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch conversation and initial messages
  const fetchConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      const res = await axios.get(`/api/conversations/${conversationId}`);
      const conv = res.data;
      setConversation(conv);

      // normalize messages: ensure each has an _id and createdAt
      const msgs = (conv.messages || []).map((m) => ({
        ...m,
        _id: m._id || m.id || `${m.senderId}-${m.content}-${Date.now()}`,
        createdAt: m.createdAt || m.updatedAt || Date.now(),
      }));
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  // Setup socket: connect, set query/auth for server, join room, listen for messages
  useEffect(() => {
    if (!conversationId) return;

    // ensure socket has the userId (server you showed reads handshake.query.userId)
    // set both auth and query to increase compatibility
    socket.auth = { userId };
    // some client versions require setting opts.query before connect
    if (socket.io && socket.io.opts) socket.io.opts.query = { userId };

    socket.connect();

    // Join conversation room
    socket.emit("join_conversation", conversationId);

    // Listen for incoming messages
    const onReceive = (msg) => {
      // server message should have _id: if not, normalize
      const normalized = {
        ...msg,
        _id: msg._id || msg.id || `${msg.senderId}-${msg.content}-${Date.now()}`,
        createdAt: msg.createdAt || Date.now(),
      };

      setMessages((prev) => {
        // avoid duplicates: if _id already present, ignore
        const exists = prev.some((m) => m._id === normalized._id);
        if (exists) return prev;

        // If there is an optimistic temporary message (tmp-...) matching content+sender, replace it
        const tmpIndex = prev.findIndex(
          (m) =>
            m._id?.startsWith("tmp-") &&
            m.senderId === normalized.senderId &&
            m.content === normalized.content
        );
        if (tmpIndex !== -1) {
          const next = [...prev];
          next[tmpIndex] = normalized;
          return next;
        }

        return [...prev, normalized];
      });
    };

    socket.on("receive_message", onReceive);

    // Optionally handle online/offline, typing, etc here

    return () => {
      socket.off("receive_message", onReceive);
      // leave room (socket.io will remove on disconnect but it's good to be explicit)
      try {
        socket.emit("leave_conversation", conversationId);
      } catch (e) {}
      // do not fully disconnect socket here if app uses it globally; if you want to disconnect:
      // socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, userId]);

  // Send message: optimistic UI + emit to server
  const sendMyMessage = async () => {
    const text = myMessage.trim();
    if (!text) return;

    // optimistic message
    const tmpId = `tmp-${Date.now()}`;
    const optimisticMsg = {
      _id: tmpId,
      content: text,
      senderId: userId,
      createdAt: Date.now(),
      flag: null,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setMyMessage("");

    // Emit to socket: backend will save and broadcast the definitive message
    socket.emit("send_message", {
      conversationId,
      senderId: userId,
      content: text,
    });

    // (No further action here — when server emits back, we'll replace the tmp message.)
  };

  // Simulate server flag (UI-only helper kept from your original)
  const simulateServerFlag = (messageId, reason, severity = "medium") => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId
          ? {
              ...m,
              flag: {
                flaggedByAI: true,
                reason,
                severity,
                flaggedAt: new Date().toISOString(),
              },
            }
          : m
      )
    );
  };

  // Acknowledge flag (UI-only)
  const acknowledgeFlag = (messageId) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === messageId ? { ...m, flagAcknowledged: true } : m))
    );
  };

  const severityColor = (sev) => {
    if (sev === "high") return "text-red-700";
    if (sev === "low") return "text-yellow-700";
    return "text-orange-700";
  };

  // render sender name: if userId matches senderId show "You", else show short id or "User"
  const renderSenderName = (senderId) => {
    if (!senderId) return "Unknown";
    return senderId === userId ? "You" : `User ${String(senderId).slice(0, 6)}`;
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
            key={msg._id}
            className={`flex flex-col ${msg.senderId === userId ? "items-end" : "items-start"}`}
          >
            {/* Sender name (for group chats) */}
            <div className="text-xs text-gray-500 mb-1">{renderSenderName(msg.senderId)}</div>

            {/* Message bubble */}
            <div className="relative max-w-[70%]">
              <div
                className={`p-3 rounded-xl shadow break-words ${
                  msg.senderId === userId
                    ? "bg-sky-500 text-white rounded-br-none"
                    : "bg-slate-100 text-black rounded-bl-none"
                }`}
              >
                <p>{msg.content}</p>
                <div className="text-[10px] text-right opacity-70 mt-1">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
                  {msg._id?.startsWith("tmp-") ? " • sending..." : ""}
                </div>
              </div>

              {/* Flagged banner */}
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
                        {msg.flag.flaggedAt ? new Date(msg.flag.flaggedAt).toLocaleString() : ""}
                        {msg.flagAcknowledged ? " • acknowledged" : ""}
                      </div>
                    </div>

                    {!msg.flagAcknowledged && (
                      <button
                        onClick={() => acknowledgeFlag(msg._id)}
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

      {/* ACTION ROW */}
      <div className="px-4 py-2 border-t bg-slate-50 flex gap-2 items-center">
        <button
          onClick={() =>
            simulateServerFlag(
              messages[messages.length - 1]?._id,
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
        <button
          onClick={sendMyMessage}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
