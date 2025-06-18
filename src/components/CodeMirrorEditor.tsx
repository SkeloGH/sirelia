'use client';

import { useEffect, useRef, useCallback } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CodeMirrorEditor({ value, onChange }: CodeMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const isInitializedRef = useRef(false);

  const handleChange = useCallback((newValue: string) => {
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
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              handleChange(update.state.doc.toString());
            }
          }),
          EditorView.theme({
            '&': {
              height: '100%',
              fontSize: '14px',
            },
            '.cm-editor': {
              height: '100%',
            },
            '.cm-scroller': {
              fontFamily: 'monospace',
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
      if (currentValue !== value) {
        try {
          const transaction = editorViewRef.current.state.update({
            changes: {
              from: 0,
              to: editorViewRef.current.state.doc.length,
              insert: value,
            },
          });
          editorViewRef.current.dispatch(transaction);
        } catch (error) {
          console.error('Error updating CodeMirror content:', error);
        }
      }
    }
  }, [value]);

  return (
    <div className="h-full w-full">
      <div ref={editorRef} className="h-full w-full" />
    </div>
  );
} 