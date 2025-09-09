import { useState } from "react";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function AIChatbot() {
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);

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

      <NeumorphicCard className="p-8 h-[70vh] flex flex-col">
        {/* Messages area without auto-scroll */}
        <div className="flex-1 neu-surface inset p-6 rounded-2xl mb-4 overflow-y-auto">
          {chatMessages.map((msg, idx) => (
            <p
              key={idx}
              className={
                msg.sender === "bot"
                  ? "text-blue-500 animate-fade-in mb-2"
                  : "text-gray-700 font-semibold animate-fade-in mb-2"
              }
            >
              <strong>{msg.sender === "bot" ? "AI:" : "You:"}</strong> {msg.text}
            </p>
          ))}
          {loading && <p className="text-gray-500 animate-pulse">AI is typing...</p>}
        </div>

        {/* Input area stays fixed at the bottom */}
        <div className="neu-input flex mt-auto">
          <input
            className="neu-input-el flex-grow"
            placeholder="Ask me anything..."
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
          />
          <button className="neu-button px-4 ml-2" onClick={handleSend}>Send</button>
        </div>
      </NeumorphicCard>
    </PageSection>
  );
}
