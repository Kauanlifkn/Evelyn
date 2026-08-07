'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface IncidentFormProps {
  onSuccess: () => void;
}

const incidentTypes = [
  { value: '', label: 'Selecione o tipo...' },
  { value: 'waterlogging', label: 'Alagamento' },
  { value: 'flood', label: 'Inundação' },
  { value: 'landslide', label: 'Deslizamento' },
  { value: 'blocked_road', label: 'Via Bloqueada' },
  { value: 'person_at_risk', label: 'Pessoa em Risco' },
];

interface FormData {
  type: string;
  description: string;
  location: string;
  waterDepth: string;
  blockedRoad: boolean;
  peopleAtRisk: string;
  photo: string;
}

export function IncidentForm({ onSuccess }: IncidentFormProps) {
  const [form, setForm] = useState<FormData>({
    type: '',
    description: '',
    location: '',
    waterDepth: '',
    blockedRoad: false,
    peopleAtRisk: '',
    photo: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.type) newErrors.type = 'Selecione o tipo de ocorrência';
    if (!form.description.trim()) newErrors.description = 'Descreva a ocorrência';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
    onSuccess();
  };

  if (submitted) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type */}
      <div>
        <label htmlFor="incident-type" className="block text-sm font-medium text-hydro-text mb-1">
          Tipo de ocorrência *
        </label>
        <select
          id="incident-type"
          value={form.type}
          onChange={(e) => updateField('type', e.target.value)}
          className={cn(
            'w-full rounded-xl border bg-hydro-surface py-2 px-3 text-sm text-hydro-text focus:border-hydro-blue-600 focus:outline-none focus:ring-2 focus:ring-hydro-blue-600/20',
            errors.type ? 'border-hydro-danger' : 'border-hydro-border'
          )}
        >
          {incidentTypes.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.type && <p className="text-xs text-hydro-danger mt-1">{errors.type}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="incident-description" className="block text-sm font-medium text-hydro-text mb-1">
          Descrição *
        </label>
        <textarea
          id="incident-description"
          rows={4}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Descreva o que está acontecendo..."
          className={cn(
            'w-full rounded-xl border bg-hydro-surface py-2 px-3 text-sm text-hydro-text placeholder:text-hydro-text-secondary focus:border-hydro-blue-600 focus:outline-none focus:ring-2 focus:ring-hydro-blue-600/20 resize-none',
            errors.description ? 'border-hydro-danger' : 'border-hydro-border'
          )}
        />
        {errors.description && (
          <p className="text-xs text-hydro-danger mt-1">{errors.description}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="incident-location" className="block text-sm font-medium text-hydro-text mb-1">
          Localização
        </label>
        <input
          id="incident-location"
          type="text"
          value={form.location}
          onChange={(e) => updateField('location', e.target.value)}
          placeholder="Ex: Rua das Flores, 100 - Centro"
          className="w-full rounded-xl border border-hydro-border bg-hydro-surface py-2 px-3 text-sm text-hydro-text placeholder:text-hydro-text-secondary focus:border-hydro-blue-600 focus:outline-none focus:ring-2 focus:ring-hydro-blue-600/20"
        />
      </div>

      {/* Water depth */}
      <div>
        <label htmlFor="incident-depth" className="block text-sm font-medium text-hydro-text mb-1">
          Profundidade da água (m)
        </label>
        <input
          id="incident-depth"
          type="number"
          min="0"
          step="0.1"
          value={form.waterDepth}
          onChange={(e) => updateField('waterDepth', e.target.value)}
          placeholder="Opcional"
          className="w-full rounded-xl border border-hydro-border bg-hydro-surface py-2 px-3 text-sm text-hydro-text placeholder:text-hydro-text-secondary focus:border-hydro-blue-600 focus:outline-none focus:ring-2 focus:ring-hydro-blue-600/20"
        />
      </div>

      {/* Blocked road checkbox */}
      <div className="flex items-center gap-2">
        <input
          id="incident-blocked-road"
          type="checkbox"
          checked={form.blockedRoad}
          onChange={(e) => updateField('blockedRoad', e.target.checked)}
          className="h-4 w-4 rounded border-hydro-border text-hydro-blue-600 focus:ring-hydro-blue-500"
        />
        <label htmlFor="incident-blocked-road" className="text-sm text-hydro-text">
          Via bloqueada
        </label>
      </div>

      {/* People at risk */}
      <div>
        <label htmlFor="incident-people" className="block text-sm font-medium text-hydro-text mb-1">
          Pessoas em risco
        </label>
        <input
          id="incident-people"
          type="number"
          min="0"
          value={form.peopleAtRisk}
          onChange={(e) => updateField('peopleAtRisk', e.target.value)}
          placeholder="Opcional"
          className="w-full rounded-xl border border-hydro-border bg-hydro-surface py-2 px-3 text-sm text-hydro-text placeholder:text-hydro-text-secondary focus:border-hydro-blue-600 focus:outline-none focus:ring-2 focus:ring-hydro-blue-600/20"
        />
      </div>

      {/* Photo (simulated file input) */}
      <div>
        <label className="block text-sm font-medium text-hydro-text mb-1">
          Foto (simulado)
        </label>
        <div
          className="flex items-center gap-3 rounded-xl border border-dashed border-hydro-border bg-hydro-surface-blue p-4 cursor-pointer"
          onClick={() => alert('Simulado: Seleção de foto desabilitada na demonstração.')}
        >
          <Camera className="h-5 w-5 text-hydro-text-secondary" />
          <span className="text-sm text-hydro-text-secondary">
            Clique para adicionar foto
          </span>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button type="submit" className="w-full">
          Registrar ocorrência
        </Button>
      </div>

      <p className="text-xs text-hydro-text-secondary text-center">
        Dados simulados — Nenhuma ocorrência será realmente registrada.
      </p>
    </form>
  );
}
