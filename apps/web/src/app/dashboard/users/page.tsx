'use client';

import { useState, useMemo } from 'react';
import { Card, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { DataTable } from '@/shared/components/ui/data-table';
import { useUsers, usePermissions, useAssignPermission, useRevokePermission, User, Permission } from '@/modules/users/hooks/use-users';
import { UserModal } from '@/modules/users/components/user-modal';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { useAuth } from '@/modules/auth/context/auth-context';
import { Users, Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';

const METRIC_CARD = {
  icon: Users,
  title: 'Total Usuarios',
  description: 'Usuarios registrados en el sistema',
};

function groupPermissionsByCategory(permissions: Permission[]) {
  const groups: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  });
  return groups;
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  allPermissions: Permission[];
}

function PermissionsModal({ isOpen, onClose, user, allPermissions }: PermissionsModalProps) {
  const assignPermission = useAssignPermission();
  const revokePermission = useRevokePermission();

  if (!user) return null;

  const groupedPermissions = groupPermissionsByCategory(allPermissions);
  const userPermissionIds = new Set(user.permissions?.map((p) => p.id) || []);

  const handleTogglePermission = async (permission: Permission) => {
    const hasPermission = userPermissionIds.has(permission.id);
    if (hasPermission) {
      await revokePermission.mutateAsync({ userId: user.id, permissionId: permission.id });
    } else {
      await assignPermission.mutateAsync({ userId: user.id, permissionId: permission.id });
    }
  };

  const isLoading = assignPermission.isPending || revokePermission.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Permisos de ${user.name}`} size="lg">
      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, permissions]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-[var(--fg-secondary)] uppercase mb-3">{category}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {permissions.map((permission) => {
                const isAssigned = userPermissionIds.has(permission.id);
                return (
                  <button
                    key={permission.id}
                    onClick={() => handleTogglePermission(permission)}
                    disabled={isLoading}
                    className={`
                      p-3 rounded-lg border text-left transition-all
                      ${isAssigned
                        ? 'bg-[var(--accent-dim)] border-[var(--accent)] text-[var(--accent)]'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-hover)]'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${
                        isAssigned ? 'bg-[var(--accent)] text-[oklch(12%_0.02_55)]' : 'border border-[var(--border)]'
                      }`}>
                        {isAssigned && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{permission.name}</p>
                        {permission.description && (
                          <p className="text-xs text-[var(--muted)]">{permission.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ModalFooter className="-mx-6 -mb-6 mt-6">
        <Button variant="ghost" onClick={onClose}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function getUserType(user: User) {
  const hasUserManage = user.permissions?.some((p) => p.name === 'user.manage') || false;
  return hasUserManage ? 'Admin' : 'Staff';
}

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsers();
  const { data: allPermissions } = usePermissions();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  // Derive selectedUser from the live query data so it updates when cache is invalidated
  const selectedUser = selectedUserId ? users.find((u) => u.id === selectedUserId) ?? null : null;

  const canManageUsers = hasPermission('user.manage');
  const totalUsers = users.length;

  function handleManagePermissions(user: User) {
    setSelectedUserId(user.id);
    setIsPermissionsModalOpen(true);
  }

  const columns = useMemo<ColumnDef<User, any>[]>(
    () => [
      {
        id: 'user',
        header: 'Usuario',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-dim)] flex items-center justify-center text-[var(--accent)] font-semibold shrink-0">
              {row.original.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-[var(--fg)]">{row.original.name}</p>
              <p className="text-sm text-[var(--muted)]">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'type',
        header: 'Tipo',
        cell: ({ row }) => {
          const type = getUserType(row.original);
          return (
            <Badge variant={type === 'Admin' ? 'accent' : 'neutral'} size="sm">
              {type}
            </Badge>
          );
        },
      },
      {
        id: 'permissions',
        header: 'Permisos',
        cell: ({ row }) => (
          <span className="text-sm text-[var(--fg-secondary)]">
            {row.original.permissions?.length || 0} permisos
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Estado',
        cell: ({ row }) => (
          <Badge variant={row.original.active ? 'ok' : 'neutral'} size="sm">
            {row.original.active ? 'Activo' : 'Inactivo'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleManagePermissions(row.original)}
          >
            Gestionar Permisos
          </Button>
        ),
      },
    ],
    [],
  );

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--fg)]">Acceso Restringido</h2>
          <p className="text-[var(--muted)] mt-2">No tienes permisos para gestionar usuarios</p>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <div className="text-[var(--status-critical)] mb-2">Error al Cargar Usuarios</div>
          <p className="text-[var(--muted)]">
            No se pudo cargar la informacion de usuarios. Intenta de nuevo.
          </p>
        </CardBody>
      </Card>
    );
  }

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--muted)]">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Usuarios</h1>
          <p className="text-[var(--muted)]">Administra usuarios y sus permisos</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="max-w-sm">
        <div className="border border-[var(--border)] rounded-xl p-4 transition-all text-left">
          <METRIC_CARD.icon className="w-5 h-5 text-[var(--accent)] mb-2" />
          <p className="text-2xl font-bold text-[var(--fg)] tabular-nums mb-0.5">
            {totalUsers}
          </p>
          <p className="text-sm font-semibold text-[var(--fg)]">{METRIC_CARD.title}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">{METRIC_CARD.description}</p>
        </div>
      </div>

      <Card>
        <CardBody className="p-0 sm:p-4">
          <DataTable
            data={users}
            columns={columns}
            searchPlaceholder="Buscar por nombre o email..."
          />
        </CardBody>
      </Card>

      <UserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <PermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedUserId(null);
        }}
        user={selectedUser}
        allPermissions={allPermissions || []}
      />
    </div>
  );
}
