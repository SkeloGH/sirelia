import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

// Validation function for width and height parameters
function validateDimension(value: unknown): number | null {
  if (typeof value === 'number' && value > 0 && value <= 10000) {
    return Math.floor(value);
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 10000) {
      return parsed;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { code, width, height } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Mermaid code is required' }, { status: 400 });
    }

    // Validate and sanitize width and height parameters
    const validatedWidth = validateDimension(width);
    const validatedHeight = validateDimension(height);

    // Create temporary files
    const tempDir = tmpdir();
    const inputFile = join(tempDir, `input-${Date.now()}.mmd`);
    const outputFile = join(tempDir, `output-${Date.now()}.png`);

    try {
      // Write the Mermaid code to a temporary file
      await writeFile(inputFile, code, 'utf8');

      // Build mmdc command with proper validation and template literals
      let mmdcCommand = `npx mmdc -i "${inputFile}" -o "${outputFile}"`;
      
      if (validatedWidth && validatedHeight) {
        mmdcCommand += ` -w ${validatedWidth} -H ${validatedHeight}`;
      } else if (validatedWidth) {
        mmdcCommand += ` -w ${validatedWidth}`;
      } else if (validatedHeight) {
        mmdcCommand += ` -H ${validatedHeight}`;
      }

      await execAsync(mmdcCommand);

      // Read the generated PNG file
      const pngBuffer = await readFile(outputFile);

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