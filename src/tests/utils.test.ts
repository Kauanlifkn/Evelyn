import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  formatDistance,
  getSeverityLabel,
  getOriginLabel,
  getStatusLabel,
  getIncidentTypeLabel,
} from '@/lib/utils';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters falsy values', () => {
    expect(cn('a', null, undefined, false, 'b')).toBe('a b');
  });
});

describe('formatDate', () => {
  it('formats ISO date to Brazilian format', () => {
    const result = formatDate('2026-08-06T14:30:00Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
  });
});

describe('formatDistance', () => {
  it('formats distance with km suffix', () => {
    expect(formatDistance(5.4)).toBe('5.4 km');
  });
});

describe('getSeverityLabel', () => {
  it('returns correct labels', () => {
    expect(getSeverityLabel(0)).toBe('Informativo');
    expect(getSeverityLabel(1)).toBe('Atenção');
    expect(getSeverityLabel(2)).toBe('Perigo');
    expect(getSeverityLabel(3)).toBe('Perigo Extremo');
    expect(getSeverityLabel(4)).toBe('Emergência');
  });
});

describe('getOriginLabel', () => {
  it('returns Portuguese labels', () => {
    expect(getOriginLabel('OFFICIAL')).toBe('Oficial');
    expect(getOriginLabel('SENSOR')).toBe('Sensor');
    expect(getOriginLabel('COMMUNITY')).toBe('Comunidade');
  });
});

describe('getStatusLabel', () => {
  it('returns Portuguese labels', () => {
    expect(getStatusLabel('active')).toBe('Ativo');
    expect(getStatusLabel('closed')).toBe('Encerrado');
    expect(getStatusLabel('cancelled')).toBe('Cancelado');
  });
});

describe('getIncidentTypeLabel', () => {
  it('returns Portuguese labels', () => {
    expect(getIncidentTypeLabel('waterlogging')).toBe('Alagamento');
    expect(getIncidentTypeLabel('flood')).toBe('Inundação');
    expect(getIncidentTypeLabel('landslide')).toBe('Deslizamento');
  });
});
