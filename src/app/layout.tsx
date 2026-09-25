import type { Metadata } from 'next';
import './globals.css';
import { DemoBanner } from '@/components/layout/DemoBanner';

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
  const dataMode = process.env.ALERT_DATA_MODE || 'mock';

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <a
          href="#conteudo-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-hydro-blue-700 focus:shadow-hydro-lg"
        >
          Pular para o conteúdo principal
        </a>
        <DemoBanner mode={dataMode} />
        {children}
      </body>
    </html>
  );
}
