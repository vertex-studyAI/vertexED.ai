import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	fieldLabelStyle,
	ghostButtonStyle,
	inputFieldStyle,
	listSurfaceStyle,
	primaryButtonStyle,
	scrollAreaStyle,
	subtleTextStyle,
	textareaFieldStyle,
} from "../styles";

type FormatCommand = "bold" | "italic" | "underline";

interface Note {
	id: string;
	title: string;
	content: string;
	updatedAt: string;
}

interface NoteTakerProps {
	accent: string;
}

const layoutStyle: React.CSSProperties = {
	display: "grid",
	gap: "24px",
	gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
	alignItems: "start",
};

const noteButtonStyle = (active: boolean, accent: string): React.CSSProperties => ({
	display: "flex",
	flexDirection: "column",
	gap: "6px",
	padding: "14px 16px",
	borderRadius: "16px",
	border: active ? `1px solid ${accent}` : "1px solid hsla(199, 45%, 36%, 0.16)",
	background: active ? "hsla(216, 18%, 20%, 0.82)" : "hsla(216, 18%, 16%, 0.72)",
	color: "hsl(var(--foreground))",
	textAlign: "left",
	cursor: "pointer",
	transition: "border-color 0.2s ease, transform 0.2s ease",
});

const toolbarButtonStyle: React.CSSProperties = {
	...ghostButtonStyle,
	padding: "6px 12px",
	borderRadius: "10px",
};

const createNoteId = () =>
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? (crypto as Crypto).randomUUID()
		: `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const NoteTaker: React.FC<NoteTakerProps> = ({ accent }) => {
	const [notes, setNotes] = useState<Note[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const editorRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (editorRef.current && editorRef.current.innerHTML !== content) {
			editorRef.current.innerHTML = content;
		}
	}, [content]);

	const applyFormat = (command: FormatCommand) => {
		if (typeof document === "undefined") {
			return;
		}
		document.execCommand(command, false);
		setContent(editorRef.current?.innerHTML || "");
	};

	const handleNew = () => {
		setActiveId(null);
		setTitle("");
		setContent("");
		if (editorRef.current) {
			editorRef.current.innerHTML = "";
		}
	};

	const handleSave = () => {
		const trimmedTitle = title.trim();
		const trimmedContent = content.trim();
		if (!trimmedTitle || !trimmedContent) {
			return;
		}

		setNotes((prev) => {
			if (activeId) {
				return prev.map((note) =>
					note.id === activeId
						? {
							...note,
							title: trimmedTitle,
							content: trimmedContent,
							updatedAt: new Date().toISOString(),
						}
						: note,
				);
			}

			return [
				{
					id: createNoteId(),
					title: trimmedTitle,
					content: trimmedContent,
					updatedAt: new Date().toISOString(),
				},
				...prev,
			];
		});
	};

	const handleDelete = (id: string) => {
		setNotes((prev) => prev.filter((note) => note.id !== id));
		if (activeId === id) {
			handleNew();
		}
	};

	const handleSelect = (note: Note) => {
		setActiveId(note.id);
		setTitle(note.title);
		setContent(note.content);
	};

	const sortedNotes = useMemo(
		() => [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
		[notes],
	);

	const activePreview = useMemo(() => {
		if (!content) {
			return "Start typing to capture your notes.";
		}
		const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
		return plain.slice(0, 140) + (plain.length > 140 ? "…" : "");
	}, [content]);

	return (
		<div style={layoutStyle}>
			<div style={{ display: "grid", gap: "16px", maxWidth: "340px", width: "100%" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>My Notes</h3>
					<button type="button" onClick={handleNew} style={{ ...ghostButtonStyle, padding: "8px 16px" }}>
						New note
					</button>
				</div>
				<div style={{ ...listSurfaceStyle, padding: "14px" }}>
					<div style={{ ...scrollAreaStyle, maxHeight: "320px" }}>
						{sortedNotes.length === 0 ? (
							<p style={{ ...subtleTextStyle, textAlign: "center", margin: "40px 0" }}>
								No notes yet — capture your first insight on the right.
							</p>
						) : (
							sortedNotes.map((note) => (
								<button
									key={note.id}
									type="button"
									onClick={() => handleSelect(note)}
									style={noteButtonStyle(activeId === note.id, accent)}
								>
									<strong style={{ fontSize: "15px" }}>{note.title}</strong>
									<span style={{ ...subtleTextStyle, fontSize: "12px" }}>
										{new Date(note.updatedAt).toLocaleString()}
									</span>
								</button>
							))
						)}
					</div>
				</div>
				{activeId ? (
					<button type="button" onClick={() => handleDelete(activeId)} style={{ ...ghostButtonStyle, padding: "8px 16px" }}>
						Delete note
					</button>
				) : null}
			</div>

			<div style={{ display: "grid", gap: "16px" }}>
				<div style={{ display: "grid", gap: "8px" }}>
					<label style={{ ...fieldLabelStyle, fontSize: "12px" }}>Title</label>
					<input
						type="text"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder="Exam prep outline"
						style={inputFieldStyle}
					/>
				</div>

				<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
					<button type="button" onClick={() => applyFormat("bold")} style={toolbarButtonStyle}>
						<strong>B</strong>
					</button>
					<button type="button" onClick={() => applyFormat("italic")} style={toolbarButtonStyle}>
						<em>I</em>
					</button>
					<button type="button" onClick={() => applyFormat("underline")} style={toolbarButtonStyle}>
						<span style={{ textDecoration: "underline" }}>U</span>
					</button>
				</div>

				<div
					ref={editorRef}
					contentEditable
					onInput={(event) => setContent((event.target as HTMLDivElement).innerHTML)}
					style={{ ...textareaFieldStyle, minHeight: "240px" }}
					data-placeholder="Write your note here"
				/>

				<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
					<button type="button" onClick={handleSave} style={primaryButtonStyle(accent)}>
						{activeId ? "Update note" : "Save note"}
					</button>
					<button type="button" onClick={handleNew} style={ghostButtonStyle}>
						Reset
					</button>
				</div>

				<div style={{ ...subtleTextStyle, fontSize: "13px" }}>{activePreview}</div>
			</div>
		</div>
	);
};

export default NoteTaker;
