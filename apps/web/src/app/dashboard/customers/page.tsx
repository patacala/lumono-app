'use client';

import { useState } from 'react';
import { useCustomers, useDeleteCustomer, Customer } from '@/modules/customers/hooks/use-customers';
import { CustomerModal } from '@/modules/customers/components/customer-modal';
import { Card, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

export default function CustomersPage() {
  const { data: customers = [], isLoading } = useCustomers();
  const deleteMutation = useDeleteCustomer();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  function handleEdit(customer: Customer) {
    setEditingCustomer(customer);
    setModalOpen(true);
  }

  function handleCreate() {
    setEditingCustomer(null);
    setModalOpen(true);
  }

  function handleDelete(customer: Customer) {
    if (confirm(`Eliminar cliente "${customer.name}"?`)) {
      deleteMutation.mutate({ id: customer.id, version: customer.version });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona tus clientes</p>
        </div>
        <Button onClick={handleCreate}>+ Nuevo Cliente</Button>
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codigo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUC/NIT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">{customer.code}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.taxId || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button onClick={() => handleEdit(customer)} className="text-primary-600 hover:text-primary-900">Editar</button>
                        <button onClick={() => handleDelete(customer)} className="text-danger-600 hover:text-danger-900">Eliminar</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No hay clientes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <CustomerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={editingCustomer}
      />
    </div>
  );
}
