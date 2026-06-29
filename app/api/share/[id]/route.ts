import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json(null, { status: 503 });
  }

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
