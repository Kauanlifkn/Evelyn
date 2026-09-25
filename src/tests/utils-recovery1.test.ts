import { describe, it, expect } from 'vitest';
import {
  getOfficialEventTypeLabel,
  getOfficialSeverityNumber,
  telHref,
} from '@/lib/utils';

describe('getOfficialEventTypeLabel (RECOVERY-1: raw event types must not leak to the UI)', () => {
  it('translates every INMET event type to Portuguese', () => {
    expect(getOfficialEventTypeLabel('heavy_rain')).toBe('Chuvas Intensas');
    expect(getOfficialEventTypeLabel('storm')).toBe('Tempestade');
    expect(getOfficialEventTypeLabel('gale')).toBe('Vendaval');
    expect(getOfficialEventTypeLabel('frost')).toBe('Geada');
    expect(getOfficialEventTypeLabel('low_humidity')).toBe('Baixa Umidade');
    expect(getOfficialEventTypeLabel('rain_accumulation')).toBe('Acumulado de Chuva');
    expect(getOfficialEventTypeLabel('coastal_winds')).toBe('Ventos Costeiros');
    expect(getOfficialEventTypeLabel('temperature_drop')).toBe('Declínio de Temperatura');
  });

  it('falls back to shared alert labels for known domain types', () => {
    expect(getOfficialEventTypeLabel('river_flood')).toBe('Enchente');
  });

  it('returns unknown slugs unchanged (honest fallback)', () => {
    expect(getOfficialEventTypeLabel('novo_evento')).toBe('novo_evento');
  });
});

describe('telHref', () => {
  it('builds an internationalized tel: link from a display phone', () => {
    expect(telHref('(11) 3456-7890')).toBe('tel:+551134567890');
  });

  it('handles mobile numbers', () => {
    expect(telHref('(11) 98765-4321')).toBe('tel:+5511987654321');
  });

  it('returns null for strings without a dialable number', () => {
    expect(telHref('')).toBeNull();
    expect(telHref('sem telefone')).toBeNull();
  });
});

describe('getOfficialSeverityNumber', () => {
  it('maps the official 0-3 scale', () => {
    expect(getOfficialSeverityNumber('informative')).toBe(0);
    expect(getOfficialSeverityNumber('attention')).toBe(1);
    expect(getOfficialSeverityNumber('danger')).toBe(2);
    expect(getOfficialSeverityNumber('extreme')).toBe(3);
  });
});
