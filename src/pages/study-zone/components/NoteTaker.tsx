import React, { useEffect, useMemo, useRef, useState } from "react";
import { scrollAreaStyle } from "../styles";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { recordStudySession } from "@/lib/studyStats";
import { sanitizeHtml } from "@/lib/sanitize";

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

const toolbarButtonClass = "zone-btn-ghost !px-3 !py-1.5 text-sm";

const createNoteId = () =>
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? (crypto as Crypto).randomUUID()
		: `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const NoteTaker: React.FC<NoteTakerProps> = () => {
	const [notes, setNotes] = useLocalStorage<Note[]>("studyzone_notes", []);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const editorRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (editorRef.current && editorRef.current.innerHTML !== content) {
			editorRef.current.innerHTML = sanitizeHtml(content);
		}
	}, [content]);

	const applyFormat = (command: FormatCommand) => {
		if (typeof document === "undefined") {
			return;
		}
		document.execCommand(command, false);
		setContent(sanitizeHtml(editorRef.current?.innerHTML || ""));
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
		const trimmedContent = sanitizeHtml(content).trim();
		if (!trimmedTitle || !trimmedContent) {
			return;
		}

		if (activeId) {
			setNotes((prev) =>
				prev.map((note) =>
					note.id === activeId
						? {
							...note,
							title: trimmedTitle,
							content: trimmedContent,
							updatedAt: new Date().toISOString(),
						}
						: note,
				),
			);
			return;
		}

		const newId = createNoteId();
		setNotes((prev) => [
			{
				id: newId,
				title: trimmedTitle,
				content: trimmedContent,
				updatedAt: new Date().toISOString(),
			},
			...prev,
		]);
		setActiveId(newId);
		recordStudySession();
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
		<div className="zone-note-layout">
			<div className="grid gap-4 max-w-[340px] w-full">
				<div className="flex items-center justify-between">
					<h3 className="m-0 text-lg font-semibold text-foreground">My Notes</h3>
					<button type="button" onClick={handleNew} className="zone-btn-ghost !px-4 !py-2">
						New note
					</button>
				</div>
				<div className="zone-list-surface !p-3.5">
					<div style={{ ...scrollAreaStyle, maxHeight: "320px" }} className="grid gap-2">
						{sortedNotes.length === 0 ? (
							<p className="zone-subtle text-center my-10">Nothing here yet — jot down your first thought on the right.</p>
						) : (
							sortedNotes.map((note) => (
								<button
									key={note.id}
									type="button"
									onClick={() => handleSelect(note)}
									className="zone-note-btn"
									data-active={activeId === note.id}
								>
									<strong className="text-[15px]">{note.title}</strong>
									<span className="text-xs text-muted-foreground">
										{new Date(note.updatedAt).toLocaleString()}
									</span>
								</button>
							))
						)}
					</div>
				</div>
				{activeId ? (
					<button type="button" onClick={() => handleDelete(activeId)} className="zone-btn-ghost !px-4 !py-2">
						Delete note
					</button>
				) : null}
			</div>

			<div className="grid gap-4">
				<div className="grid gap-2">
					<label className="form-label text-xs uppercase tracking-widest">Title</label>
					<input
						type="text"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder="Exam prep outline"
						className="form-control"
					/>
				</div>

				<div className="flex flex-wrap gap-2.5">
					<button type="button" onClick={() => applyFormat("bold")} className={toolbarButtonClass}>
						<strong>B</strong>
					</button>
					<button type="button" onClick={() => applyFormat("italic")} className={toolbarButtonClass}>
						<em>I</em>
					</button>
					<button type="button" onClick={() => applyFormat("underline")} className={toolbarButtonClass}>
						<span className="underline">U</span>
					</button>
				</div>

				<div
					ref={editorRef}
					contentEditable
					onInput={(event) => setContent(sanitizeHtml((event.target as HTMLDivElement).innerHTML))}
					className="form-textarea min-h-[240px]"
					data-placeholder="Write your note here"
				/>

				<div className="flex flex-wrap gap-3">
					<button type="button" onClick={handleSave} className="zone-btn-primary">
						{activeId ? "Update note" : "Save note"}
					</button>
					<button type="button" onClick={handleNew} className="zone-btn-ghost">
						Reset
					</button>
				</div>

				<div className="zone-subtle text-[13px]">{activePreview}</div>
			</div>
		</div>
	);
};

export default NoteTaker;
