import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reservations' },
        { status: 500 }
      );
    }

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { date, time, reservationName, employeeEmail } = await request.json();

    if (!date || !time || !reservationName || !employeeEmail) {
      return NextResponse.json(
        { error: '日付、時間、予約者名、メールアドレスは必須です' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeEmail)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // Check for existing reservation at the same date and time
    const { data: existingReservation } = await supabase
      .from('reservations')
      .select('id')
      .eq('date', date)
      .eq('time', time)
      .single();

    if (existingReservation) {
      return NextResponse.json(
        { error: 'この時間はすでに予約されています' },
        { status: 409 }
      );
    }

    const newReservation = {
      id: Date.now().toString(),
      date,
      time,
      employee_name: reservationName,
      employee_email: employeeEmail,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('reservations')
      .insert([newReservation])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '予約の保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: '予約の作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, date, time, reservationName, employeeEmail } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'IDは必須です' },
        { status: 400 }
      );
    }

    // Check if reservation exists
    const { data: existingReservation } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!existingReservation) {
      return NextResponse.json(
        { error: '予約が見つかりません' },
        { status: 404 }
      );
    }

    // Check for duplicate date/time (excluding current reservation)
    if (date && time) {
      const { data: duplicateReservation } = await supabase
        .from('reservations')
        .select('id')
        .eq('date', date)
        .eq('time', time)
        .neq('id', id)
        .single();

      if (duplicateReservation) {
        return NextResponse.json(
          { error: 'この時間はすでに予約されています' },
          { status: 409 }
        );
      }
    }

    // Email validation if provided
    if (employeeEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(employeeEmail)) {
        return NextResponse.json(
          { error: '有効なメールアドレスを入力してください' },
          { status: 400 }
        );
      }
    }

    const updateData = {};
    if (date) updateData.date = date;
    if (time) updateData.time = time;
    if (reservationName) updateData.employee_name = reservationName;
    if (employeeEmail) updateData.employee_email = employeeEmail;

    const { data, error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '予約の更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { error: '予約の更新に失敗しました' },
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

    // Check if reservation exists
    const { data: existingReservation } = await supabase
      .from('reservations')
      .select('id')
      .eq('id', id)
      .single();
    
    if (!existingReservation) {
      return NextResponse.json(
        { error: '予約が見つかりません' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '予約の削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '予約を削除しました' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: '予約の削除に失敗しました' },
      { status: 500 }
    );
  }
}