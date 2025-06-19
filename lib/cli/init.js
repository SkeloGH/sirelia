import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function init(options = {}) {
  const { force = false } = options;
  
  console.log('🚀 Initializing Sirelia...');
  
  // Get current working directory
  const cwd = process.cwd();
  
  // Check if .sirelia.mdd already exists
  const sireliaFile = path.join(cwd, '.sirelia.mdd');
  if (fs.existsSync(sireliaFile) && !force) {
    console.log('⚠️  .sirelia.mdd already exists. Use --force to overwrite.');
    return;
  }
  
  // Create .sirelia.mdd file
  const templatePath = path.join(__dirname, '../../templates/.sirelia.mdd');
  let templateContent = '';
  
  try {
    templateContent = fs.readFileSync(templatePath, 'utf8');
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
  
  fs.writeFileSync(sireliaFile, templateContent);
  console.log('✅ Created .sirelia.mdd file');
  
  // Add to .gitignore
  const gitignorePath = path.join(cwd, '.gitignore');
  const gitignoreContent = '\n# Sirelia\n.sirelia.mdd\n';
  
  if (fs.existsSync(gitignorePath)) {
    const existingContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!existingContent.includes('.sirelia.mdd')) {
      fs.appendFileSync(gitignorePath, gitignoreContent);
      console.log('✅ Added .sirelia.mdd to .gitignore');
    } else {
      console.log('ℹ️  .sirelia.mdd already in .gitignore');
    }
  } else {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ Created .gitignore with .sirelia.mdd');
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
      console.log('⚠️  Could not update package.json:', error.message);
    }
  } else {
    console.log('ℹ️  No package.json found, skipping script addition');
  }
  
  console.log('\n🎉 Sirelia initialized successfully!');
  console.log('\nNext steps:');
  console.log('1. Edit .sirelia.mdd with your Mermaid diagrams');
  console.log('2. Run: npm run sirelia:start');
  console.log('3. Open http://localhost:3000 to view the web interface');
} 