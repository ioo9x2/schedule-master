import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'employees.json');

function readEmployees() {
  try {
    if (!fs.existsSync(dataPath)) {
      return [];
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading employees:', error);
    return [];
  }
}

export async function GET() {
  try {
    const employees = readEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch all employees' },
      { status: 500 }
    );
  }
}