import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InitOptions {
  force?: boolean;
}

// Function to detect file encoding
function detectEncoding(buffer: Buffer): 'utf8' | 'utf16le' {
  // Check for UTF-16 LE BOM
  if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
    return 'utf16le';
  }
  // Check for UTF-16 BE BOM
  if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
    return 'utf16le'; // We'll handle BE as LE for simplicity
  }
  // Default to UTF-8
  return 'utf8';
}

export async function init(options: InitOptions = {}) {
  const { force = false } = options;
  
  console.log('🚀 Initializing Sirelia...');
  
  // Get current working directory
  const cwd = process.cwd();
  
  // Check if .sirelia.mmd already exists
  const sireliaFile = path.join(cwd, '.sirelia.mmd');
  if (fs.existsSync(sireliaFile) && !force) {
    console.log('⚠️  .sirelia.mmd already exists. Use --force to overwrite.');
    return;
  }
  
  // Create .sirelia.mmd file
  const templatePath = path.join(__dirname, '../../templates/.sirelia.mmd');
  let templateContent = '';
  
  try {
    // Read the file as a buffer first to detect encoding
    const buffer = fs.readFileSync(templatePath);
    const encoding = detectEncoding(buffer);
    templateContent = buffer.toString(encoding);
  } catch {
    // Fallback template if file doesn't exist
    templateContent = `# Sirelia Diagram

This file contains your Mermaid diagrams. Edit this file and save to see real-time updates in the Sirelia web interface.

## Example Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Do Something]
    B -->|No| D[Do Nothing]
    C --> E[End]
    D --> E
\`\`\`

## Usage

1. Edit this file with your Mermaid diagrams
2. Save the file to see real-time updates
3. Open http://localhost:3000 to view the web interface
4. Use the web interface to edit and refine your diagrams

## Supported Diagram Types

- Flowcharts: \`graph TD\`, \`flowchart LR\`
- Sequence Diagrams: \`sequenceDiagram\`
- Class Diagrams: \`classDiagram\`
- State Diagrams: \`stateDiagram-v2\`
- Entity Relationship: \`erDiagram\`
- User Journey: \`journey\`
- Gantt Charts: \`gantt\`
- Pie Charts: \`pie\`
- Git Graphs: \`gitgraph\`
- Mind Maps: \`mindmap\`
- Timeline: \`timeline\`
`;
  }
  
  // Write the file as UTF-8
  fs.writeFileSync(sireliaFile, templateContent, 'utf8');
  console.log('✅ Created .sirelia.mmd file');
  
  // Add to .gitignore
  const gitignorePath = path.join(cwd, '.gitignore');
  const gitignoreContent = '\n# Sirelia\n.sirelia.mmd\n';
  
  if (fs.existsSync(gitignorePath)) {
    const existingContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!existingContent.includes('.sirelia.mmd')) {
      fs.appendFileSync(gitignorePath, gitignoreContent);
      console.log('✅ Added .sirelia.mmd to .gitignore');
    } else {
      console.log('ℹ️  .sirelia.mmd already in .gitignore');
    }
  } else {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ Created .gitignore with .sirelia.mmd');
  }
  
  // Add script to package.json
  const packageJsonPath = path.join(cwd, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      if (!packageJson.scripts['sirelia:start']) {
        packageJson.scripts['sirelia:start'] = 'sirelia start';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Added sirelia:start script to package.json');
      } else {
        console.log('ℹ️  sirelia:start script already exists in package.json');
      }
    } catch (error) {
      console.log('⚠️  Could not update package.json:', (error as Error).message);
    }
  } else {
    console.log('ℹ️  No package.json found, skipping script addition');
  }
  
  console.log('\n🎉 Sirelia initialized successfully!');
  console.log('\nNext steps:');
  console.log('1. Edit .sirelia.mmd with your Mermaid diagrams');
  console.log('2. Run: npm run sirelia:start');
  console.log('3. Open http://localhost:3000 to view the web interface');
} 