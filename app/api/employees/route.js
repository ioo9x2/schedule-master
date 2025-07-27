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

function writeEmployees(employees) {
  try {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(employees, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing employees:', error);
    return false;
  }
}

export async function GET() {
  try {
    const employees = readEmployees();
    const activeEmployees = employees.filter(emp => emp.active);
    return NextResponse.json(activeEmployees);
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

    const employees = readEmployees();
    
    // Check for duplicate email
    const existingEmployee = employees.find(emp => emp.email === email);
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

    employees.push(newEmployee);
    
    if (writeEmployees(employees)) {
      return NextResponse.json(newEmployee, { status: 201 });
    } else {
      return NextResponse.json(
        { error: '従業員の保存に失敗しました' },
        { status: 500 }
      );
    }
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

    const employees = readEmployees();
    const employeeIndex = employees.findIndex(emp => emp.id === id);
    
    if (employeeIndex === -1) {
      return NextResponse.json(
        { error: '従業員が見つかりません' },
        { status: 404 }
      );
    }

    if (name) employees[employeeIndex].name = name;
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
      const existingEmployee = employees.find(emp => emp.email === email && emp.id !== id);
      if (existingEmployee) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に登録されています' },
          { status: 409 }
        );
      }
      
      employees[employeeIndex].email = email;
    }
    if (typeof active === 'boolean') employees[employeeIndex].active = active;

    if (writeEmployees(employees)) {
      return NextResponse.json(employees[employeeIndex]);
    } else {
      return NextResponse.json(
        { error: '従業員の更新に失敗しました' },
        { status: 500 }
      );
    }
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

    const employees = readEmployees();
    const employeeIndex = employees.findIndex(emp => emp.id === id);
    
    if (employeeIndex === -1) {
      return NextResponse.json(
        { error: '従業員が見つかりません' },
        { status: 404 }
      );
    }

    employees.splice(employeeIndex, 1);

    if (writeEmployees(employees)) {
      return NextResponse.json({ message: '従業員を削除しました' });
    } else {
      return NextResponse.json(
        { error: '従業員の削除に失敗しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: '従業員の削除に失敗しました' },
      { status: 500 }
    );
  }
}