"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import TiptapUnderline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, UnderlineIcon, Heading1, Heading2, List, ListOrdered, ListChecks,
  Link2, ImagePlus, Quote, Code, Table as TableIcon, Minus, Undo2, Redo2,
  Sparkles, Check, Loader2,
} from "lucide-react";
import { ImageLightbox } from "./ImageLightbox";

const JOURNAL_TEMPLATE = `
  <h2>Why I Entered</h2>
  <p></p>
  <h2>Market Analysis</h2>
  <p></p>
  <h2>My Emotions</h2>
  <p></p>
  <h2>Mistakes</h2>
  <p></p>
  <h2>Lessons Learned</h2>
  <p></p>
  <h2>What I'll Improve Next Time</h2>
  <p></p>
`;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ToolbarButton({
  onClick, active, title, children,
}: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${active ? "bg-zinc-50 text-zinc-950" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"}`}
    >
      {children}
    </button>
  );
}

export function TradeJournalEditor({
  content, onSave,
}: { content: string; onSave: (html: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const [saveState, setSaveState] = useState<"idle" | "pending" | "saved">("idle");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const editor = useEditor({
    // Prevents Tiptap from rendering during SSR, which avoids a server/client
    // hydration mismatch in the Next.js App Router.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TiptapUnderline,
      TiptapImage.configure({ HTMLAttributes: { class: "journal-image" } }),
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: "journal-link" } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: ({ node }) => (node.type.name === "heading" ? "Heading" : "Write your thoughts… why you entered, market analysis, emotions, mistakes, lessons."),
        showOnlyCurrent: false,
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: { class: "journal-content focus:outline-none" },
      handleClickOn: (_view, _pos, node) => {
        if (node.type.name === "image" && node.attrs.src) {
          setLightboxSrc(node.attrs.src as string);
          return true;
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const imageFiles: File[] = [];
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) imageFiles.push(file);
          }
        }
        if (imageFiles.length === 0) return false;
        event.preventDefault();
        (async () => {
          for (const file of imageFiles) {
            const src = await fileToDataUrl(file);
            editor?.chain().focus().setImage({ src }).run();
          }
        })();
        return true;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || !files.length) return false;
        const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
        if (imageFiles.length === 0) return false;
        event.preventDefault();
        (async () => {
          for (const file of imageFiles) {
            const src = await fileToDataUrl(file);
            editor?.chain().focus().setImage({ src }).run();
          }
        })();
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      setSaveState("pending");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        onSave(editor.getHTML());
        setSaveState("saved");
      }, 600);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
  });

  useEffect(() => {
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, []);

  const insertTemplate = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContent(JOURNAL_TEMPLATE).run();
  }, [editor]);

  const insertLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const handleImageFiles = useCallback(async (files: FileList) => {
    if (!editor) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const src = await fileToDataUrl(file);
      editor.chain().focus().setImage({ src }).run();
    }
  }, [editor]);

  if (!editor) {
    return <div className="min-h-[400px] rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse" />;
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-2 border-b border-zinc-800 bg-zinc-950/60 flex-wrap sticky top-0 z-[1]">
        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton title="Heading" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton title="Subheading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton title="Checklist" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <ListChecks size={15} />
        </ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code size={15} />
        </ToolbarButton>
        <ToolbarButton title="Table" onClick={insertTable}>
          <TableIcon size={15} />
        </ToolbarButton>
        <ToolbarButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={15} />
        </ToolbarButton>
        <ToolbarButton title="Link" active={editor.isActive("link")} onClick={insertLink}>
          <Link2 size={15} />
        </ToolbarButton>
        <ToolbarButton title="Insert image(s)" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus size={15} />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) handleImageFiles(e.target.files); e.target.value = ""; }}
        />
        <div className="w-px h-5 bg-zinc-800 mx-1" />
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={15} />
        </ToolbarButton>

        <div className="flex-1" />

        <button
          type="button"
          onClick={insertTemplate}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 transition-colors"
          title="Insert a guided journal template"
        >
          <Sparkles size={13} /> Journal Template
        </button>

        <div className="flex items-center gap-1.5 pl-2 text-[11px] text-zinc-500 min-w-[64px] justify-end">
          {saveState === "pending" && <><Loader2 size={12} className="animate-spin" /> Saving…</>}
          {saveState === "saved" && <><Check size={12} className="text-emerald-400" /> Saved</>}
        </div>
      </div>

      {/* Mobile template button */}
      <div className="sm:hidden px-3 pt-3">
        <button
          type="button"
          onClick={insertTemplate}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-amber-400 bg-amber-400/10"
        >
          <Sparkles size={13} /> Insert Journal Template
        </button>
      </div>

      {/* Editable document area — grows naturally with content, no inner
          scroll cap. The parent modal (TradeJournalModal) is the single
          scroll container, so the journal reads like a real page. */}
      <div className="px-4 sm:px-8 py-6 w-full cursor-text" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>

      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}
