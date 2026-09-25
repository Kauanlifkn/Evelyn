import type { Notification } from '@/types/notification';

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    title: 'Alerta de Enchente Ativado',
    message:
      'Um novo alerta de enchente foi emitido para a região da Vila Guilherme em São Paulo. Nível do Rio Tietê acima do limite.',
    type: 'alert',
    severity: 3,
    read: false,
    createdAt: '2026-08-05T14:30:00-03:00',
    link: '/alertas/alert-001',
    isSimulated: true,
  },
  {
    id: 'notif-002',
    title: 'Novo Abrigo Disponível',
    message:
      'O CEU Vila Guilherme foi aberto como ponto de abrigo com 188 vagas disponíveis.',
    type: 'shelter',
    read: false,
    createdAt: '2026-08-05T15:00:00-03:00',
    link: '/abrigos',
    isSimulated: true,
  },
  {
    id: 'notif-003',
    title: 'Previsão de Chuvas Fortes',
    message:
      'INMET prevê chuvas acima de 80mm para Recife nas próximas 4 horas. Mantenha-se atento.',
    type: 'weather',
    severity: 2,
    read: true,
    createdAt: '2026-08-06T07:00:00-03:00',
    isSimulated: true,
  },
  {
    id: 'notif-004',
    title: 'Sistema Atualizado',
    message:
      'O Hidro Alerta foi atualizado com novas funcionalidades de monitoramento em tempo real.',
    type: 'system',
    read: true,
    createdAt: '2026-08-04T10:00:00-03:00',
    isSimulated: true,
  },
  {
    id: 'notif-005',
    title: 'Risco de Deslizamento - Petrópolis',
    message:
      'Risco máximo (4) de deslizamento na Serra de Petrópolis. Evacuação recomendada para moradias em encostas.',
    type: 'alert',
    severity: 4,
    read: false,
    createdAt: '2026-08-04T22:15:00-03:00',
    link: '/alertas/alert-002',
    isSimulated: true,
  },
  {
    id: 'notif-006',
    title: 'Abrigo Lotado',
    message:
      'O Ginásio Poliesportivo de Petrópolis atingiu 93% de ocupação. Apenas 55 vagas restantes.',
    type: 'shelter',
    read: false,
    createdAt: '2026-08-06T08:15:00-03:00',
    link: '/abrigos',
    isSimulated: true,
  },
  {
    id: 'notif-007',
    title: 'Alerta de Enchente Rápida - Belém',
    message:
      'Igarapé Tucunduba apresentou elevação de 2m em 1 hora. Risco iminente para comunidades ribeirinhas em Icoaraci.',
    type: 'alert',
    severity: 4,
    read: false,
    createdAt: '2026-08-06T06:45:00-03:00',
    link: '/alertas/alert-004',
    isSimulated: true,
  },
  {
    id: 'notif-008',
    title: 'Novo Incidente Reportado',
    message:
      'Morador reportou alagamento de 50cm na Av. Dantas Barreto, Recife. Aguardando validação.',
    type: 'alert',
    severity: 2,
    read: true,
    createdAt: '2026-08-06T08:45:00-03:00',
    link: '/ocorrencias',
    isSimulated: true,
  },
  {
    id: 'notif-009',
    title: 'Previsão de Tempo - Atualização',
    message:
      'Previsão atualizada para Manaus: probabilidade de 95% de chuvas fortes com tempestades nas próximas 12 horas.',
    type: 'weather',
    severity: 3,
    read: false,
    createdAt: '2026-08-05T18:00:00-04:00',
    isSimulated: true,
  },
  {
    id: 'notif-010',
    title: 'Alerta Cancelado',
    message:
      'O alerta de tsunami emitido para o litoral de SC foi confirmado como falso positivo. Nenhuma ação é necessária.',
    type: 'system',
    read: true,
    createdAt: '2026-08-04T10:35:00-03:00',
    link: '/alertas/alert-011',
    isSimulated: true,
  },
  {
    id: 'notif-011',
    title: 'Resgate Solicitado - São Paulo',
    message:
      'Solicitação de resgate para idoso preso em residência alagada na Vila Formosa, São Paulo.',
    type: 'alert',
    severity: 3,
    read: false,
    createdAt: '2026-08-06T09:05:00-03:00',
    link: '/ocorrencias',
    isSimulated: true,
  },
  {
    id: 'notif-012',
    title: 'Bem-vindo ao Hidro Alerta',
    message:
      'Seu cadastro foi realizado com sucesso. Configure suas cidades de monitoramento para receber alertas personalizados.',
    type: 'system',
    read: true,
    createdAt: '2026-08-01T12:00:00-03:00',
    isSimulated: true,
  },
];
