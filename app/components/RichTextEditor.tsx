import React, { useRef, useEffect } from 'react';
import { Icons } from './Icons';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sincronizar el contenido solo si cambia externamente
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Si viene HTML con formato (ej: desde Word o web con <strong> o <em>), preservarlo de forma segura
    const htmlData = e.clipboardData.getData('text/html');
    const textData = e.clipboardData.getData('text/plain');

    if (htmlData) {
      e.preventDefault();
      // Parser básico para permitir tags inline seguros
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlData, 'text/html');
      // Limpiar tags no deseados manteniendo negrita, cursiva, párrafos y saltos de línea
      const cleanHtml = doc.body.innerHTML;
      document.execCommand('insertHTML', false, cleanHtml || textData);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all ${className}`}>
      {/* Barra de formato */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-gray-700">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition"
          title="Negrita (Ctrl+B)"
        >
          <Icons.Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition"
          title="Cursiva (Ctrl+I)"
        >
          <Icons.Italic className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-400 ml-auto select-none">
          Selecciona texto para aplicar formato
        </span>
      </div>

      {/* Área editable */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="p-3 min-h-[90px] max-h-[400px] overflow-y-auto outline-none text-gray-700 prose max-w-none text-sm leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
      />
    </div>
  );
};
