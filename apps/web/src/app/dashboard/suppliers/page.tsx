'use client';

import { useState, useMemo } from 'react';
import { useSuppliers, useCreateSupplier } from '@/modules/suppliers/hooks/use-suppliers';
import { Card, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { DataTable } from '@/shared/components/ui/data-table';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { useAuth } from '@/modules/auth/context/auth-context';
import { Factory, Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import type { Supplier } from '@/modules/suppliers/hooks/use-suppliers';

const METRIC_CARD = {
  icon: Factory,
  title: 'Total Proveedores',
  description: 'Proveedores registrados en el sistema',
};

const EMPTY_FORM = {
  code: '',
  name: '',
  contact: '',
  email: '',
  phone: '',
  address: '',
};

export default function SuppliersPage() {
  const { hasPermission } = useAuth();
  const { data: suppliers, isLoading, error } = useSuppliers();
  const createSupplier = useCreateSupplier();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const canCreate = hasPermission('supplier.create');
  const totalSuppliers = suppliers?.length ?? 0;

  const columns = useMemo<ColumnDef<Supplier, any>[]>(
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
        cell: ({ getValue }) => (
          <span className="font-medium text-[var(--fg)]">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'contact',
        header: 'Contacto',
        cell: ({ getValue }) => (getValue() as string) || '-',
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ getValue }) => {
          const email = getValue() as string | undefined;
          if (!email) return '-';
          return (
            <a
              href={`mailto:${email}`}
              className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
            >
              {email}
            </a>
          );
        },
      },
      {
        accessorKey: 'phone',
        header: 'Telefono',
        cell: ({ getValue }) => (getValue() as string) || '-',
      },
    ],
    [],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    createSupplier.mutate(
      {
        code: formData.code,
        name: formData.name,
        contact: formData.contact || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setFormData(EMPTY_FORM);
        },
        onError: (err: any) => {
          setFormError(err.message || 'Error al crear proveedor');
        },
      },
    );
  }

  function handleCloseForm() {
    setShowForm(false);
    setFormError('');
    setFormData(EMPTY_FORM);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--muted)]">Cargando proveedores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-[var(--status-critical)]">
            Error al cargar proveedores. Intenta de nuevo.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Proveedores</h1>
          <p className="text-[var(--muted)]">Gestiona contactos e informacion de proveedores</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Nuevo Proveedor
          </Button>
        )}
      </div>

      <div className="max-w-sm">
        <div className="border border-[var(--border)] rounded-xl p-4 transition-all text-left">
          <METRIC_CARD.icon className="w-5 h-5 text-[var(--accent)] mb-2" />
          <p className="text-2xl font-bold text-[var(--fg)] tabular-nums mb-0.5">
            {totalSuppliers}
          </p>
          <p className="text-sm font-semibold text-[var(--fg)]">{METRIC_CARD.title}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">{METRIC_CARD.description}</p>
        </div>
      </div>

      <Card>
        <CardBody className="p-0 sm:p-4">
          <DataTable
            data={suppliers ?? []}
            columns={columns}
            searchPlaceholder="Buscar por nombre, codigo o email..."
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title="Nuevo Proveedor"
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
              placeholder="ej. SUP-001"
            />

            <Input
              label="Nombre *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Nombre del proveedor"
            />

            <Input
              label="Contacto"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="Nombre del contacto"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@ejemplo.com"
            />

            <Input
              label="Telefono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0100"
            />

            <Input
              label="Direccion"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Direccion"
            />
          </div>

          <ModalFooter>
            <Button variant="ghost" type="button" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createSupplier.isPending}>
              {createSupplier.isPending ? 'Creando...' : 'Crear Proveedor'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
