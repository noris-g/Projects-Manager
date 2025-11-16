import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Make sure this env var is defined (in Vite it's usually VITE_GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const MODEL_NAME = "gemini-2.5-flash";

// Returns a Promise<string> with the model's reply
export async function getResponse(message) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
  });

  const prompt = `
return a single word <match>, where <match> is the subject inside '<msg>' tags,
and can be one of the following: <profit> <agenda> <tasks> <list> <other>. you must be very careful
<msg>${message}</msg>
  `.trim();

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  let secondPrompt;
  if (text.includes("other")) {
    secondPrompt = `
    
    `.trim();
  } else if (text.includes("profit")) {
    secondPrompt = `
    Extract profit-related information from the message between <docs> tags answering the question between the <msg> tags.
    have a professional tone.
<docs>${`Month,Product Sales,Service Revenue,Subscription Revenue,Other Income,Payroll,Marketing,R&D,Operations,Administrative,Other Expenses,Total Income,Total Spending,Net Profit
January,80000,25000,12000,3000,42000,8000,6000,15000,7000,3000,120000,81000,39000
February,78000,24000,12500,2500,41000,7500,6500,14800,6800,3200,117000,78800,38200
March,85000,26000,13000,4000,43000,9000,7000,15500,7200,3500,128000,85200,42800
April,87000,27000,13500,3500,44500,9200,7200,15800,7300,3600,131000,87300,43700
May,90000,28000,14000,3000,45000,9500,7500,16000,7500,3700,135000,88200,46800
June,92000,29000,14500,3500,46000,9800,7600,16200,7600,3800,139000,91000,48000
July,95000,30000,15000,4000,47000,10000,7800,16500,7800,3900,144000,92400,51600
August,97000,31000,15500,4200,48000,10200,7900,16800,7900,4000,147700,94800,52800
September,94000,30500,16000,3800,46500,9800,7700,16000,7800,3900,144300,89700,54600
October,99000,32000,16500,4500,49000,10500,8000,17000,8000,4200,151000,98700,52300
November,102000,33000,17000,4800,50000,11000,8200,17500,8200,4400,156800,100300,56500
December,110000,35000,18000,5000,52000,11500,8500,18000,8500,4500,168000,105000,63000`}</docs>

<msg>${message}</msg>
    `.trim();
  }

  const result2 = await model.generateContent(secondPrompt);
  const response2 = await result2.response;
  const text2 = response2.text();
  console.log("Gemini raw response:", text);
  return text2;
}

export default function InfoPage() {
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("AImessages")) || []
  );

  useEffect(() => {
    setMessages(localStorage.getItem("AImessages") || []);
    setMessages((prev) => JSON.parse(prev));
  }, []);

  useEffect(() => {
    localStorage.setItem("AImessages", JSON.stringify(messages));
    console.log(localStorage.getItem("AImessages"));
  }, [messages]);

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

    const res = await getResponse(userMsg);
    const formattedRes = {
      id: Math.random(),
      isOwn: false,
      name: "Assistant",
      sender: "ai",
      text: res,
    };
    setMessages((prev) => [...prev, formattedRes]);
    setInput("");

    // Now simulate AI response
  };

  /**
   * Fake AI backend call
   * Replace this later with:
   *   const res = await axios.post("/api/ai/chat", { prompt });
   *   return res.data.reply;
   */

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
                className={`p-3 rounded-xl shadow wrap-break-words ${
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
                      <div className="text-xs text-gray-700">
                        {msg.flag.reason}
                      </div>
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
