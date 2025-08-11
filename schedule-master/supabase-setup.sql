-- Create employees table
CREATE TABLE employees (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true
);

-- Create reservations table
CREATE TABLE reservations (
  id text PRIMARY KEY,
  date date NOT NULL,
  time text NOT NULL,
  name text NOT NULL,
  employee_name text NOT NULL,
  employee_email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT NOW()
);

-- Create unique constraint for date/time combination
CREATE UNIQUE INDEX reservations_date_time_idx ON reservations (date, time);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  classification text NOT NULL CHECK (classification IN ('面談', '提出物', 'イベント')),
  due_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);

-- Insert sample employees data (from existing JSON)
INSERT INTO employees (id, name, email, active) VALUES
('1', '瀬川 秀斗', 's.segawa.9s4@tec.witc.co.jp', true),
('2', '佐々木 裕真', 'y.sasaki.bx2@tec.witc.co.jp', true),
('3', '井上 正隆', 'masa.inoue@tec.witc.co.jp', true),
('4', '菊池 真緒', 'm.kikuchi.5yh@tec.witc.co.jp', true),
('5', '中里 恵大', 'k.nakazato.xrd@tec.witc.co.jp', true),
('6', '松田 優大', 'y.matsuda.gdz@tec.witc.co.jp', true),
('7', '向 君茹', 'j.siang@tec.witc.co.jp', true),
('8', '渡邊 慎也', 's.watanabe.6cv@tec.witc.co.jp', true);

-- Insert sample reservation data (from existing JSON)
INSERT INTO reservations (id, date, time, name, employee_name, employee_email, created_at) VALUES
('1753697803357', '2025-07-24', '19:00', 'ユーザー名', '渡邊 慎也', 'ioo9x2@gmail.com', '2025-07-28T10:16:43.357Z');