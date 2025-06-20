// Centralized Mermaid configuration
export const MERMAID_CONFIG = {
  // All supported diagram types in Mermaid v11
  diagramTypes: [
    // Core diagram types
    'graph',
    'flowchart',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'stateDiagram-v2',
    'entityRelationshipDiagram',
    'erDiagram',
    'userJourney',
    'journey',
    'gantt',
    'pie',
    'quadrantChart',
    'requirement',
    'gitgraph',
    'mindmap',
    'timeline',
    'zenuml',
    'sankey',
    
    // C4 diagrams
    'c4',
    'c4context',
    'c4container',
    'c4component',
    
    // Beta and experimental features
    'xychart-beta',
    'block-beta',
    'packet-beta',
    'kanban',
    'architecture-beta',
    
    // Additional types that might be added
    'mermaid'
  ],

  // Mermaid syntax patterns for validation
  syntaxPatterns: {
    // Flowchart/graph syntax
    flowchart: ['-->', '---', '->', '--'],
    
    // Node definitions
    nodes: ['[', '{', '('],
    
    // Subgraph syntax
    subgraph: ['subgraph', '%%'],
    
    // Sequence diagram syntax
    sequence: ['participant', 'actor', 'note'],
    
    // Class diagram syntax
    class: ['class', 'interface'],
    
    // State diagram syntax
    state: ['state'],
    
    // Gantt syntax
    gantt: ['title', 'dateformat', 'section'],
    
    // Pie chart syntax
    pie: ['title', 'pie'],
    
    // Git graph syntax
    gitgraph: ['gitgraph'],
    
    // Mindmap syntax
    mindmap: ['mindmap'],
    
    // Timeline syntax
    timeline: ['timeline'],
    
    // C4 syntax
    c4: ['person', 'system', 'container', 'component'],
    
    // Journey syntax
    journey: ['title', 'section'],
    
    // XY Chart syntax
    xychart: ['xychart'],
    
    // Block diagram syntax
    block: ['block'],
    
    // Packet diagram syntax
    packet: ['packet'],
    
    // Kanban syntax
    kanban: ['kanban'],
    
    // Architecture syntax
    architecture: ['architecture']
  },

  // Mermaid initialization options
  initOptions: {
    startOnLoad: false,
    theme: 'default' as const,
    securityLevel: 'loose' as const,
    fontFamily: 'Inter, system-ui, sans-serif',
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
    er: {
      useMaxWidth: true,
    },
    journey: {
      useMaxWidth: true,
    },
    c4: {
      useMaxWidth: true,
    },
  }
};

// Helper functions
export const isValidMermaidCode = (code: string): boolean => {
  if (!code.trim()) return false;
  
  // Filter out only actual comment lines, but preserve Mermaid comments and directives
  const filteredCode = code
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

  if (!filteredCode) return false;

  // Check if the code contains any of the supported diagram types
  // Use includes() instead of startsWith() to handle diagrams with leading comments or whitespace
  const hasValidType = MERMAID_CONFIG.diagramTypes.some(type => 
    filteredCode.toLowerCase().includes(type.toLowerCase())
  );

  if (hasValidType) return true;

  // If no known type, check for specific Mermaid syntax patterns
  const lines = filteredCode.split('\n');
  
  // Find the first non-empty, non-comment line
  let firstContentLine = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#')) {
      firstContentLine = trimmed.toLowerCase();
      break;
    }
  }
  
  if (firstContentLine.length === 0) {
    return false;
  }

  // Check for any Mermaid syntax patterns
  const allPatterns = Object.values(MERMAID_CONFIG.syntaxPatterns).flat();
  return allPatterns.some(pattern => firstContentLine.includes(pattern));
};

export const getMermaidInitOptions = () => MERMAID_CONFIG.initOptions;
export const getDiagramTypes = () => MERMAID_CONFIG.diagramTypes;
export const getSyntaxPatterns = () => MERMAID_CONFIG.syntaxPatterns; 