'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useCreateCategory, useUpdateCategory, Category } from '../hooks/use-categories';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
  onSuccess?: () => void;
}

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

export function CategoryModal({ isOpen, onClose, category, onSuccess }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState('');

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(category?.id || '');

  const isEditing = !!category;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
      setColor(category.color || PRESET_COLORS[0]);
    } else {
      setName('');
      setDescription('');
      setColor(PRESET_COLORS[0]);
    }
    setError('');
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
          color,
          version: category!.version,
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la categoria');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Categoria' : 'Nueva Categoria'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Proteinas, Lacteos, Bebidas..."
          required
        />

        <Input
          label="Descripcion (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripcion de la categoria"
        />

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={`
                  w-8 h-8 rounded-full transition-all duration-200
                  ${color === presetColor ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'hover:scale-105'}
                `}
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
        </div>

        <ModalFooter className="-mx-6 -mb-6 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Guardar Cambios' : 'Crear Categoria'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
