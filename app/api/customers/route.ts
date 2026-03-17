import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ error: 'POSTGRES_URL missing' }, { status: 500 });
  }
  try {
    const { rows } = await sql`SELECT * FROM customers ORDER BY created_at DESC`;
    // Map database fields back to camelCase for the frontend
    const customers = rows.map(row => ({
      id: row.id,
      name: row.name,
      cpf: row.cpf,
      income: Number(row.income),
      project: row.project,
      unit: row.unit,
      propertyValue: Number(row.property_value),
      financedValue: Number(row.financed_value),
      federalSubsidy: Number(row.federal_subsidy || 0),
      stateSubsidy: Number(row.state_subsidy || 0),
      fgts: Number(row.fgts || 0),
      financingMode: row.financing_mode || 'associativo',
      hasSecondProponent: row.has_second_proponent || false,
      secondProponentName: row.second_proponent_name,
      secondProponentCpf: row.second_proponent_cpf,
      secondProponentIncome: row.second_proponent_income ? Number(row.second_proponent_income) : undefined,
      possibleInstallment: Number(row.possible_installment || 0),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      analyst: row.analyst,
      brokerId: row.broker_id,
      brokerName: row.broker_name,
      documents: row.documents,
      statusHistory: row.status_history
    }));
    return NextResponse.json(customers);
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
    const { 
      id, name, cpf, income, project, unit, propertyValue, financedValue, 
      federalSubsidy, stateSubsidy, fgts, financingMode, hasSecondProponent,
      secondProponentName, secondProponentCpf, secondProponentIncome, possibleInstallment,
      status, createdAt, updatedAt, analyst, brokerId, brokerName, documents, statusHistory 
    } = body;

    await sql`
      INSERT INTO customers (
        id, name, cpf, income, project, unit, property_value, financed_value, 
        federal_subsidy, state_subsidy, fgts, financing_mode, has_second_proponent,
        second_proponent_name, second_proponent_cpf, second_proponent_income, possible_installment,
        status, created_at, updated_at, analyst, broker_id, broker_name, documents, status_history
      )
      VALUES (
        ${id}, ${name}, ${cpf}, ${income}, ${project}, ${unit}, ${propertyValue}, ${financedValue}, 
        ${federalSubsidy || 0}, ${stateSubsidy || 0}, ${fgts || 0}, ${financingMode || 'associativo'}, ${hasSecondProponent || false},
        ${secondProponentName || null}, ${secondProponentCpf || null}, ${secondProponentIncome || null}, ${possibleInstallment || 0},
        ${status}, ${createdAt}, ${updatedAt}, ${analyst}, ${brokerId}, ${brokerName}, 
        ${JSON.stringify(documents)}, ${JSON.stringify(statusHistory)}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        cpf = EXCLUDED.cpf,
        income = EXCLUDED.income,
        project = EXCLUDED.project,
        unit = EXCLUDED.unit,
        property_value = EXCLUDED.property_value,
        financed_value = EXCLUDED.financed_value,
        federal_subsidy = EXCLUDED.federal_subsidy,
        state_subsidy = EXCLUDED.state_subsidy,
        fgts = EXCLUDED.fgts,
        financing_mode = EXCLUDED.financing_mode,
        has_second_proponent = EXCLUDED.has_second_proponent,
        second_proponent_name = EXCLUDED.second_proponent_name,
        second_proponent_cpf = EXCLUDED.second_proponent_cpf,
        second_proponent_income = EXCLUDED.second_proponent_income,
        possible_installment = EXCLUDED.possible_installment,
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at,
        analyst = EXCLUDED.analyst,
        broker_id = EXCLUDED.broker_id,
        broker_name = EXCLUDED.broker_name,
        documents = EXCLUDED.documents,
        status_history = EXCLUDED.status_history
    `;

    return NextResponse.json({ message: 'Customer saved successfully' });
  } catch (error: any) {
    console.error('Save customer error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
