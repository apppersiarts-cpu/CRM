import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ 
      error: 'Configuração ausente: POSTGRES_URL não encontrada. Certifique-se de que o banco de dados Postgres está vinculado ao projeto no painel da Vercel.' 
    }, { status: 500 });
  }

  try {
    // Create brokers table
    await sql`
      CREATE TABLE IF NOT EXISTS brokers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        company TEXT,
        password TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create customers table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL,
        income NUMERIC NOT NULL,
        project TEXT NOT NULL,
        unit TEXT NOT NULL,
        property_value NUMERIC NOT NULL,
        financed_value NUMERIC NOT NULL,
        federal_subsidy NUMERIC DEFAULT 0,
        state_subsidy NUMERIC DEFAULT 0,
        fgts NUMERIC DEFAULT 0,
        financing_mode TEXT DEFAULT 'associativo',
        has_second_proponent BOOLEAN DEFAULT FALSE,
        second_proponent_name TEXT,
        second_proponent_cpf TEXT,
        second_proponent_income NUMERIC,
        possible_installment NUMERIC DEFAULT 0,
        status TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        analyst TEXT,
        broker_id TEXT REFERENCES brokers(id),
        broker_name TEXT,
        documents JSONB DEFAULT '[]',
        status_history JSONB DEFAULT '[]'
      );
    `;

    // Add new columns if they don't exist (for existing tables)
    try {
      await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS federal_subsidy NUMERIC DEFAULT 0`;
      await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS state_subsidy NUMERIC DEFAULT 0`;
      await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS fgts NUMERIC DEFAULT 0`;
      await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS financing_mode TEXT DEFAULT 'associativo'`;
      await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS has_second_proponent BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS second_proponent_name TEXT`;
      await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS second_proponent_cpf TEXT`;
      await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS second_proponent_income NUMERIC`;
      await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS possible_installment NUMERIC DEFAULT 0`;
    } catch (e) {
      console.log('Columns might already exist');
    }

    // Create settings table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      );
    `;

    // Create staff table
    await sql`
      CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        password TEXT DEFAULT '123',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Seed initial admin if not exists
    await sql`
      INSERT INTO staff (id, name, role, password)
      VALUES ('1', 'Leonardo Morana', 'admin', '123')
      ON CONFLICT (id) DO NOTHING;
    `;

    return NextResponse.json({ message: 'Database tables created successfully' });
  } catch (error: any) {
    console.error('Database setup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
