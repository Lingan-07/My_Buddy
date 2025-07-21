import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [journal, setJournal] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load chat from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem("myBuddyChat");
    if (savedChats) {
      setChatHistory(JSON.parse(savedChats));
    }
  }, []);

  // Save chat to localStorage when chatHistory updates
  useEffect(() => {
    localStorage.setItem("myBuddyChat", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSubmit = async () => {
    if (!journal.trim()) return;

    const userMessage = journal;
    setJournal("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/analyze", {
        journalText: userMessage,
      });

      const aiReply = {
        sentimentScore: res.data.sentimentScore,
        message: res.data.message,
      };

      setChatHistory([
        ...chatHistory,
        { user: userMessage, ai: aiReply },
      ]);
    } catch (error) {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h1 className="app-title">
        <img src={`./robot.png`} alt="Robot" className="icon" />
        My Buddy
      </h1>

      <div className="chat-box">
        {chatHistory.map((entry, index) => (
          <div key={index}>
            <div className="bubble user">
              <span className="avatar user-avatar">🧍‍♂️</span>
              <div className="text">You: {entry.user}</div>
            </div>
            <div className="bubble ai">
              <span className="avatar ai-avatar">🤖</span>
              <div className="text">
                Buddy: {entry.ai.message}
                <br />
                <span className="score">📝 Sentiment Score: {entry.ai.sentimentScore}</span>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="bubble ai typing">
            <span className="avatar ai-avatar">🤖</span>
            <div className="text">
              AI is typing<span className="dots">...</span>
            </div>
          </div>
        )}
      </div>
      <div className="input-area">
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          placeholder="Type your thoughts..."
          rows="3"
        />
        <button onClick={handleSubmit} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
