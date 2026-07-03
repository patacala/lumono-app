'use client';

import { useState, useMemo } from 'react';
import { useLocations, useCreateLocation } from '@/modules/locations/hooks/use-locations';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs } from '@/shared/components/ui/tabs';
import { DataTable } from '@/shared/components/ui/data-table';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { useAuth } from '@/modules/auth/context/auth-context';
import { MapPin, Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import type { Location } from '@/modules/locations/hooks/use-locations';

const TYPE_LABELS: Record<string, string> = {
  warehouse: 'Almacen',
  store: 'Tienda',
  distribution: 'Distribucion',
};

const FILTER_TABS = [
  { id: 'ALL', label: 'Todos' },
  { id: 'warehouse', label: 'Almacenes' },
  { id: 'store', label: 'Tiendas' },
  { id: 'distribution', label: 'Distribucion' },
];

const METRIC_CARD = {
  icon: MapPin,
  title: 'Total Ubicaciones',
  description: 'Ubicaciones registradas en el sistema',
};

export default function LocationsPage() {
  const { hasPermission } = useAuth();
  const { data: locations, isLoading, error } = useLocations();
  const createLocation = useCreateLocation();

  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'warehouse',
    address: '',
    description: '',
  });
  const [formError, setFormError] = useState('');

  const canCreate = hasPermission('location.create');

  const totalLocations = locations?.length ?? 0;

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    if (typeFilter === 'ALL') return locations;
    return locations.filter((l) => l.type === typeFilter);
  }, [locations, typeFilter]);

  const columns = useMemo<ColumnDef<Location, any>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Codigo',
        cell: ({ getValue }) => (
          <span className="font-mono font-medium text-[var(--fg)]">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-[var(--fg)]">{row.original.name}</p>
            {row.original.description && (
              <p className="text-xs text-[var(--muted)] mt-0.5 max-w-xs truncate">
                {row.original.description}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        cell: ({ getValue }) => {
          const type = getValue() as string;
          return (
            <Badge variant="accent" size="sm">
              {TYPE_LABELS[type] || type}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'address',
        header: 'Direccion',
        cell: ({ getValue }) => (getValue() as string) || '-',
      },
    ],
    [],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    createLocation.mutate(
      {
        code: formData.code,
        name: formData.name,
        type: formData.type,
        address: formData.address || undefined,
        description: formData.description || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setFormData({ code: '', name: '', type: 'warehouse', address: '', description: '' });
        },
        onError: (err: any) => {
          setFormError(err.message || 'Error al crear ubicacion');
        },
      },
    );
  }

  function handleCloseForm() {
    setShowForm(false);
    setFormError('');
    setFormData({ code: '', name: '', type: 'warehouse', address: '', description: '' });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--muted)]">Cargando ubicaciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-[var(--status-critical)]">
            Error al cargar ubicaciones. Intenta de nuevo.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Ubicaciones</h1>
          <p className="text-[var(--muted)]">Gestiona almacenes, tiendas y centros de distribucion</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Nueva Ubicacion
          </Button>
        )}
      </div>

      <div className="max-w-sm">
        <div className="border border-[var(--border)] rounded-xl p-4 transition-all text-left">
          <METRIC_CARD.icon className="w-5 h-5 text-[var(--accent)] mb-2" />
          <p className="text-2xl font-bold text-[var(--fg)] tabular-nums mb-0.5">
            {totalLocations}
          </p>
          <p className="text-sm font-semibold text-[var(--fg)]">{METRIC_CARD.title}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">{METRIC_CARD.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Tabs
            tabs={FILTER_TABS.map((tab) => ({
              ...tab,
              count:
                tab.id === 'ALL'
                  ? locations?.length
                  : locations?.filter((l) => l.type === tab.id).length,
            }))}
            activeTab={typeFilter}
            onChange={setTypeFilter}
          />
        </CardHeader>

        <CardBody className="p-0 sm:p-4">
          <DataTable
            data={filteredLocations}
            columns={columns}
            searchPlaceholder="Buscar por nombre o codigo..."
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title="Nueva Ubicacion"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-[var(--status-critical)] border border-[var(--border)] text-[oklch(68%_0.01_260)] px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Codigo *"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              placeholder="ej. WH-MAIN"
            />

            <Input
              label="Nombre *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Nombre de la ubicacion"
            />

            <div>
              <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-1.5">
                Tipo *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="block w-full px-4 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--fg)] focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                required
              >
                <option value="warehouse">Almacen</option>
                <option value="store">Tienda</option>
                <option value="distribution">Centro de distribucion</option>
              </select>
            </div>

            <Input
              label="Direccion"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Direccion"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-1.5">
              Descripcion
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="block w-full px-4 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--fg)] placeholder:text-[var(--muted)] focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              placeholder="Descripcion de la ubicacion..."
            />
          </div>

          <ModalFooter>
            <Button variant="ghost" type="button" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createLocation.isPending}>
              {createLocation.isPending ? 'Creando...' : 'Crear Ubicacion'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
