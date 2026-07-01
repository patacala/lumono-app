'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { useCreateCustomer, useUpdateCustomer, Customer } from '../hooks/use-customers';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

export function CustomerModal({ isOpen, onClose, customer }: CustomerModalProps) {
  const [form, setForm] = useState({
    code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
  });

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const isEditing = !!customer;

  useEffect(() => {
    if (customer) {
      setForm({
        code: customer.code,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        taxId: customer.taxId || '',
      });
    } else {
      setForm({ code: '', name: '', email: '', phone: '', address: '', taxId: '' });
    }
  }, [customer, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      ...form,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      taxId: form.taxId || undefined,
    };

    if (isEditing && customer) {
      const { code, ...updateData } = data;
      await updateMutation.mutateAsync({ id: customer.id, ...updateData, version: customer.version });
    } else {
      await createMutation.mutateAsync(data as any);
    }
    onClose();
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Codigo"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
          disabled={isEditing}
        />
        <Input
          label="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Telefono"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Input
          label="Direccion"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <Input
          label="RUC/NIT"
          value={form.taxId}
          onChange={(e) => setForm({ ...form, taxId: e.target.value })}
        />

        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
