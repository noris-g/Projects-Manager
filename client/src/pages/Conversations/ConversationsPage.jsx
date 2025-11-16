import { useState, useRef, useEffect } from "react";
import apiClient from "@/lib/apiClient";

/**
 * ConversationsPage.jsx - Real Backend Integration
 * 
 * Props:
 * - selectedConversation: { _id, title, ... }
 * - auth0Id: current user's auth0Id
 */
export default function ConversationsPage({ selectedConversation, auth0Id }) {
  const [messages, setMessages] = useState([]);
  const [myMessage, setMyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedConversation?._id) {
      setMessages([]);
      return;
    }

    loadMessages();
    
    // Start polling for new messages every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      loadMessages(true); // silent reload
    }, 3000);

    // Cleanup polling on unmount or conversation change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedConversation?._id]);

  // Load messages from backend
  const loadMessages = async (silent = false) => {
    if (!selectedConversation?._id) return;

    try {
      if (!silent) setLoading(true);
      setError(null);

      const response = await apiClient.get(
        `/conversations/${selectedConversation._id}/messages`
      );

      // Transform backend messages to frontend format
      const transformedMessages = response.data.messages.map((msg) => ({
        id: msg._id,
        senderName: msg.senderNickname || "Unknown",
        text: msg.content,
        isOwn: msg.senderAuth0Id === auth0Id,
        timestamp: msg.timestamp,
        flag: msg.flag?.flaggedByAI ? msg.flag : null,
      }));

      setMessages(transformedMessages);
    } catch (err) {
      console.error("Error loading messages:", err);
      if (!silent) {
        setError("Failed to load messages");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Send message to backend
  const sendMyMessage = async () => {
    if (!myMessage.trim()) return;
    if (!selectedConversation?._id) {
      setError("No conversation selected");
      return;
    }

    const messageText = myMessage.trim();
    setMyMessage(""); // Clear input immediately for better UX

    try {
      await apiClient.post(
        `/conversations/${selectedConversation._id}/messages`,
        {
          content: messageText,
          auth0Id: auth0Id,
        }
      );

      // Reload messages to get the new one
      await loadMessages(true);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
      setMyMessage(messageText); // Restore message on error
    }
  };

  // Optional: acknowledge flag
  const acknowledgeFlag = (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, flagAcknowledged: true } : m
      )
    );
  };

  if (!selectedConversation) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-md">
        <div className="text-gray-500 text-center">
          <p className="text-xl mb-2">No conversation selected</p>
          <p className="text-sm">Select a conversation from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-md">
      {/* HEADER */}
      <div className="px-4 py-3 border-b bg-slate-100 font-semibold text-lg">
        {selectedConversation.title || "Conversation"}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 text-blue-700 text-sm">
          Loading messages...
        </div>
      )}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-400 py-8">
            No messages yet. Start the conversation!
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isOwn ? "items-end" : "items-start"}`}
          >
            {/* Sender name */}
            <div className="text-xs text-gray-500 mb-1">{msg.senderName}</div>

            {/* Message bubble */}
            <div className="relative max-w-[70%]">
              <div
                className={`p-3 rounded-xl shadow wrap-break-words ${
                  msg.isOwn
                    ? "bg-sky-500 text-white rounded-br-none"
                    : "bg-slate-100 text-black rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <div className="text-[10px] text-right opacity-70 mt-1">
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>

              {/* AI Flag Banner */}
              {msg.flag && (
                <div className="mt-2 flex items-start gap-2">
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md p-2">
                    <svg
                      className="w-4 h-4 text-red-600 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 3v18h18" stroke="currentColor" />
                      <path d="M21 3l-6 5 6 5" stroke="currentColor" />
                    </svg>

                    <div className="text-sm flex-1">
                      <div className="font-semibold text-red-700">
                        Flagged by AI
                        {msg.flag.severity && ` (${msg.flag.severity})`}
                      </div>
                      <div className="text-xs text-gray-700">
                        {msg.flag.reason}
                      </div>
                      {msg.flag.flaggedAt && (
                        <div className="text-[10px] text-gray-500 mt-1">
                          {new Date(msg.flag.flaggedAt).toLocaleString()}
                          {msg.flagAcknowledged && " • acknowledged"}
                        </div>
                      )}
                    </div>

                    {/* Acknowledge button */}
                    {!msg.flagAcknowledged && (
                      <button
                        onClick={() => acknowledgeFlag(msg.id)}
                        className="ml-3 text-xs px-2 py-1 bg-white border rounded text-red-600 hover:bg-red-50"
                      >
                        Ack
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

      {/* INPUT for message */}
      <div className="p-3 border-t flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={myMessage}
          onChange={(e) => setMyMessage(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMyMessage();
            }
          }}
        />
        <button
          onClick={sendMyMessage}
          disabled={!myMessage.trim()}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}