import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import axios from 'axios';
import { toast } from 'react-toastify';

const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4 border border-gray-300 rounded-md',
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          // Prevent form submission on Enter key
          if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },
  });

  const addImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const imageUrl = response.data.imageUrl || response.data.media?.url;
      if (imageUrl) {
        // The backend now returns a full URL (including host). Use it directly.
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const addImageFromUrl = async (url) => {
    if (!url || !url.match(/^https?:\/\/.+/)) {
      toast.error('Please enter a valid image URL');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('imageUrl', url);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.imageUrl || response.data.media?.url;
      if (imageUrl) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (error) {
      console.error('URL image upload error:', error);
      toast.error('Failed to upload image from URL. Please check the URL and try again.');
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${
            editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          title="Bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.469-3.014-2.469H2.543v7.922h4.817zM5.932 6.091v-2.48h1.846c.946 0 1.377.372 1.377 1.24 0 .636-.419 1.24-1.377 1.24H5.932zm2.78 5.169v-2.78h1.923c.962 0 1.377.485 1.377 1.392 0 .896-.415 1.388-1.377 1.388H8.712z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${
            editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          title="Italic"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded ${
            editor.isActive('strike') ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          title="Strike"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M6.333 5.686c0 .31.083.581.27.814H5.166a2.776 2.776 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607zm2.194 7.478c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.627-.217-.993-.698-1.253l-2.267-.932c-.967-.393-1.683-1.116-1.683-2.19 0-1.413 1.25-2.404 3.081-2.404 1.834 0 3.097 1.025 3.097 2.509h-1.229c-.095-.836-.825-1.356-1.915-1.356-1.187 0-2.027.556-2.027 1.34 0 .57.24.926.814 1.165l2.27.933c1.016.424 1.635 1.058 1.635 2.174 0 1.534-1.411 2.596-3.527 2.596Z"/>
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          type="button"
          className={`p-2 rounded font-bold ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-blue-600' : 'hover:bg-gray-100'
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          type="button"
          className={`p-2 rounded font-bold ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-blue-600' : 'hover:bg-gray-100'
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          type="button"
          className={`p-2 rounded font-bold ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-blue-600' : 'hover:bg-gray-100'
          }`}
          title="Heading 3"
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${
            editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          title="Bullet List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${
            editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          title="Ordered List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3.854 2.146a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 1 1-.708-.708l.647-.646H.5a.5.5 0 0 1 0-1h1.793l-.647-.646a.5.5 0 1 1 .708-.708l1.5 1.5zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 1 1-.708-.708l.647-.646H.5a.5.5 0 0 1 0-1h1.793l-.647-.646a.5.5 0 1 1 .708-.708l1.5 1.5zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 1 1-.708-.708l.647-.646H.5a.5.5 0 0 1 0-1h1.793l-.647-.646a.5.5 0 0 1 .708-.708l1.5 1.5z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded ${
            editor.isActive('codeBlock') ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          title="Code Block"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.854 4.146a.5.5 0 0 1 0 .708L2.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0zm4.292 0a.5.5 0 0 0 0 .708L13.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded ${
            editor.isActive('blockquote') ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          title="Quote"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm5 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm-5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm.79-5.373c.112-.078.26-.17.444-.275L3.524 6c-.122.074-.272.17-.452.287-.18.117-.35.26-.51.428a2.425 2.425 0 0 0-.398.562c-.11.207-.164.438-.164.692 0 .36.072.65.217.873.144.219.385.328.72.328.215 0 .383-.07.504-.211a.697.697 0 0 0 .188-.463c0-.23-.07-.404-.211-.521-.137-.121-.326-.182-.568-.182h-.282c.024-.203.065-.37.123-.498a1.38 1.38 0 0 1 .252-.37 1.94 1.94 0 0 1 .346-.298zm2.167 0c.113-.078.262-.17.445-.275L5.692 6c-.122.074-.272.17-.452.287-.18.117-.35.26-.51.428a2.425 2.425 0 0 0-.398.562c-.11.207-.164.438-.164.692 0 .36.072.65.217.873.144.219.385.328.72.328.215 0 .383-.07.504-.211a.697.697 0 0 0 .188-.463c0-.23-.07-.404-.211-.521-.137-.121-.326-.182-.568-.182h-.282c.024-.203.065-.37.123-.498a1.38 1.38 0 0 1 .252-.37 1.94 1.94 0 0 1 .346-.298z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-gray-100"
          title="Horizontal Rule"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 8a1 1 0 0 1 1-1h14a1 1 0 0 1 0 2H1a1 1 0 0 1-1-1z"/>
          </svg>
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={addImage}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="p-2 rounded hover:bg-gray-100 cursor-pointer" title="Add Image">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 14.5 0h-13zM1 1.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-13z"/>
            <path d="M4.5 4.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 2a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 2a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm-2.492 3.99a.5.5 0 0 0 0 .02.5.5 0 0 0 .492.49.5.5 0 0 0 .5-.5v-1.5a.5.5 0 0 0-1 0v1.5z"/>
            <path d="M10.5 10.5a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm-2.5.5a.5.5 0 0 1-.5-.5v-1.5a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5z"/>
            <path d="M4.5 10.5a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
          </svg>
        </label>
        <input
          type="text"
          placeholder="Image URL"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const url = e.target.value.trim();
              if (url) {
                addImageFromUrl(url);
                e.target.value = '';
              }
            }
          }}
          className="px-2 py-1 text-xs border border-gray-300 rounded"
          title="Press Enter to add image from URL"
        />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-100"
          title="Undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-100"
          title="Redo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;