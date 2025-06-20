import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { code, width, height } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Mermaid code is required' }, { status: 400 });
    }

    // Create temporary files
    const tempDir = tmpdir();
    const inputFile = join(tempDir, `input-${Date.now()}.mmd`);
    const outputFile = join(tempDir, `output-${Date.now()}.png`);

    try {
      // Write the Mermaid code to a temporary file
      await writeFile(inputFile, code, 'utf8');

      // Use mmdc (Mermaid CLI) to convert to PNG
      let mmdcCommand = `npx mmdc -i "${inputFile}" -o "${outputFile}"`;
      
      if (width && height) {
        mmdcCommand += ` -w ${width} -H ${height}`;
      }

      await execAsync(mmdcCommand);

      // Read the generated PNG file
      const fs = await import('fs/promises');
      const pngBuffer = await fs.readFile(outputFile);

      // Clean up temporary files
      await Promise.all([
        unlink(inputFile).catch(() => {}),
        unlink(outputFile).catch(() => {})
      ]);

      // Return the PNG as a response
      return new NextResponse(pngBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="sirelia-diagram.png"'
        }
      });

    } catch (execError) {
      // Clean up temporary files on error
      await Promise.all([
        unlink(inputFile).catch(() => {}),
        unlink(outputFile).catch(() => {})
      ]);
      throw execError;
    }

  } catch (error) {
    console.error('PNG export error:', error);
    return NextResponse.json(
      { error: 'Failed to export PNG' }, 
      { status: 500 }
    );
  }
} 