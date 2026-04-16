import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { spawn } from 'child_process';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const formData = await request.formData();
  const audio = formData.get('audio') as Blob;

  const dir = '/tmp/voice';
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  const filePath = `${dir}/${Date.now()}.ogg`;

  const arrayBuffer = await audio.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  await writeFile(filePath, uint8);

  const result = await new Promise<string>((resolve, reject) => {
    const proc = spawn('whisper', [filePath, '--model', 'small', '--language', 'Ukrainian', '--output-format', 'json']);
    let output = '';
    proc.stdout.on('data', (d) => output += d);
    proc.on('close', (code) => {
      if (code === 0) resolve(output);
      else reject(new Error('Whisper failed with code ' + code));
    });
    proc.on('error', reject);
  });

  const json = JSON.parse(result);
  const text = json.text || '';

  return Response.json({ text });
}
