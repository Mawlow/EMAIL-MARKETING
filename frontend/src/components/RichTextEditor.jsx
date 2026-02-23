import { useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import './RichTextEditor.css';

const PLACEHOLDER = 'Write your email content here. Use {{unsubscribe_url}} and {{email}} — they are replaced when sending.';

function Toolbar({ editor }) {
  const fileInputRef = useRef(null);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('URL:', 'https://');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImageFromFile = () => {
    fileInputRef.current?.click();
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="tiptap-toolbar">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="tiptap-toolbar-file-input"
        aria-label="Insert image from file"
        onChange={handleImageFile}
      />
      <select
        value=""
        onChange={(e) => {
          const v = e.target.value;
          e.target.value = '';
          if (v === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
          if (v === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
          if (v === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
          if (v === 'p') editor.chain().focus().setParagraph().run();
        }}
        className="tiptap-toolbar-select"
        title="Heading"
      >
        <option value="">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''} title="Bold">B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''} title="Italic">I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'active' : ''} title="Underline">U</button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'active' : ''} title="Strikethrough">S</button>
      <span className="tiptap-toolbar-sep" />
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''} title="Numbered list">1.</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''} title="Bullet list">•</button>
      <span className="tiptap-toolbar-sep" />
      <button type="button" onClick={addLink} className={editor.isActive('link') ? 'active' : ''} title="Link">Link</button>
      <button type="button" onClick={addImageFromFile} title="Insert image from file">Img</button>
      <button type="button" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting">Clear</button>
    </div>
  );
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 280 }) {
  const isInternalChange = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
        style: `min-height: ${minHeight}px;`,
        'data-placeholder': placeholder || PLACEHOLDER,
      },
    },
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const next = value ?? '';
    const current = editor.getHTML();
    if (next !== current) {
      editor.commands.setContent(next || '<p></p>', false);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="rich-text-editor-wrapper tiptap-wrapper" style={{ minHeight }}>
        <div className="tiptap-loading">Loading editor…</div>
      </div>
    );
  }

  return (
    <div className="rich-text-editor-wrapper tiptap-wrapper" style={{ minHeight }}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
