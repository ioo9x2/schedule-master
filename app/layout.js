// app/layout.js
import './globals.css';

export const metadata = {
  title: 'My App',
  description: 'A Next.js app with Tailwind CSS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
