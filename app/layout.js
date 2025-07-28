// app/layout.js
import './globals.css';

export const metadata = {
  title: 'スケジュール管理システム',
  description: '従業員スケジュール管理・予約システム',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
