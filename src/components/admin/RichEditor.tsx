"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough,
  Code,
  Code2,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Undo,
  Redo,
  Eraser,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const IMAGE_URL_RE = /^https?:\/\/[^\s]+\.(jpe?g|png|webp|gif|avif|svg)(\?[^\s]*)?$/i;

async function uploadImageFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!r.ok) {
    const data = (await r.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "上传失败");
  }
  const { data } = (await r.json()) as { data: { url: string } };
  return data.url;
}

/** 自定义扩展：处理粘贴/拖拽图片 + 粘贴 URL → 图片 */
function PasteImageExtension(setUploading: (v: boolean) => void) {
  return Extension.create({
    name: "pasteImage",
    addProseMirrorPlugins() {
      const editor = this.editor;
      return [
        new Plugin({
          props: {
            handlePaste: (_view, event) => {
              // 1) 剪切板里有 image/* 文件 → 上传
              const items = Array.from(event.clipboardData?.items ?? []);
              const imageItem = items.find((i) => i.type.startsWith("image/"));
              if (imageItem) {
                const file = imageItem.getAsFile();
                if (file) {
                  event.preventDefault();
                  void (async () => {
                    setUploading(true);
                    try {
                      const url = await uploadImageFile(file);
                      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
                    } catch (e) {
                      alert(e instanceof Error ? e.message : "上传失败");
                    } finally {
                      setUploading(false);
                    }
                  })();
                  return true;
                }
              }
              // 2) 粘贴的纯文本是图片 URL → 转图片
              const text = event.clipboardData?.getData("text/plain")?.trim();
              if (text && IMAGE_URL_RE.test(text)) {
                event.preventDefault();
                editor.chain().focus().setImage({ src: text }).run();
                return true;
              }
              return false;
            },
            handleDrop: (_view, event) => {
              const dragEvent = event as DragEvent;
              const file = Array.from(dragEvent.dataTransfer?.files ?? []).find((f) =>
                f.type.startsWith("image/"),
              );
              if (!file) return false;
              event.preventDefault();
              void (async () => {
                setUploading(true);
                try {
                  const url = await uploadImageFile(file);
                  editor.chain().focus().setImage({ src: url, alt: file.name }).run();
                } catch (e) {
                  alert(e instanceof Error ? e.message : "上传失败");
                } finally {
                  setUploading(false);
                }
              })();
              return true;
            },
          },
        }),
      ];
    },
  });
}

export function RichEditor({
  value,
  onChange,
  placeholder = "开始写下你的想法… 可直接粘贴 / 拖拽图片",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const setUploadingRef = useRef(setUploading);
  setUploadingRef.current = setUploading;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: {
          HTMLAttributes: {
            class: "rounded bg-bg-subtle p-3 font-mono text-[0.92em]",
          },
        },
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "underline underline-offset-4 decoration-border decoration-2 hover:decoration-fg",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded" },
      }),
      Placeholder.configure({ placeholder, emptyEditorClass: "is-editor-empty" }),
      PasteImageExtension((v) => setUploadingRef.current(v)),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none font-serif text-[1.02rem] leading-[1.78] dark:prose-invert prose-headings:font-sans prose-headings:tracking-tight prose-headings:font-semibold prose-a:text-fg prose-blockquote:border-l-fg prose-blockquote:bg-transparent prose-blockquote:px-5 prose-blockquote:text-fg prose-blockquote:not-italic prose-code:rounded prose-code:bg-bg-subtle prose-code:px-1.5 prose-code:py-0.5 prose-pre:bg-bg-subtle prose-pre:text-fg min-h-[400px] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return <div className="min-h-[440px] border border-border bg-bg-subtle/30" aria-busy />;
  }

  return (
    <div className="relative border border-border bg-bg">
      <Toolbar editor={editor} setUploading={setUploading} />
      <div className="px-5 py-6">
        <EditorContent editor={editor} />
      </div>

      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/70 backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 bg-fg px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-bg">
            <Loader2 className="h-4 w-4 animate-spin" /> 上传中
          </div>
        </div>
      )}

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--fg-subtle);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror:focus-visible { outline: none; }
        .ProseMirror img { max-width: 100%; height: auto; }
      `}</style>
    </div>
  );
}

function Toolbar({
  editor,
  setUploading,
}: {
  editor: Editor;
  setUploading: (v: boolean) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-bg-subtle/50 px-2 py-1.5">
      <Btn title="撤销" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo className="h-4 w-4" />
      </Btn>
      <Btn title="重做" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn title="标题 2（H2）" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </Btn>
      <Btn title="标题 3（H3）" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn title="粗体（⌘B）" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <BoldIcon className="h-4 w-4" />
      </Btn>
      <Btn title="斜体（⌘I）" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <ItalicIcon className="h-4 w-4" />
      </Btn>
      <Btn title="删除线" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </Btn>
      <Btn title="行内代码" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn title="无序列表" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Btn>
      <Btn title="有序列表" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </Btn>
      <Btn title="引用" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </Btn>
      <Btn title="代码块" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 className="h-4 w-4" />
      </Btn>
      <Btn title="分隔线" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn
        title="链接"
        active={editor.isActive("link")}
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("链接地址（留空可取消链接）", prev ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >
        <LinkIcon className="h-4 w-4" />
      </Btn>
      <Btn title="上传图片 / 粘贴 / 拖拽" onClick={() => fileRef.current?.click()}>
        <ImageIcon className="h-4 w-4" />
      </Btn>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onPickFile}
      />
      <Sep />
      <Btn title="清除格式" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        <Eraser className="h-4 w-4" />
      </Btn>

      <span className="ml-auto text-[10px] uppercase tracking-[0.14em] text-fg-subtle">
        可粘贴 / 拖拽图片
      </span>
    </div>
  );
}

function Btn({
  title,
  active,
  disabled,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`ring-focus inline-flex h-8 w-8 items-center justify-center rounded transition disabled:opacity-30 ${
        active ? "bg-fg text-bg" : "text-fg-muted hover:bg-bg-subtle hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-border" />;
}
