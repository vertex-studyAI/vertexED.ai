import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function AIChatbot() {
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    setChatMessages(prev => [...prev, { sender: "user", text: userInput }]);
    setLoading(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userInput }),
      });

      const data = await response.json();

      if (data.error) {
        setChatMessages(prev => [...prev, { sender: "bot", text: `Error: ${data.error}` }]);
      } else {
        setChatMessages(prev => [...prev, { sender: "bot", text: data.answer }]);
      }
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { sender: "bot", text: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
      setUserInput("");
    }
  };

  return (
    <PageSection>
      <div className="mb-6">
        <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
      </div>

      <NeumorphicCard className="p-4 h-[70vh] flex flex-col relative">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 rounded-2xl space-y-3 mb-4 bg-slate-50 shadow-inner">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[75%] px-4 py-2 rounded-2xl break-words ${
                msg.sender === "bot"
                  ? "bg-blue-100 text-blue-800 self-start"
                  : "bg-gray-200 text-gray-900 self-end"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="text-gray-500 italic animate-pulse">
              AI is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex mt-auto gap-2">
          <input
            className="flex-grow p-3 rounded-xl border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Ask me anything..."
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
          />
          <button
            className="neu-button px-6 py-3"
            onClick={handleSend}
            disabled={loading}
          >
            Send
          </button>
        </div>
      </NeumorphicCard>
    </PageSection>
  );
}
