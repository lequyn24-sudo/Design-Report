import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://utkvqhatkzdydusergdr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0a3ZxaGF0a3pkeWR1c2VyZ2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDMyMzAsImV4cCI6MjA5ODMxOTIzMH0.YIkGEEwL4Ug138jSGj6UlvGnb4WikpprUbhvALmaQXY';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {

  try {
    const { id } = await params;
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/shared_reports?id=eq.${encodeURIComponent(id)}&select=data`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const rows = await res.json();
    if (!res.ok || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(null, { status: 404 });
    }
    return NextResponse.json(rows[0].data);
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
