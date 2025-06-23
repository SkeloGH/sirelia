import chokidar from 'chokidar';
import fs from 'fs';

export async function startFileWatcher(filePath, bridgePort = 3001) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`👀 Watching file: ${filePath}`);
      
      // Create file watcher
      const watcher = chokidar.watch(filePath, {
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100
        }
      });
      
      // Function to validate Mermaid code
      function isValidMermaidCode(code) {
        if (!code || !code.trim()) return false;
        
        const trimmedCode = code.trim();
        
        // Check if it starts with a valid diagram type
        const validTypes = [
          'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
          'stateDiagram', 'stateDiagram-v2', 'erDiagram', 'journey', 
          'gantt', 'pie', 'gitgraph', 'mindmap', 'timeline', 'c4'
        ];
        
        const firstLine = trimmedCode.split('\n')[0].trim().toLowerCase();
        return validTypes.some(type => firstLine.startsWith(type));
      }
      
      // Function to extract Mermaid code from content
      function extractMermaidCode(content, filePath) {
        const mermaidBlocks = [];
        
        // Check if this is a pure Mermaid file (no markdown blocks)
        const mermaidExtensions = ['.mdd', '.mermaid', '.mmd', '.mer'];
        const isPureMermaidFile = mermaidExtensions.some(ext => filePath.endsWith(ext));
        
        if (isPureMermaidFile) {
          // For pure Mermaid files, treat the entire content as Mermaid code
          const trimmedContent = content.trim();
          if (trimmedContent && isValidMermaidCode(trimmedContent)) {
            console.log(`📄 Detected pure Mermaid file: ${filePath}`);
            mermaidBlocks.push(trimmedContent);
          } else {
            console.log(`⚠️  Pure Mermaid file detected but content doesn't appear to be valid Mermaid code: ${filePath}`);
          }
          return mermaidBlocks;
        }
        
        // For markdown files, extract Mermaid blocks
        console.log(`📄 Detected markdown file: ${filePath}, extracting Mermaid blocks`);
        const lines = content.split('\n');
        let inMermaidBlock = false;
        let currentBlock = [];
        
        for (const line of lines) {
          if (line.trim().startsWith('```mermaid')) {
            inMermaidBlock = true;
            currentBlock = [];
            continue;
          }
          
          if (inMermaidBlock && line.trim().startsWith('```')) {
            inMermaidBlock = false;
            if (currentBlock.length > 0) {
              const blockContent = currentBlock.join('\n').trim();
              if (isValidMermaidCode(blockContent)) {
                mermaidBlocks.push(blockContent);
              }
            }
            continue;
          }
          
          if (inMermaidBlock) {
            currentBlock.push(line);
          }
        }
        
        return mermaidBlocks;
      }
      
      // Function to send Mermaid code to bridge
      async function sendToBridge(code) {
        try {
          const response = await fetch(`http://localhost:${bridgePort}/mermaid`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, theme: 'default' }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          console.log('📤 Sent to bridge:', result.message);
        } catch (error) {
          console.error('❌ Failed to send to bridge:', error.message);
        }
      }
      
      // Handle file changes
      watcher.on('change', async (path) => {
        console.log(`📝 File changed: ${path}`);
        
        try {
          const content = fs.readFileSync(path, 'utf8');
          const mermaidBlocks = extractMermaidCode(content, path);
          
          if (mermaidBlocks.length > 0) {
            console.log(`🔍 Found ${mermaidBlocks.length} valid Mermaid diagram(s)`);
            
            // Send each diagram to the bridge
            for (let i = 0; i < mermaidBlocks.length; i++) {
              const code = mermaidBlocks[i];
              console.log(`📤 Sending diagram ${i + 1}/${mermaidBlocks.length}`);
              await sendToBridge(code);
            }
          } else {
            console.log('ℹ️  No valid Mermaid diagrams found in file');
          }
        } catch (error) {
          console.error('❌ Error reading file:', error.message);
        }
      });
      
      // Handle initial file read
      watcher.on('ready', async () => {
        console.log('✅ File watcher ready');
        
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const mermaidBlocks = extractMermaidCode(content, filePath);
          
          if (mermaidBlocks.length > 0) {
            console.log(`🔍 Found ${mermaidBlocks.length} valid Mermaid diagram(s) on startup`);
            
            // Send each diagram to the bridge
            for (let i = 0; i < mermaidBlocks.length; i++) {
              const code = mermaidBlocks[i];
              console.log(`📤 Sending diagram ${i + 1}/${mermaidBlocks.length}`);
              await sendToBridge(code);
            }
          }
        } catch (error) {
          console.error('❌ Error reading initial file:', error.message);
        }
        
        resolve({
          close: () => {
            watcher.close();
          }
        });
      });
      
      // Handle errors
      watcher.on('error', (error) => {
        console.error('❌ File watcher error:', error);
        reject(error);
      });
      
    } catch (error) {
      console.error('❌ Failed to start file watcher:', error);
      reject(error);
    }
  });
} 