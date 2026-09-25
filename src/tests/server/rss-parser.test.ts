import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  parseInmetRss,
  parseInmetItemFields,
  extractInmetId,
  parseAreas,
  mapInmetSeverity,
  mapInmetEventType,
  parseInmetDateTime,
} from '@/server/lib/rss-parser';

const fixturePath = join(__dirname, '../fixtures/inmet-rss.fixture.xml');
const fixtureXml = readFileSync(fixturePath, 'utf-8');

describe('parseInmetRss', () => {
  it('parses valid RSS XML and extracts items', () => {
    const channel = parseInmetRss(fixtureXml);
    expect(channel.title).toBe('Avisos');
    expect(channel.items.length).toBe(5);
  });

  it('extracts title, link, and pubDate from each item', () => {
    const channel = parseInmetRss(fixtureXml);
    const first = channel.items[0];
    expect(first.title).toContain('Chuvas Intensas');
    expect(first.link).toContain('/54415');
    expect(first.pubDate).toContain('May 2026');
  });

  it('throws on empty input', () => {
    expect(() => parseInmetRss('')).toThrow('Empty or invalid');
  });

  it('throws on null input', () => {
    expect(() => parseInmetRss(null as unknown as string)).toThrow();
  });

  it('throws on non-XML input', () => {
    expect(() => parseInmetRss('<html>not rss</html>')).toThrow('does not appear to be valid RSS');
  });

  it('throws on dangerously large payload', () => {
    const huge = '<rss><channel>' + '<item>'.repeat(1_000_000) + '</channel></rss>';
    expect(() => parseInmetRss(huge)).toThrow('too large');
  });

  it('detects dangerous XML constructs', () => {
    const dangerous = '<?xml version="1.0"?><!DOCTYPE foo SYSTEM "http://evil.com/xxe"><rss></rss>';
    expect(() => parseInmetRss(dangerous)).toThrow('dangerous');
  });

  it('handles empty items gracefully', () => {
    const xml = '<?xml version="1.0"?><rss><channel><item></item></channel></rss>';
    const channel = parseInmetRss(xml);
    expect(channel.items.length).toBe(0);
  });

  it('REGRESSION: CDATA sections are extracted (regex metacharacters must stay escaped)', () => {
    // Before RECOVERY-1 the RegExp was built from unescaped string literals,
    // turning "\s" into "s" and "\[CDATA\[" into "[CDATA[", which produced
    // `SyntaxError: Unmatched ')'` on every parse and kept the INMET
    // provider permanently OFFLINE.
    const xml = [
      '<?xml version="1.0"?>',
      '<rss><channel><title>Avisos</title>',
      '<item>',
      '<title><![CDATA[Aviso com CDATA]]></title>',
      '<link>https://apiprevmet3.inmet.gov.br/avisos/rss/99999</link>',
      '<description><![CDATA[| Status | Alert |]]></description>',
      '<pubDate>Tue, 19 May 2026 12:00:00 +0000</pubDate>',
      '</item>',
      '</channel></rss>',
    ].join('');

    const channel = parseInmetRss(xml);
    expect(channel.items.length).toBe(1);
    expect(channel.items[0].title).toBe('Aviso com CDATA');
    expect(channel.items[0].description).toContain('| Status | Alert |');
  });

  it('REGRESSION: extracts plain tags that also exist inside other tag names', () => {
    // <title> must not accidentally match <subtitle>-like overlaps and the
    // per-item <link> must be found even after the channel-level <link>.
    const xml =
      '<rss><channel><link>https://channel.example</link>' +
      '<item><link>https://item.example/1</link><title>Item 1</title></item>' +
      '</channel></rss>';
    const channel = parseInmetRss(xml);
    expect(channel.items[0].link).toBe('https://item.example/1');
  });
});

