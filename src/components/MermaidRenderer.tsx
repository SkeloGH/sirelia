'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText,
  Image,
  GitBranch
} from 'lucide-react';

interface MermaidRendererProps {
  code: string;
  className?: string;
}

export default function MermaidRenderer({ code, className = '' }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [scale, setScale] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Mermaid
  useEffect(() => {
    if (hasInitialized) return;

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, sans-serif',
      });
      setHasInitialized(true);
    } catch (err) {
      console.error('MermaidRenderer: Failed to initialize Mermaid:', err);
      setError('Failed to initialize diagram renderer');
    }
  }, [hasInitialized]);

  // Render diagram
  useEffect(() => {
    if (!hasInitialized || !code.trim()) {
      setSvgContent('');
      return;
    }

    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(async () => {
      try {
        setIsRendering(true);
        setError('');

        const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, code);
        
        setSvgContent(svg);
        setScale(1); // Reset zoom when new diagram is rendered
        setSelectedNode(null); // Reset selection
      } catch (err) {
        console.error('MermaidRenderer: Rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
        setSvgContent('');
      } finally {
        setIsRendering(false);
      }
    }, 100);

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [code, hasInitialized]);

  // Add interactive features to SVG
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    // Add zoom transform
    svgElement.style.transform = `scale(${scale})`;
    svgElement.style.transformOrigin = 'center center';
    svgElement.style.transition = 'transform 0.2s ease-in-out';

    // Add click handlers for nodes
    const nodes = svgElement.querySelectorAll('.node, .label, text');
    nodes.forEach((node) => {
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeId = node.getAttribute('id') || node.textContent || 'unknown';
        setSelectedNode(selectedNode === nodeId ? null : nodeId);
      });
    });

    // Add click handler to reset selection
    svgElement.addEventListener('click', (e) => {
      if (e.target === svgElement) {
        setSelectedNode(null);
      }
    });

    return () => {
      // Cleanup event listeners
      nodes.forEach((node) => {
        node.removeEventListener('click', () => {});
      });
      svgElement.removeEventListener('click', () => {});
    };
  }, [svgContent, scale, selectedNode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, []);

  const zoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.3));
  const resetZoom = () => setScale(1);

  const exportAsMmd = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.mmd';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsGv = () => {
    // Convert Mermaid to Graphviz format (basic conversion)
    let gvCode = 'digraph G {\n';
    const lines = code.split('\n');
    let inGraph = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('graph') || trimmed.startsWith('flowchart')) {
        inGraph = true;
        continue;
      }
      if (inGraph && trimmed) {
        // Basic conversion - replace Mermaid syntax with Graphviz
        const gvLine = trimmed
          .replace(/\[([^\]]+)\]/g, ' [label="$1"]')
          .replace(/-->/, ' -> ')
          .replace(/---/, ' -- ')
          .replace(/\{([^}]+)\}/g, ' [shape=diamond, label="$1"]');
        gvCode += '  ' + gvLine + '\n';
      }
    }
    gvCode += '}';
    
    const blob = new Blob([gvCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.gv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPng = async () => {
    if (!containerRef.current) return;
    
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    try {
      // Create a canvas to render the SVG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get SVG dimensions
      const svgRect = svgElement.getBoundingClientRect();
      canvas.width = svgRect.width * 2; // Higher resolution
      canvas.height = svgRect.height * 2;

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      // Create image and draw to canvas
      const img = new window.Image();
      img.onload = () => {
        ctx.scale(2, 2); // Scale for higher resolution
        ctx.drawImage(img, 0, 0);
        
        // Convert to PNG and download
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = 'diagram.png';
            a.click();
            URL.revokeObjectURL(pngUrl);
          }
        }, 'image/png');
      };
      img.src = url;
    } catch (error) {
      console.error('Failed to export as PNG:', error);
    }
  };

  if (error) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <div className="text-red-500 text-sm font-medium mb-1">Rendering Error</div>
        <div className="text-gray-600 text-xs">{error}</div>
      </div>
    );
  }

  if (isRendering) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="text-gray-500 text-sm">Rendering...</div>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className={`flex items-center justify-center p-4 text-gray-400 text-sm ${className}`}>
        No diagram to display
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-1">
          <button
            onClick={zoomIn}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetZoom}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 ml-2">
            {Math.round(scale * 100)}%
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={exportAsMmd}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Export as .mmd"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={exportAsGv}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Export as .gv"
          >
            <GitBranch className="w-4 h-4" />
          </button>
          <button
            onClick={exportAsPng}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Export as .png"
          >
            <Image className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Diagram Container */}
      <div className="flex-1 overflow-auto relative">
        <div 
          ref={containerRef}
          className="w-full h-full flex items-center justify-center p-4"
          dangerouslySetInnerHTML={{ __html: svgContent }}
          style={{
            filter: selectedNode ? 'brightness(0.7)' : 'none',
            transition: 'filter 0.2s ease-in-out'
          }}
        />
      </div>
    </div>
  );
} 