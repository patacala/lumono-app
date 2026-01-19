'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useCreateUser } from '../hooks/use-users';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserModal({ isOpen, onClose, onSuccess }: UserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [error, setError] = useState('');

  const createMutation = useCreateUser();
  const isLoading = createMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
      });
      setError('');
    }
  }, [isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password || !formData.name.trim()) {
      setError('Email, contrasena y nombre son requeridos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    try {
      await createMutation.mutateAsync({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear el usuario');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Usuario" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Nombre"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Nombre completo"
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="correo@ejemplo.com"
          required
        />

        <Input
          label="Contrasena"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="Minimo 6 caracteres"
          required
        />

        <Input
          label="Confirmar Contrasena"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          placeholder="Repetir contrasena"
          required
        />

        <div className="p-3 bg-info-50 border border-info-200 rounded-lg text-info-700 text-sm">
          El usuario se creara sin permisos. Podras asignar permisos despues desde la lista de
          usuarios.
        </div>

        <ModalFooter className="-mx-6 -mb-6 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Crear Usuario
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
