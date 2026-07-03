'use client';

import { useState, useMemo } from 'react';
import { useCustomers, useDeleteCustomer, Customer } from '@/modules/customers/hooks/use-customers';
import { CustomerModal } from '@/modules/customers/components/customer-modal';
import { Card, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { DataTable } from '@/shared/components/ui/data-table';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { useAuth } from '@/modules/auth/context/auth-context';
import { Users, Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

const METRIC_CARD = {
  icon: Users,
  title: 'Total Clientes',
  description: 'Clientes registrados en el sistema',
};

export default function CustomersPage() {
  const { hasPermission } = useAuth();
  const { data: customers = [], isLoading, error } = useCustomers();
  const deleteMutation = useDeleteCustomer();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const canCreate = hasPermission('customer.create');
  const canUpdate = hasPermission('customer.update');
  const canDelete = hasPermission('customer.delete');
  const totalCustomers = customers.length;

  function handleEdit(customer: Customer) {
    setEditingCustomer(customer);
    setModalOpen(true);
  }

  function handleCreate() {
    setEditingCustomer(null);
    setModalOpen(true);
  }

  function handleDelete(customer: Customer) {
    setDeletingCustomer(customer);
  }

  const columns = useMemo<ColumnDef<Customer, any>[]>(
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
      {
        accessorKey: 'taxId',
        header: 'RUC/NIT',
        cell: ({ getValue }) => (getValue() as string) || '-',
      },
      ...(canUpdate || canDelete
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Customer } }) => (
                <div className="flex items-center gap-3">
                  {canUpdate && (
                    <button
                      type="button"
                      onClick={() => handleEdit(row.original)}
                      className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm font-medium transition-colors"
                    >
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(row.original)}
                      className="text-[oklch(68%_0.01_260)] hover:text-[oklch(68%_0.01_260)] text-sm font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ),
            } as ColumnDef<Customer, any>,
          ]
        : []),
    ],
    [canUpdate, canDelete],
  );

  function confirmDelete() {
    if (!deletingCustomer) return;
    deleteMutation.mutate(
      { id: deletingCustomer.id, version: deletingCustomer.version },
      {
        onSuccess: () => toast.success('Cliente eliminado'),
        onError: () => toast.error('Error al eliminar cliente'),
      },
    );
    setDeletingCustomer(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--muted)]">Cargando clientes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-[var(--status-critical)]">
            Error al cargar clientes. Intenta de nuevo.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Clientes</h1>
          <p className="text-[var(--muted)]">Gestiona tus clientes</p>
        </div>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </Button>
        )}
      </div>

      <div className="max-w-sm">
        <div className="border border-[var(--border)] rounded-xl p-4 transition-all text-left">
          <METRIC_CARD.icon className="w-5 h-5 text-[var(--accent)] mb-2" />
          <p className="text-2xl font-bold text-[var(--fg)] tabular-nums mb-0.5">
            {totalCustomers}
          </p>
          <p className="text-sm font-semibold text-[var(--fg)]">{METRIC_CARD.title}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">{METRIC_CARD.description}</p>
        </div>
      </div>

      <Card>
        <CardBody className="p-0 sm:p-4">
          <DataTable
            data={customers}
            columns={columns}
            searchPlaceholder="Buscar por nombre, codigo o email..."
          />
        </CardBody>
      </Card>

      <CustomerModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCustomer(null);
        }}
        customer={editingCustomer}
      />

      <Modal
        isOpen={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        title="Eliminar cliente"
        size="sm"
      >
        <p className="text-sm text-[var(--muted)] py-2">
          ¿Estas seguro de eliminar el cliente{' '}
          <span className="text-[var(--fg)] font-medium">&quot;{deletingCustomer?.name}&quot;</span>?
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeletingCustomer(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Eliminar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
