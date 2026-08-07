import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hidro Alerta — Informação certa salva vidas',
  description:
    'Plataforma de prevenção, monitoramento e resposta a desastres naturais. Ambiente de demonstração com dados simulados.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
