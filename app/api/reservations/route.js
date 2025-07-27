import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'reservations.json');

function readReservations() {
  try {
    if (!fs.existsSync(dataPath)) {
      return [];
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading reservations:', error);
    return [];
  }
}

function writeReservations(reservations) {
  try {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(reservations, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing reservations:', error);
    return false;
  }
}

export async function GET() {
  try {
    const reservations = readReservations();
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
    const { date, time, employeeName, employeeEmail } = await request.json();

    if (!date || !time || !employeeName || !employeeEmail) {
      return NextResponse.json(
        { error: '日付、時間、名前、メールアドレスは必須です' },
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

    const reservations = readReservations();
    
    const existingReservation = reservations.find(
      reservation => reservation.date === date && reservation.time === time
    );

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
      employeeName,
      employeeEmail,
      createdAt: new Date().toISOString(),
    };

    reservations.push(newReservation);
    
    if (writeReservations(reservations)) {
      return NextResponse.json(newReservation, { status: 201 });
    } else {
      return NextResponse.json(
        { error: '予約の保存に失敗しました' },
        { status: 500 }
      );
    }
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
    const { id, date, time, employeeName, employeeEmail } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'IDは必須です' },
        { status: 400 }
      );
    }

    const reservations = readReservations();
    const reservationIndex = reservations.findIndex(res => res.id === id);
    
    if (reservationIndex === -1) {
      return NextResponse.json(
        { error: '予約が見つかりません' },
        { status: 404 }
      );
    }

    // Check for duplicate date/time (excluding current reservation)
    if (date && time) {
      const existingReservation = reservations.find(
        reservation => reservation.date === date && reservation.time === time && reservation.id !== id
      );

      if (existingReservation) {
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

    // Update fields
    if (date) reservations[reservationIndex].date = date;
    if (time) reservations[reservationIndex].time = time;
    if (employeeName) reservations[reservationIndex].employeeName = employeeName;
    if (employeeEmail) reservations[reservationIndex].employeeEmail = employeeEmail;
    reservations[reservationIndex].updatedAt = new Date().toISOString();

    if (writeReservations(reservations)) {
      return NextResponse.json(reservations[reservationIndex]);
    } else {
      return NextResponse.json(
        { error: '予約の更新に失敗しました' },
        { status: 500 }
      );
    }
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

    const reservations = readReservations();
    const reservationIndex = reservations.findIndex(res => res.id === id);
    
    if (reservationIndex === -1) {
      return NextResponse.json(
        { error: '予約が見つかりません' },
        { status: 404 }
      );
    }

    reservations.splice(reservationIndex, 1);

    if (writeReservations(reservations)) {
      return NextResponse.json({ message: '予約を削除しました' });
    } else {
      return NextResponse.json(
        { error: '予約の削除に失敗しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: '予約の削除に失敗しました' },
      { status: 500 }
    );
  }
}