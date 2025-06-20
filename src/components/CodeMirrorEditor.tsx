'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentWithTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { 
  Wand2, 
  Trash2, 
  Copy
} from 'lucide-react';

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const CodeMirrorEditor = React.memo(({ value, onChange }: CodeMirrorEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const isInitializedRef = useRef(false);
  const lastValueRef = useRef(value);
  const isUpdatingRef = useRef(false);

  const handleChange = useCallback((newValue: string) => {
    if (isUpdatingRef.current) return; // Prevent recursive updates
    
    lastValueRef.current = newValue;
    onChange(newValue);
  }, [onChange]);

  // Initialize editor only once
  useEffect(() => {
    if (!editorRef.current || isInitializedRef.current) return;

    try {
      // Create editor state
      const state = EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          javascript(),
          oneDark,
          keymap.of([indentWithTab]), // Enable tab key
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !isUpdatingRef.current) {
              const newValue = update.state.doc.toString();
              // Only trigger onChange if the value actually changed
              if (newValue !== lastValueRef.current) {
                handleChange(newValue);
              }
            }
          }),
          EditorView.theme({
            '&': {
              height: '100%',
              fontSize: '14px',
            },
            '.cm-editor': {
              height: '100%',
              maxHeight: '100%',
            },
            '.cm-scroller': {
              fontFamily: 'monospace',
              overflow: 'auto',
              maxHeight: '100%',
            },
            '.cm-content': {
              padding: '8px 0',
              minHeight: '100%',
            },
            '.cm-line': {
              padding: '0 8px',
            },
            '.cm-tooltip': {
              maxHeight: '200px',
              overflow: 'auto',
            },
          }),
        ],
      });

      // Create editor view
      const view = new EditorView({
        state,
        parent: editorRef.current,
      });

      editorViewRef.current = view;
      isInitializedRef.current = true;
    } catch (error) {
      console.error('Failed to initialize CodeMirror editor:', error);
    }

    // Cleanup function
    return () => {
      if (editorViewRef.current) {
        try {
          editorViewRef.current.destroy();
          editorViewRef.current = null;
          isInitializedRef.current = false;
        } catch (error) {
          console.error('Error destroying CodeMirror editor:', error);
        }
      }
    };
  }, [value, handleChange]);

  // Update editor content when value prop changes (but not during initialization)
  useEffect(() => {
    if (editorViewRef.current && isInitializedRef.current) {
      const currentValue = editorViewRef.current.state.doc.toString();
      
      // Only update if the value has actually changed and it's different from what we last set
      if (currentValue !== value && value !== lastValueRef.current) {
        try {
          isUpdatingRef.current = true;
          
          const transaction = editorViewRef.current.state.update({
            changes: {
              from: 0,
              to: editorViewRef.current.state.doc.length,
              insert: value,
            },
          });
          
          editorViewRef.current.dispatch(transaction);
          lastValueRef.current = value;
        } catch (error) {
          console.error('Error updating CodeMirror content:', error);
        } finally {
          isUpdatingRef.current = false;
        }
      }
    }
  }, [value]);

  const formatCode = () => {
    if (editorViewRef.current) {
      // Improved formatting that preserves existing indentation and handles Mermaid syntax
      const currentValue = editorViewRef.current.state.doc.toString();
      const lines = currentValue.split('\n');
      
      const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed === '') return '';
        
        // Preserve existing indentation for Mermaid-specific lines
        const originalIndent = line.match(/^\s*/)?.[0] || '';
        
        // Don't modify indentation for Mermaid diagram type declarations
        if (trimmed.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitgraph|mindmap|timeline|quadrantChart|requirement|zenuml|sankey|c4)/)) {
          return originalIndent + trimmed;
        }
        
        // Don't modify indentation for Mermaid comments
        if (trimmed.startsWith('%%')) {
          return originalIndent + trimmed;
        }
        
        // Don't modify indentation for subgraph declarations
        if (trimmed.startsWith('subgraph') || trimmed.startsWith('end')) {
          return originalIndent + trimmed;
        }
        
        // For other lines, preserve the original indentation
        return originalIndent + trimmed;
      });
      
      const formattedCode = formattedLines.join('\n');
      handleChange(formattedCode);
    }
  };

  const clearCode = () => {
    handleChange('');
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-1">
          <button
            onClick={formatCode}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Format Code"
          >
            <Wand2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={copyCode}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Copy Code"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={clearCode}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Clear Code"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div ref={editorRef} className="h-full w-full" />
      </div>
    </div>
  );
});

CodeMirrorEditor.displayName = 'CodeMirrorEditor';

export default CodeMirrorEditor; 