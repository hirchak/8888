import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');

function ensureFile() {
  const dir = path.dirname(LEADS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, JSON.stringify([]));
}

export async function GET() {
  ensureFile();
  const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  return NextResponse.json(leads);
}

export async function POST(request: NextRequest) {
  try {
    const { email, source = 'email-capture' } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    ensureFile();
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));

    const newLead = {
      id: Date.now().toString(),
      email,
      source,
      timestamp: new Date().toISOString(),
    };

    leads.push(newLead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}