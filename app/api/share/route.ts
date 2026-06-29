import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://utkvqhatkzdydusergdr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0a3ZxaGF0a3pkeWR1c2VyZ2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDMyMzAsImV4cCI6MjA5ODMxOTIzMH0.YIkGEEwL4Ug138jSGj6UlvGnb4WikpprUbhvALmaQXY';

export async function POST(request: Request) {

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
