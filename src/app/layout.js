import './globals.css';

export const metadata = {
  title: 'СВОИ в LA — Помощник для русскоязычных в Лос-Анджелесе',
  description: 'USCIS документы, места от комьюнити, AI-чат — всё для русскоязычных иммигрантов в LA',
  manifest: '/manifest.json',
  themeColor: '#F47B20',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Свои LA" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
