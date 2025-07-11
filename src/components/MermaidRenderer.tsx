'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import Toolbar from './Toolbar';
import { isValidMermaidCode, getMermaidInitOptions } from '../config/mermaid';

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
  const [isExporting, setIsExporting] = useState(false);
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
        // Keep empty lines, Mermaid comments (%%), and non-comment lines
        // Only filter out actual comment lines (// and #)
        return trimmed === '' || 
               trimmed.startsWith('%%') || 
               (!trimmed.startsWith('//') && !trimmed.startsWith('#'));
      })
      .join('\n')
      .trim();
  };

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
      mermaid.initialize(getMermaidInitOptions());
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
  }, [code, hasInitialized]);

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
    if (!containerRef.current) {
      console.error('Container ref not available');
      return;
    }
    
    // Try to find the SVG element in the container
    const svgElement = containerRef.current.querySelector('svg') as SVGSVGElement;
    if (!svgElement) {
      console.error('No SVG element found for export');
      return;
    }

    setIsExporting(true);

    try {
      // Get SVG dimensions for the export
      let svgWidth = 0;
      let svgHeight = 0;

      // First try viewBox
      if (svgElement.viewBox && svgElement.viewBox.baseVal) {
        svgWidth = svgElement.viewBox.baseVal.width;
        svgHeight = svgElement.viewBox.baseVal.height;
      }

      // If no viewBox, try width/height attributes
      if (!svgWidth || !svgHeight) {
        svgWidth = parseFloat(svgElement.getAttribute('width') || '0');
        svgHeight = parseFloat(svgElement.getAttribute('height') || '0');
      }

      // If still no dimensions, try computed style
      if (!svgWidth || !svgHeight) {
        const rect = svgElement.getBoundingClientRect();
        svgWidth = rect.width;
        svgHeight = rect.height;
      }

      // Use fallback dimensions if still no valid dimensions
      const finalWidth = svgWidth && svgWidth > 0 ? svgWidth : 800;
      const finalHeight = svgHeight && svgHeight > 0 ? svgHeight : 600;

      console.log('Export dimensions:', { finalWidth, finalHeight, originalWidth: svgWidth, originalHeight: svgHeight });

      // Use server-side PNG export API with Mermaid code
      const response = await fetch('/api/export-png', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          width: finalWidth,
          height: finalHeight
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Get the PNG blob from the response
      const pngBlob = await response.blob();
      
      // Create download link
      const pngUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'sirelia-diagram.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(pngUrl);
      
      console.log('PNG export successful');

    } catch (error) {
      console.error('Failed to export as PNG:', error);
      // Fallback: try to download as SVG instead
      try {
        const svgElement = containerRef.current.querySelector('svg') as SVGSVGElement;
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          fallbackToSvgDownload(svgData);
        }
      } catch (fallbackError) {
        console.error('SVG fallback also failed:', fallbackError);
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Fallback function to download as SVG when PNG export fails
  const fallbackToSvgDownload = (svgData: string) => {
    try {
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const a = document.createElement('a');
      a.href = svgUrl;
      a.download = 'sirelia-diagram.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(svgUrl);
      console.log('SVG export successful (fallback)');
    } catch (error) {
      console.error('Failed to export as SVG:', error);
    }
  };

  // Determine the current state
  const isDisabled = Boolean(error || isRendering || !svgContent);
  const showContent = !error && !isRendering && svgContent;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <Toolbar
        scale={scale}
        navigationMode={navigationMode}
        isDisabled={isDisabled || isExporting}
        isExporting={isExporting}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        onToggleNavigationMode={toggleNavigationMode}
        onExportMmd={exportAsMmd}
        onExportGv={exportAsGv}
        onExportPng={exportAsPng}
      />
      
      <div className="flex-1 relative overflow-hidden">
        {error && (
          <div className="flex items-center justify-center p-4 h-full">
            <div className="text-center max-w-md">
              <div className="text-red-500 dark:text-red-400 text-lg font-medium mb-2">Rendering Error</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{error}</div>
            </div>
          </div>
        )}
        
        {isRendering && (
          <div className="flex items-center justify-center p-4 h-full">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Rendering...</div>
          </div>
        )}
        
        {!svgContent && !error && !isRendering && (
          <div className="flex items-center justify-center p-4 h-full">
            <div className="text-gray-400 dark:text-gray-500 text-sm">No diagram to display</div>
          </div>
        )}
        
        {showContent && (
          <div 
            className="absolute inset-0"
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
        )}
      </div>
    </div>
  );
} 