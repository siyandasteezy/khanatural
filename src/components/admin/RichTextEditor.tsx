"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useState, type ReactNode } from "react";

/**
 * Formatting editor for product and article copy.
 *
 * These fields hold HTML and used to be edited as raw markup in a textarea,
 * which asked the shop owner to write tags. The editor keeps HTML as the stored
 * format — the storefront renders it through `.prose-migrated`, and every
 * migrated WooCommerce description already is HTML — but nobody has to type it.
 *
 * The value reaches the server action through a hidden input rather than any
 * client-side submit handling, so the surrounding <form action={serverAction}>
 * keeps working unchanged.
 */

type Props = {
  name: string;
  defaultValue?: string;
  /** rows-ish: minimum editing height */
  minHeight?: string;
  ariaLabel: string;
};

export function RichTextEditor({ name, defaultValue = "", minHeight = "10rem", ariaLabel }: Props) {
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    // Next renders this on the server first; letting Tiptap render immediately
    // produces a hydration mismatch.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // the storefront styles h2/h3/h4 only — offering h1 would compete with
        // the page's own heading and hurt the page structure
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener", target: "_blank" } },
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "prose-admin focus:outline-none",
        "aria-label": ariaLabel,
      },
    },
    onUpdate: ({ editor }) => {
      // Tiptap represents "empty" as <p></p>; store nothing rather than markup
      // that renders as a stray blank paragraph on the storefront.
      setHtml(editor.isEmpty ? "" : editor.getHTML());
    },
  });

  return (
    <div className="rounded-xl border border-sand-300 bg-white focus-within:border-kelp-600">
      <Toolbar editor={editor} />
      <div className="px-4 py-3" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address", previous ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    // keeps the field from jumping when the editor mounts
    return <div className="h-11 rounded-t-xl border-b border-sand-200 bg-sand-50" />;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-xl border-b border-sand-200 bg-sand-50 px-2 py-1.5">
      <Tool
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </Tool>
      <Tool
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="font-serif italic">I</span>
      </Tool>

      <Divider />

      <Tool
        label="Heading"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H1
      </Tool>
      <Tool
        label="Subheading"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H2
      </Tool>

      <Divider />

      <Tool
        label="Bulleted list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • —
      </Tool>
      <Tool
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. —
      </Tool>

      <Divider />

      <Tool label="Add or edit link" active={editor.isActive("link")} onClick={setLink}>
        Link
      </Tool>
      <Tool
        label="Remove formatting"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        Clear
      </Tool>

      <span className="ml-auto flex gap-1">
        <Tool label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          ↶
        </Tool>
        <Tool label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          ↷
        </Tool>
      </span>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-sand-300" />;
}

function Tool({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button" // never submit the surrounding form
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm transition-colors disabled:opacity-30 ${
        active ? "bg-kelp-800 text-sand-50" : "text-kelp-900 hover:bg-sand-200"
      }`}
    >
      {children}
    </button>
  );
}
