import { useEffect, useState } from "react";
import { io } from "socket.io-client";

 

export default function ConversationsPage() {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [input, setInput] = useState("");

  // Listen for messages from the server
  useEffect(() => {
    const socket = io.connect("http://localhost:3000", {
      query: {
        userId,
      },
    });
    setSocket(socket);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      text: input,
      author: userId,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("sendMessage", newMessage);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <h2 className="font-semibold text-slate-700">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-xs text-slate-500">{msg.author}</div>
            <div>{msg.text}</div>
            <div className="text-[10px] text-slate-400">{msg.time}</div>
          </div>
        ))}
      </div>

      <form
        onSubmit={sendMessage}
        className="border-t border-slate-200 bg-white px-3 py-2 flex gap-2"
      >
        <input
          type="text"
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm bg-slate-50"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-sky-600 text-white font-medium text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}