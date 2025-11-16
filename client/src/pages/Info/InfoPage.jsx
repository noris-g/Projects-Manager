import { useState, useRef, useEffect } from "react";

export default function InfoPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      name: "Assistant",
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isOwn: false,
    },
  ]);

  const [input, setInput] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const messagesEndRef = useRef(null);

  // auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiThinking]);

  // Send user message
  const sendUserMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      name: "You",
      text: input.trim(),
      isOwn: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Now simulate AI response
    await handleAIResponse(userMsg.text);
  };

  /**
   * Fake AI backend call
   * Replace this later with:
   *   const res = await axios.post("/api/ai/chat", { prompt });
   *   return res.data.reply;
   */
  const handleAIResponse = async (prompt) => {
    setAiThinking(true);

    const reply = await new Promise((resolve) =>
      setTimeout(
        () =>
          resolve(
            "This is an example AI response. I received your message: " + prompt
          ),
        1200
      )
    );

    setAiThinking(false);

    const newAiMessage = {
      id: Date.now() + 1,
      sender: "ai",
      name: "Assistant",
      text: reply,
      isOwn: false,
    };

    setMessages((prev) => [...prev, newAiMessage]);
  };

  // Rendering helper for AI flags (unchanged)
  const severityColor = (sev) => {
    if (sev === "high") return "text-red-700";
    if (sev === "low") return "text-yellow-700";
    return "text-orange-700";
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-md">

      {/* HEADER */}
      <div className="px-4 py-3 border-b bg-slate-100 font-semibold text-lg flex items-center gap-2">
        <span>AI Assistant</span>
      </div>

      {/* MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.isOwn ? "items-end" : "items-start"
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">{msg.name}</div>

            <div className="relative max-w-[70%]">
              <div
                className={`p-3 rounded-xl shadow break-words ${
                  msg.isOwn
                    ? "bg-sky-500 text-white rounded-br-none"
                    : "bg-slate-100 text-black rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
              </div>

              {/* If AI flags appear in future */}
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
                        Flagged by AI ({msg.flag.severity})
                      </div>
                      <div className="text-xs text-gray-700">{msg.flag.reason}</div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        {new Date(msg.flag.flaggedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* AI "Typing…" Indicator */}
        {aiThinking && (
          <div className="flex items-start">
            <div className="bg-slate-100 text-black p-3 rounded-xl shadow max-w-[60%]">
              <div className="text-xs text-gray-500 mb-1">Assistant</div>
              <div className="flex gap-2 items-center">
                <span className="animate-pulse">Thinking…</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-3 border-t flex gap-2">
        <input
          type="text"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendUserMessage();
            }
          }}
        />
        <button
          onClick={sendUserMessage}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