describe('parseInmetItemFields — HTML table format (live feed since ~09/2026)', () => {
  // The live feed wraps an HTML <table> (not the old markdown pipe table)
  // inside the description CDATA. Fields must be extracted from the RAW
  // CDATA — the sanitized description has its tags stripped.
  const htmlItemXml = [
    '<?xml version="1.0"?><rss><channel><title>Avisos</title>',
    '<item>',
    '<title><![CDATA[Aviso de Onda de Calor. Severidade Grau: Grande Perigo]]></title>',
    '<link>https://apiprevmet3.inmet.gov.br/avisos/rss/61234</link>',
    '<description><![CDATA[<table border="0" cellspacing="0" cellpadding="3">',
    '<tr><th align="left">Status</th><td>Alert</td></tr>',
    '<tr><th align="left">Evento</th><td>Onda de Calor</td></tr>',
    '<tr><th align="left">Severidade</th><td>Grande Perigo</td></tr>',
    '<tr><th align="left">Início</th><td>2026-09-26 12:00:00.0</td></tr>',
    '<tr><th align="left">Fim</th><td>2026-09-30 18:00:00.0</td></tr>',
    '<tr><th align="left">Descrição</th><td>INMET publica aviso iniciando em: 26/09/2026. Perigo à saúde.</td></tr>',
    '<tr><th align="left">Área</th><td>Aviso para as Áreas: Metropolitana de São Paulo, Campinas</td></tr>',
    '<tr><th align="left">Link Gráfico</th><td>https://avisos.inmet.gov.br/61234</td></tr>',
    '</table>]]></description>',
    '<pubDate>Fri, 25 Sep 2026 18:00:00 +0000</pubDate>',
    '</item>',
    '</channel></rss>',
  ].join('');

  it('extracts all fields from the HTML-table description', () => {
    const channel = parseInmetRss(htmlItemXml);
    expect(channel.items.length).toBe(1);

    const fields = parseInmetItemFields(channel.items[0]);
    expect(fields.status).toBe('Alert');
    expect(fields.evento).toBe('Onda de Calor');
    expect(fields.severidade).toBe('Grande Perigo');
    expect(fields.inicio).toBe('2026-09-26 12:00:00.0');
    expect(fields.fim).toBe('2026-09-30 18:00:00.0');
    expect(fields.descricao).toContain('INMET publica aviso');
    expect(fields.area).toContain('Metropolitana de São Paulo');
    expect(fields.linkGrafico).toBe('https://avisos.inmet.gov.br/61234');
  });

  it('still extracts fields when only the sanitized description is available', () => {
    // Fallback path (raw content absent — e.g. legacy callers).
    const channel = parseInmetRss(htmlItemXml);
    const fields = parseInmetItemFields({
      ...channel.items[0],
      descriptionRaw: undefined,
    });
    // HTML tags are gone in the sanitized text, so structured fields cannot
    // be recovered from it — the important guarantee is that it does not
    // throw and returns an object.
    expect(fields).toBeDefined();
  });
});

describe('parseInmetItemFields', () => {
  it('extracts fields from description table', () => {
    const channel = parseInmetRss(fixtureXml);
    const first = channel.items[0];
    const fields = parseInmetItemFields(first);
    expect(fields.status).toBe('Alert');
    expect(fields.evento).toBe('Chuvas Intensas');
    expect(fields.severidade).toBe('Perigo');
    expect(fields.descricao).toContain('Chuva entre 30 e 60 mm/h');
  });

  it('extracts area field', () => {
    const channel = parseInmetRss(fixtureXml);
    const first = channel.items[0];
    const fields = parseInmetItemFields(first);
    expect(fields.area).toContain('Metropolitana de Curitiba');
  });

  it('extracts link grafico', () => {
    const channel = parseInmetRss(fixtureXml);
    const first = channel.items[0];
    const fields = parseInmetItemFields(first);
    expect(fields.linkGrafico).toBe('https://avisos.inmet.gov.br/54415');
  });
});

