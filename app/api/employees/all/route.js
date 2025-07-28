import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET() {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch all employees' },
        { status: 500 }
      );
    }

    return NextResponse.json(employees);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch all employees' },
      { status: 500 }
    );
  }
}