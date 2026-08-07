'use client';

import {
  Waves,
  AlertTriangle,
  Footprints,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

const sections = [
  {
    icon: Waves,
    title: 'O que é um tsunami?',
    content:
      'Um tsunami é uma série de ondas oceânicas geradas por deslocamentos rápidos de grandes volumes de água, geralmente causados por terremotos submarinos, erupções vulcânicas ou deslizamentos costeiros. As ondas podem atingir alturas de dezenas de metros e viajar a velocidades de até 800 km/h no oceano aberto.',
  },
  {
    icon: AlertTriangle,
    title: 'Sinais de aviso',
    items: [
      'Tremores fortes ou longos na costa',
      'Recesso repentino e incomum do mar (a água recua significativamente)',
      'Ruídos fortes vindos do oceano (como um tremor ou rugido)',
      'Alertas oficiais da Defesa Civil ou sirenes',
      'Animais comportando-se de forma incomum (migração repentina para terras altas)',
    ],
  },
  {
    icon: Footprints,
    title: 'O que fazer em caso de tsunami',
    items: [
      'Mova-se imediatamente para terrenos elevados ou para o interior',
      'Não espere para ver a onda - aja imediatamente ao ouvir o alerta',
      'Navegue para águas profundas se estiver em um barco (ondas são menores lá)',
      'Nunca retorne à costa até que as autoridades declarem segurança',
      'Ajude idosos, crianças e pessoas com mobilidade reduzida',
      'Desconecte aparelhos elétricos e feche registros de gás se houver tempo',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'O que NÃO fazer',
    items: [
      'Não vá à praia para "ver a onda"',
      'Não tente fotografar ou filmar o tsunami',
      'Não retorne após a primeira onda - tsunamis têm múltiplas ondas',
      'Não atravesse áreas alagadas - a água pode conter destroços',
    ],
  },
];

export function SafetyInfo() {
  return (
    <div className="space-y-6">
      {/* Educational notice */}
      <div className="bg-hydro-surface-blue text-hydro-text-secondary text-sm px-4 py-3 rounded-xl flex items-start gap-2">
        <BookOpen className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Material educativo. Este conteúdo tem caráter informativo e não
          constitui dados de monitoramento real.
        </p>
      </div>

      {sections.map((section) => (
        <Card key={section.title}>
          <div className="flex items-start gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hydro-blue-soft shrink-0">
              <section.icon className="h-4 w-4 text-hydro-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-hydro-text pt-1.5">
              {section.title}
            </h3>
          </div>

          {section.content && (
            <p className="text-sm text-hydro-text-secondary leading-relaxed ml-12">
              {section.content}
            </p>
          )}

          {'items' in section && section.items && (
            <ul className="space-y-2 ml-12">
              {section.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-hydro-text-secondary"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-hydro-surface-blue text-hydro-blue-700 text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}

      <div className="text-center text-xs text-hydro-text-secondary italic pb-4">
        Fonte: Material educativo de demonstração. Consulte fontes oficiais como
        Defesa Civil, INMET e Marinha do Brasil para informações reais.
      </div>
    </div>
  );
}