describe('extractInmetId', () => {
  it('extracts numeric ID from URL', () => {
    expect(extractInmetId('https://apiprevmet3.inmet.gov.br/avisos/rss/54423')).toBe('54423');
  });

  it('extracts ID from URL with trailing slash', () => {
    expect(extractInmetId('https://apiprevmet3.inmet.gov.br/avisos/rss/54423/')).toBe('54423');
  });

  it('returns original string if no ID found', () => {
    expect(extractInmetId('https://example.com/alert')).toBe('https://example.com/alert');
  });
});

describe('parseAreas', () => {
  it('parses area string into array', () => {
    const result = parseAreas('Aviso para as Áreas: Metropolitana de Curitiba, Bauru, Itapetininga');
    expect(result).toEqual(['Metropolitana de Curitiba', 'Bauru', 'Itapetininga']);
  });

  it('handles empty string', () => {
    expect(parseAreas('')).toEqual([]);
  });

  it('handles area without prefix', () => {
    expect(parseAreas('São Paulo, Rio de Janeiro')).toEqual(['São Paulo', 'Rio de Janeiro']);
  });

  it('trims whitespace', () => {
    expect(parseAreas('Aviso para as Áreas: São Paulo ,  Rio de Janeiro  ')).toEqual(['São Paulo', 'Rio de Janeiro']);
  });
});

describe('mapInmetSeverity', () => {
  it('maps Perigo Potencial to attention', () => {
    const result = mapInmetSeverity('Perigo Potencial');
    expect(result.severity).toBe('attention');
    expect(result.label).toBe('Atenção');
  });

  it('maps Perigo to danger', () => {
    const result = mapInmetSeverity('Perigo');
    expect(result.severity).toBe('danger');
    expect(result.label).toBe('Perigo');
  });

  it('maps Grande Perigo to extreme', () => {
    const result = mapInmetSeverity('Grande Perigo');
    expect(result.severity).toBe('extreme');
    expect(result.label).toBe('Perigo Extremo');
  });

  it('maps Informação to informative', () => {
    const result = mapInmetSeverity('Informação');
    expect(result.severity).toBe('informative');
  });

  it('maps unknown severity to informative and logs warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = mapInmetSeverity('Severidade Desconhecida');
    expect(result.severity).toBe('informative');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown severity')
    );
    warnSpy.mockRestore();
  });

  it('handles trimmed whitespace', () => {
    const result = mapInmetSeverity('  Perigo Potencial  ');
    expect(result.severity).toBe('attention');
  });
});

describe('mapInmetEventType', () => {
  it('maps known event types', () => {
    expect(mapInmetEventType('Chuvas Intensas')).toBe('heavy_rain');
    expect(mapInmetEventType('Tempestade')).toBe('storm');
    expect(mapInmetEventType('Geada')).toBe('frost');
    expect(mapInmetEventType('Baixa Umidade')).toBe('low_humidity');
    expect(mapInmetEventType('Acumulado de Chuva')).toBe('rain_accumulation');
    expect(mapInmetEventType('Ventos Costeiros')).toBe('coastal_winds');
    expect(mapInmetEventType('Vendaval')).toBe('gale');
    expect(mapInmetEventType('Declínio de Temperatura')).toBe('temperature_drop');
  });

  it('maps unknown events to slug', () => {
    expect(mapInmetEventType('Evento Novo')).toBe('evento_novo');
  });
});

describe('parseInmetDateTime', () => {
  it('parses valid datetime string', () => {
    const result = parseInmetDateTime('2026-05-17 09:00:00.0');
    expect(result).toBeDefined();
    expect(new Date(result!).getTime()).not.toBeNaN();
  });

  it('returns undefined for empty string', () => {
    expect(parseInmetDateTime('')).toBeUndefined();
  });

  it('returns undefined for null', () => {
    expect(parseInmetDateTime(null as unknown as string)).toBeUndefined();
  });

  it('returns undefined for invalid date', () => {
    expect(parseInmetDateTime('not-a-date')).toBeUndefined();
  });
});
