import React, { useEffect, useRef, useState } from "react";
import {
	ghostButtonStyle,
	inputFieldStyle,
	primaryButtonStyle,
	subtleTextStyle,
} from "../styles";
import { fetchChatbotAnswer } from "@/lib/chatbotApi";

type Sender = "user" | "assistant";

interface Message {
	id: string;
	sender: Sender;
	text: string;
}

interface AssistantProps {
	accent: string;
	onClose?: () => void;
}

const headerStyle: React.CSSProperties = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	gap: "16px",
	flexWrap: "wrap",
};

const chatSurfaceStyle: React.CSSProperties = {
	background: "linear-gradient(180deg, hsla(216, 18%, 14%, 0.82), hsla(216, 18%, 10%, 0.9))",
	border: "1px solid hsla(199, 45%, 36%, 0.18)",
	borderRadius: "20px",
	padding: "20px",
	display: "flex",
	flexDirection: "column",
	gap: "12px",
	height: "360px",
	overflowY: "auto",
};

const bubbleStyle = (sender: Sender, accent: string): React.CSSProperties => ({
	alignSelf: sender === "user" ? "flex-end" : "flex-start",
	maxWidth: "70%",
	padding: "12px 16px",
	borderRadius: sender === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
	background: sender === "user" ? accent : "hsla(216, 18%, 18%, 0.6)",
	color: sender === "user" ? "hsl(216, 18%, 12%)" : "hsl(var(--foreground))",
	boxShadow: sender === "user" ? `${accent}33 0 18px 24px` : "none",
	lineHeight: 1.5,
});

const Assistant: React.FC<AssistantProps> = ({ accent, onClose }) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const scrollRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (messages.length > 0) {
			scrollRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	const sendMessage = async () => {
		const trimmed = input.trim();
		if (!trimmed || isLoading) {
			return;
		}

		const userMessage: Message = {
			id: `${Date.now()}-user`,
			sender: "user",
			text: trimmed,
		};
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			const data = await fetchChatbotAnswer(trimmed);

			if (data.error) {
				setMessages((prev) => [
					...prev,
					{
						id: `${Date.now()}-assistant-error`,
						sender: "assistant",
						text: `Error: ${data.error}`,
					},
				]);
				return;
			}

			const botAnswer = data.answer?.trim() ?? "I'm still thinking about that one.";
			const typingId = `${Date.now()}-assistant`;
			setMessages((prev) => [
				...prev,
				{
					id: typingId,
					sender: "assistant",
					text: "",
				},
			]);

			let index = 0;
			const interval = window.setInterval(() => {
				setMessages((prev) => {
					const updated = [...prev];
					const messageIndex = updated.findIndex((message) => message.id === typingId);
					if (messageIndex === -1) {
						window.clearInterval(interval);
						return prev;
					}
					const currentMessage = updated[messageIndex];
					updated[messageIndex] = {
						...currentMessage,
						text: currentMessage.text + (botAnswer[index] ?? ""),
					};
					return updated;
				});

				index += 1;
				if (index >= botAnswer.length) {
					window.clearInterval(interval);
				}
			}, 20);
		} catch (error) {
			console.error("Assistant error:", error);
			setMessages((prev) => [
				...prev,
				{
					id: `${Date.now()}-assistant-error`,
					sender: "assistant",
					text: "I ran into a server issue. Try again in a moment.",
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.preventDefault();
			sendMessage();
		}
	};

	return (
		<div style={{ display: "grid", gap: "18px", height: "100%" }}>
			<div style={headerStyle}>
				<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
					<span
						style={{
							width: "12px",
							height: "12px",
							borderRadius: "999px",
							background: accent,
							boxShadow: `${accent}55 0 0 18px`,
						}}
					/>
					<div>
						<h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>AI Assistant</h2>
						<p style={subtleTextStyle}>Ask for study plans, explanations, or brainstorming help.</p>
					</div>
				</div>
				{typeof onClose === "function" ? (
					<button type="button" onClick={onClose} style={ghostButtonStyle}>
						Close
					</button>
				) : null}
			</div>

			<div style={chatSurfaceStyle}>
				{messages.length === 0 ? (
					<div style={{ ...subtleTextStyle, textAlign: "center", marginTop: "auto", marginBottom: "auto" }}>
						Say hello! Ask for a revision schedule or a quick explanation.
					</div>
				) : (
					messages.map((message) => (
						<div key={message.id} style={bubbleStyle(message.sender, accent)}>
							{message.text}
						</div>
					))
				)}
				<div ref={scrollRef} />
			</div>

			<div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
				<input
					type="text"
					value={input}
					onChange={(event) => setInput(event.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Ask Vertex..."
					style={{ ...inputFieldStyle, flex: 1, minWidth: "220px" }}
					disabled={isLoading}
				/>
				<button
					type="button"
					onClick={sendMessage}
					style={primaryButtonStyle(accent)}
					disabled={isLoading}
				>
					{isLoading ? "Thinking..." : "Send"}
				</button>
			</div>
		</div>
	);
};

export default Assistant;

