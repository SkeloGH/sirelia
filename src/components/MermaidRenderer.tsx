'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText,
  Image,
  GitBranch,
  Move,
  MousePointer
} from 'lucide-react';

interface MermaidRendererProps {
  code: string;
  className?: string;
}

export default function MermaidRenderer({ code, className = '' }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [scale, setScale] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [navigationMode, setNavigationMode] = useState<'drag' | 'select'>('drag');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [svgTransform, setSvgTransform] = useState({ x: 0, y: 0 });
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter out comments and clean up code
  const filterCode = (rawCode: string): string => {
    return rawCode
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.startsWith('%%');
      })
      .join('\n')
      .trim();
  };

  // Check if code contains valid Mermaid syntax
  const isValidMermaidCode = useCallback((code: string): boolean => {
    const filteredCode = filterCode(code);
    if (!filteredCode.trim()) return false;
    
    // Check for common Mermaid diagram types (v11 supports more types)
    const diagramTypes = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
      'stateDiagram', 'entityRelationshipDiagram', 'userJourney',
      'gantt', 'pie', 'quadrantChart', 'requirement', 'gitgraph',
      'mindmap', 'timeline', 'zenuml', 'sankey', 'c4', 'journey'
    ];
    
    return diagramTypes.some(type => 
      filteredCode.toLowerCase().includes(type.toLowerCase())
    );
  }, []);

  // Clean up any stray Mermaid nodes that might have been appended outside the body
  const cleanupStrayMermaidNodes = () => {
    // Only target elements that are clearly Mermaid-generated
    // Look for elements with Mermaid-specific classes, IDs, or attributes
    
    // 1. Remove SVGs with Mermaid-specific classes or IDs
    const mermaidSvgs = document.querySelectorAll('svg[id^="mermaid-"], svg.mermaid, svg[data-processed="true"]');
    mermaidSvgs.forEach(svg => {
      // Only remove if it's not in our container and has Mermaid-specific characteristics
      if (!containerRef.current?.contains(svg)) {
        const hasMermaidContent = svg.querySelector('.node, .edge, .label, .cluster') !== null;
        const hasMermaidId = svg.id?.startsWith('mermaid-');
        const hasMermaidClass = svg.classList.contains('mermaid');
        
        if (hasMermaidContent || hasMermaidId || hasMermaidClass) {
          svg.remove();
        }
      }
    });

    // 2. Remove error messages that are clearly Mermaid-generated
    // Look for elements with specific Mermaid error patterns
    const mermaidErrorSelectors = [
      'div[class*="mermaid"]',
      'div[id*="mermaid"]',
      'p[class*="mermaid"]',
      'p[id*="mermaid"]',
      // Elements that contain Mermaid-specific error text
      'div:not([class*="mermaid"]):not([id*="mermaid"]):not([data-mermaid])',
      'p:not([class*="mermaid"]):not([id*="mermaid"]):not([data-mermaid])'
    ];

    mermaidErrorSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Only process elements that are not in our container
        if (!containerRef.current?.contains(element)) {
          const text = element.textContent || '';
          const isMermaidError = (
            text.includes('Syntax error') ||
            text.includes('No diagram type detected') ||
            text.includes('mermaid') ||
            (element.classList.contains('mermaid') || element.id?.includes('mermaid'))
          );
          
          // Additional safety check: only remove if element has no meaningful content
          // or is clearly a Mermaid error element
          const hasOnlyErrorText = text.trim().length < 200 && isMermaidError;
          const isStandaloneError = element.children.length === 0 && hasOnlyErrorText;
          
          if (isStandaloneError || (isMermaidError && element.classList.contains('mermaid'))) {
            element.remove();
          }
        }
      });
    });

    // 3. Remove any elements that Mermaid might have appended directly to body
    // but only if they have Mermaid-specific characteristics
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach(child => {
      // Skip if it's our container or any legitimate app content
      if (containerRef.current?.contains(child) || 
          child.tagName === 'SCRIPT' || 
          child.tagName === 'STYLE' ||
          child.tagName === 'LINK' ||
          child.id === 'root' ||
          child.id === '__next' ||
          child.classList.contains('app') ||
          child.getAttribute('data-testid') ||
          child.getAttribute('data-cy')) {
        return;
      }

      // Only remove if it's clearly a Mermaid-generated element
      const isMermaidElement = (
        child.classList.contains('mermaid') ||
        child.id?.startsWith('mermaid-') ||
        (child.tagName === 'SVG' && child.querySelector('.node, .edge, .label, .cluster')) ||
        (child.textContent?.includes('Syntax error') && child.children.length === 0)
      );

      if (isMermaidElement) {
        child.remove();
      }
    });
  };

  // Initialize Mermaid
  useEffect(() => {
    if (hasInitialized) return;

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, sans-serif',
        // v11 specific options
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
        sequence: {
          useMaxWidth: true,
          diagramMarginX: 50,
          diagramMarginY: 10,
        },
        gantt: {
          useMaxWidth: true,
        },
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
      setError('');
      return;
    }

    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(async () => {
      try {
        setIsRendering(true);
        setError('');

        // Check if code is valid before rendering
        if (!isValidMermaidCode(code)) {
          setError('No valid Mermaid diagram detected. Please ensure your code starts with a diagram type (e.g., graph, flowchart, sequenceDiagram).');
          setSvgContent('');
          return;
        }

        const filteredCode = filterCode(code);
        const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render using v11 API - handle both string and object return types
        const result = await mermaid.render(uniqueId, filteredCode);
        const svg = typeof result === 'string' ? result : result.svg;
        
        if (!svg) {
          throw new Error('Failed to generate SVG from Mermaid');
        }
        
        setSvgContent(svg);
        // Reset view is now handled by dedicated useEffect
      } catch (err) {
        console.error('MermaidRenderer: Rendering error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
        
        // Provide more helpful error messages for common issues (v11 has better error reporting)
        if (errorMessage.includes('syntax error') || errorMessage.includes('Syntax error')) {
          setError('Syntax error detected. Please check your Mermaid syntax. Common issues: invalid node connections, missing quotes, or incorrect subgraph syntax.');
        } else if (errorMessage.includes('No diagram type detected') || errorMessage.includes('no diagram type detected')) {
          setError('No valid Mermaid diagram detected. Please ensure your code starts with a diagram type (e.g., graph, flowchart, sequenceDiagram).');
        } else if (errorMessage.includes('Failed to generate SVG')) {
          setError('Failed to generate diagram. Please check your syntax and try again.');
        } else {
          setError(errorMessage);
        }
        setSvgContent('');
      } finally {
        setIsRendering(false);
        // Clean up any stray nodes that Mermaid might have appended
        cleanupStrayMermaidNodes();
      }
    }, 100);

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [code, hasInitialized, isValidMermaidCode]);

  // Add interactive features to SVG
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    const svgElement = containerRef.current.querySelector('svg') as SVGSVGElement;
    if (!svgElement) return;

    // Set cursor and pointer events on the wrapper
    if (wrapperRef.current) {
      wrapperRef.current.style.cursor = navigationMode === 'drag' ? (isDragging ? 'grabbing' : 'grab') : 'default';
      wrapperRef.current.style.transition = isDragging ? 'none' : 'transform 0.1s ease-out';
    }

    // Add click handlers for nodes (only in select mode)
    const nodes = svgElement.querySelectorAll('.node, .label, text');
    nodes.forEach((node) => {
      const handleNodeClick = (e: Event) => {
        if (navigationMode !== 'select') return;
        e.stopPropagation();
        const nodeId = (node as Element).getAttribute('id') || (node as Element).textContent || 'unknown';
        setSelectedNode(selectedNode === nodeId ? null : nodeId);
      };
      
      node.removeEventListener('click', handleNodeClick);
      node.addEventListener('click', handleNodeClick);
    });

    // Add click handler to reset selection (only in select mode)
    const handleSvgClick = (e: Event) => {
      if (navigationMode !== 'select') return;
      if (e.target === svgElement) {
        setSelectedNode(null);
      }
    };
    
    svgElement.removeEventListener('click', handleSvgClick);
    svgElement.addEventListener('click', handleSvgClick);

    return () => {
      // Cleanup event listeners
      nodes.forEach((node) => {
        const handleNodeClick = () => {};
        node.removeEventListener('click', handleNodeClick);
      });
      svgElement.removeEventListener('click', handleSvgClick);
    };
  }, [svgContent, navigationMode, selectedNode, isDragging]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
      // Clean up any stray nodes when component unmounts
      cleanupStrayMermaidNodes();
    };
  }, []);

  const zoomIn = () => {
    const newScale = Math.min(scale * 1.2, 3);
    setScale(newScale);
  };
  
  const zoomOut = () => {
    const newScale = Math.max(scale / 1.2, 0.3);
    setScale(newScale);
  };

  // Navigation functions
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (navigationMode !== 'drag') return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - svgTransform.x, y: e.clientY - svgTransform.y });
  }, [navigationMode, svgTransform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || navigationMode !== 'drag') return;
    
    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setSvgTransform({ x: newX, y: newY });
  }, [isDragging, navigationMode, dragStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (navigationMode !== 'drag') return;
    e.preventDefault();
    setIsDragging(false);
  }, [navigationMode]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3, scale * delta));
    setScale(newScale);
  }, [scale]);

  const resetView = useCallback(() => {
    setScale(1);
    setSvgTransform({ x: 0, y: 0 });
    setSelectedNode(null);
    setNavigationMode('drag');
  }, []);

  const toggleNavigationMode = useCallback(() => {
    setNavigationMode(prev => prev === 'drag' ? 'select' : 'drag');
    setIsDragging(false);
  }, []);

  // Reset view when new diagram is rendered
  useEffect(() => {
    if (svgContent) {
      setScale(1);
      setSvgTransform({ x: 0, y: 0 });
      setSelectedNode(null);
      setNavigationMode('drag');
    }
  }, [svgContent]);

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

      // Get SVG dimensions with proper null checks
      const svgRect = svgElement.getBoundingClientRect();
      if (!svgRect || svgRect.width === 0 || svgRect.height === 0) {
        console.warn('SVG has no dimensions, using fallback size');
        canvas.width = 800; // Fallback width
        canvas.height = 600; // Fallback height
      } else {
        canvas.width = svgRect.width * 2; // Higher resolution
        canvas.height = svgRect.height * 2;
      }

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

  // Early return for error state - prevent any rendering
  if (error) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        {/* Toolbar - disabled when there's an error */}
        <div className="flex-shrink-0 flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 opacity-50">
          <div className="flex items-center space-x-1">
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Reset View">
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 ml-2">100%</span>
          </div>
          <div className="flex items-center space-x-1">
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Navigation Mode">
              <Move className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 mx-2">Drag</span>
          </div>
          <div className="flex items-center space-x-1">
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Export as .mmd">
              <FileText className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Export as .gv">
              <GitBranch className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Export as .png">
              <Image className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Error Display */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-red-500 dark:text-red-400 text-lg font-medium mb-2">Rendering Error</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Early return for loading state - prevent any rendering
  if (isRendering) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        {/* Toolbar - disabled when rendering */}
        <div className="flex-shrink-0 flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 opacity-50">
          <div className="flex items-center space-x-1">
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Reset View">
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 ml-2">100%</span>
          </div>
          <div className="flex items-center space-x-1">
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Navigation Mode">
              <Move className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 mx-2">Drag</span>
          </div>
          <div className="flex items-center space-x-1">
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Export as .mmd">
              <FileText className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Export as .gv">
              <GitBranch className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Export as .png">
              <Image className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Loading Display */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-gray-500 dark:text-gray-400 text-sm">Rendering...</div>
        </div>
      </div>
    );
  }

  // Early return for empty state - prevent any rendering
  if (!svgContent) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        {/* Toolbar - disabled when no content */}
        <div className="flex-shrink-0 flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 opacity-50">
          <div className="flex items-center space-x-1">
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Reset View">
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 ml-2">100%</span>
          </div>
          <div className="flex items-center space-x-1">
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Navigation Mode">
              <Move className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 mx-2">Drag</span>
          </div>
          <div className="flex items-center space-x-1">
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Export as .mmd">
              <FileText className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Export as .gv">
              <GitBranch className="w-4 h-4" />
            </button>
            <button disabled className="p-1.5 text-gray-400 cursor-not-allowed" title="Export as .png">
              <Image className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-gray-400 dark:text-gray-500 text-sm">No diagram to display</div>
        </div>
      </div>
    );
  }

  // Only render the diagram if we have valid SVG content
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-1">
          <button
            onClick={zoomIn}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {Math.round(scale * 100)}%
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleNavigationMode}
            className={`p-1.5 rounded transition-colors ${
              navigationMode === 'drag'
                ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title={navigationMode === 'drag' ? 'Drag Mode (Active)' : 'Select Mode (Active)'}
          >
            {navigationMode === 'drag' ? (
              <Move className="w-4 h-4" />
            ) : (
              <MousePointer className="w-4 h-4" />
            )}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 mx-2">
            {navigationMode === 'drag' ? 'Drag' : 'Select'}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={exportAsMmd}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Export as .mmd"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={exportAsGv}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Export as .gv"
          >
            <GitBranch className="w-4 h-4" />
          </button>
          <button
            onClick={exportAsPng}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Export as .png"
          >
            <Image className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Diagram Container */}
      <div 
        className="flex-1 relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ 
          cursor: navigationMode === 'drag' ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
      >
        <div 
          ref={wrapperRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${svgTransform.x}px, ${svgTransform.y}px) scale(${scale})`,
            transformOrigin: '50% 50%',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            filter: selectedNode ? 'brightness(0.7)' : 'none',
          }}
        >
          <div 
            ref={containerRef}
            className="w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      </div>
    </div>
  );
} 