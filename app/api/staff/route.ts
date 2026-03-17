import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ error: 'POSTGRES_URL missing' }, { status: 500 });
  }
  try {
    const { rows } = await sql`SELECT * FROM staff ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ error: 'POSTGRES_URL missing' }, { status: 500 });
  }
  try {
    const body = await request.json();
    const { id, name, role, password, status } = body;

    await sql`
      INSERT INTO staff (id, name, role, password, status)
      VALUES (${id}, ${name}, ${role}, ${password}, ${status || 'active'})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        password = EXCLUDED.password,
        status = EXCLUDED.status
    `;

    return NextResponse.json({ message: 'Staff saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
