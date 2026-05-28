// @ts-nocheck
'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Unlink, Undo2, Redo2, Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCallback, useEffect, useState } from 'react'

/* ── Types ─────────────────────────────────────────────── */

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

/* ── Toolbar button ────────────────────────────────────── */

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      // Prevent the editor from losing focus + selection when the toolbar
      // is clicked. Without this, mousedown blurs the editor before the
      // click handler fires, so the selection is gone and commands like
      // toggleBold / toggleHeading operate on an empty range.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)]',
        'text-[var(--text-secondary)] transition-colors duration-150',
        'hover:bg-[var(--muted)] hover:text-[var(--text-primary)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        isActive && 'bg-[var(--primary-soft)] text-[var(--primary)]',
      )}
    >
      {children}
    </button>
  )
}

/* ── Toolbar separator ─────────────────────────────────── */

function ToolbarSep() {
  return <div className="mx-0.5 h-5 w-px bg-[var(--border)]" />
}

/* ── Toolbar ───────────────────────────────────────────── */

function Toolbar({ editor }: { editor: Editor }) {
  // Re-render on every editor transaction so isActive() and can() values
  // stay accurate as the cursor moves or content changes.
  const [, rerender] = useState(0)
  useEffect(() => {
    const update = () => rerender((n) => n + 1)
    editor.on('transaction', update)
    return () => { editor.off('transaction', update) }
  }, [editor])

  const setLink = useCallback(() => {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URL', prev)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--border)] bg-[var(--muted)] px-2 py-1.5">
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo2 className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarSep />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarSep />

      {/* Inline formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarSep />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarSep />

      {/* Blockquote + HR */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divider"
      >
        <Minus className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarSep />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <AlignLeft className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <AlignCenter className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <AlignRight className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarSep />

      {/* Link */}
      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive('link')}
        title="Add Link"
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      {editor.isActive('link') && (
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="Remove Link"
        >
          <Unlink className="h-3.5 w-3.5" />
        </ToolbarButton>
      )}
    </div>
  )
}

/* ── Editor ────────────────────────────────────────────── */

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing…',
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'tiptap-link' },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'funnel-prose outline-none min-h-[160px] px-4 py-3',
      },
    },
  })

  // Sync external value changes (e.g. when dialog opens with existing content)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    // Only reset if genuinely different (avoids cursor jump)
    if (value !== current) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)]',
        'bg-[var(--surface)] transition-shadow duration-150',
        'focus-within:ring-2 focus-within:ring-[var(--ring)] focus-within:border-[var(--primary)]',
        className,
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
