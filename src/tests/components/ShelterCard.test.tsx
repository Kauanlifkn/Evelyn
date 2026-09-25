import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShelterCard } from '@/components/shelters/ShelterCard';
import type { Shelter } from '@/server/domain/shelters/shelter.contract';

const shelter: Shelter = {
  id: 'shelter-001',
  name: 'CEU Vila Guilherme',
  address: 'Rua Carolina Fioravanti, 100 - Vila Guilherme',
  latitude: -23.501,
  longitude: -46.6255,
  distanceKm: 1.2,
  capacity: 500,
  estimatedVacancies: 188,
  status: 'open',
  accessibility: true,
  acceptsAnimals: true,
  foodAvailable: true,
  medicalSupport: true,
  phone: '(11) 3456-7890',
  lastUpdatedAt: '2026-08-06T09:30:00-03:00',
  source: 'MOCK',
  isSimulated: true,
  createdAt: '2026-08-06T09:30:00-03:00',
  updatedAt: '2026-08-06T09:30:00-03:00',
};

describe('ShelterCard — RECOVERY-1 completeness', () => {
  it('shows the alimentação (food) chip when hasFood is true', () => {
    render(<ShelterCard shelter={shelter} />);
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
  });

  it('hides the alimentação chip when hasFood is false', () => {
    render(<ShelterCard shelter={{ ...shelter, foodAvailable: false }} />);
    expect(screen.queryByText('Alimentação')).not.toBeInTheDocument();
  });

  it('renders a clickable tel: link with country code', () => {
    render(<ShelterCard shelter={shelter} />);
    const link = screen.getByRole('link', {
      name: /Ligar para CEU Vila Guilherme/,
    });
    expect(link).toHaveAttribute('href', 'tel:+551134567890');
  });

  it('handles the absence of a phone number without breaking', () => {
    render(<ShelterCard shelter={{ ...shelter, phone: null }} />);
    expect(screen.getByText('Sem telefone informado')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Ligar para/ })
    ).not.toBeInTheDocument();
  });

  it('shows the last update timestamp', () => {
    render(<ShelterCard shelter={shelter} />);
    expect(screen.getByText(/Última atualização:/)).toBeInTheDocument();
    expect(screen.getByText(/dado simulado/)).toBeInTheDocument();
  });
});
