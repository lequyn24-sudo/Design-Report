import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  try {
    const data = await request.json();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/shared_reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ data }),
    });

    const rows = await res.json();
    if (!res.ok) return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    return NextResponse.json({ id: rows[0].id });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
