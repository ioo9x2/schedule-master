import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch employees' },
        { status: 500 }
      );
    }

    return NextResponse.json(employees);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: '名前とメールアドレスは必須です' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      );
    }

    const newEmployee = {
      id: Date.now().toString(),
      name,
      email,
      active: true
    };

    const { data, error } = await supabase
      .from('employees')
      .insert([newEmployee])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '従業員の保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: '従業員の作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, name, email, active } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'IDは必須です' },
        { status: 400 }
      );
    }

    // Check if employee exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!existingEmployee) {
      return NextResponse.json(
        { error: '従業員が見つかりません' },
        { status: 404 }
      );
    }

    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: '有効なメールアドレスを入力してください' },
          { status: 400 }
        );
      }
      
      // Check for duplicate email (excluding current employee)
      const { data: duplicateEmployee } = await supabase
        .from('employees')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .single();

      if (duplicateEmployee) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に登録されています' },
          { status: 409 }
        );
      }
      
      updateData.email = email;
    }
    if (typeof active === 'boolean') updateData.active = active;

    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '従業員の更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { error: '従業員の更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'IDは必須です' },
        { status: 400 }
      );
    }

    // Check if employee exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('id', id)
      .single();
    
    if (!existingEmployee) {
      return NextResponse.json(
        { error: '従業員が見つかりません' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '従業員の削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '従業員を削除しました' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: '従業員の削除に失敗しました' },
      { status: 500 }
    );
  }
}