import { useEffect, useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useStore } from '../lib/store';
import { getSocket } from '../lib/socket';

export const Editor = () => {
  const { room } = useStore();
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    if (!room) return;
    
    const currentDev = room.developers.find(dev => dev.id === getSocket().id);
    setIsEditable(currentDev?.isActive || false);
  }, [room]);

  const handleChange = (value: string | undefined) => {
    if (!value || !isEditable) return;
    getSocket().emit('code-update', value);
  };

  return (
    <div className="h-[600px] w-full border border-gray-300 rounded-lg overflow-hidden shadow-lg">
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
        <div className="text-sm">
          {isEditable ? '✏️ Your turn to code' : '👀 Viewing mode'}
        </div>
        <div className="text-xs text-gray-400">
          TypeScript
        </div>
      </div>
      <MonacoEditor
        // height="calc(100% - 40px)"
        height="200px"
        defaultLanguage="typescript"
        theme="vs-dark"
        value={room?.currentCode || '// Start coding here...'}
        onChange={handleChange}
        options={{
          readOnly: !isEditable,
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 22,
          padding: { top: 10 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          // cursorSmoothCaretAnimation: true,
          formatOnPaste: true,
          formatOnType: true,
          wordWrap: "on",
        }}
        loading={<div className="h-full w-full flex items-center justify-center bg-gray-900 text-white">Loading editor...</div>}
      />
    </div>
  );
};