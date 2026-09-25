'use client';

import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getAlertTypeLabel } from '@/lib/utils';
import type { Alert } from '@/types/alert';
import type { Shelter } from '@/types/shelter';
import type { RiskArea } from '@/types/map';

// Fix leaflet default marker icon issue.
// Icons are served locally (public/leaflet/) instead of unpkg so the map
// works offline-first and the only external requests are OSM tiles.
const defaultIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface RiskMapProps {
  alerts?: Alert[];
  shelters?: Shelter[];
  riskAreas?: RiskArea[];
  filters?: string[];
  selectedItem?: { id: string; type: string } | null;
  onSelectItem?: (item: { id: string; type: string }) => void;
}

const severityToColor: Record<number, string> = {
  0: '#1697FF',
  1: '#F7B500',
  2: '#FF7417',
  3: '#F12B36',
  4: '#7847E8',
};

export default function RiskMap({
  alerts = [],
  shelters = [],
  riskAreas = [],
  filters = [],
  onSelectItem,
}: RiskMapProps) {
  const showAll = filters.length === 0;

  const shouldShowAlert = (alert: Alert) => {
    if (showAll) return true;
    return filters.includes(alert.type);
  };

  const shouldShowShelter = () => {
    if (showAll) return true;
    return filters.includes('shelter');
  };

  const shouldShowRiskArea = (area: RiskArea) => {
    if (showAll) return true;
    return filters.includes(area.type);
  };

  return (
    <MapContainer
      center={[-15.78, -47.93]}
      zoom={4}
      className="h-full w-full rounded-2xl z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Risk area circles */}
      {riskAreas
        .filter(shouldShowRiskArea)
        .map((area) => (
          <Circle
            key={`risk-${area.id}`}
            center={[area.latitude, area.longitude]}
            radius={area.radiusMeters}
            pathOptions={{
              color: severityToColor[area.level] ?? '#1697FF',
              fillColor: severityToColor[area.level] ?? '#1697FF',
              fillOpacity: 0.25,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{area.name}</p>
                <p>Tipo: {getAlertTypeLabel(area.type)}</p>
                <p>Nível: {area.level}/4</p>
                <p className="text-xs text-gray-500 mt-1">Dados simulados</p>
              </div>
            </Popup>
          </Circle>
        ))}

      {/* Alert markers */}
      {alerts
        .filter(shouldShowAlert)
        .map((alert) => (
          <Marker
            key={`alert-${alert.id}`}
            position={[alert.latitude, alert.longitude]}
            eventHandlers={{
              click: () => onSelectItem?.({ id: alert.id, type: 'alert' }),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{alert.title}</p>
                <p>{getAlertTypeLabel(alert.type)} - Severidade {alert.severity}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.location}</p>
                <p className="text-xs text-gray-500">Dados simulados</p>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Shelter markers */}
      {shouldShowShelter() &&
        shelters.map((shelter) => (
          <Marker
            key={`shelter-${shelter.id}`}
            position={[shelter.latitude, shelter.longitude]}
            eventHandlers={{
              click: () => onSelectItem?.({ id: shelter.id, type: 'shelter' }),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{shelter.name}</p>
                <p>{shelter.address}</p>
                <p>
                  Vagas: {shelter.availableSpots}/{shelter.capacity}
                </p>
                <p className="text-xs text-gray-500">Dados simulados</p>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
