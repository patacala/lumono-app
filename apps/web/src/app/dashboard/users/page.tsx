'use client';

import { useState } from 'react';
import { Card, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableEmpty } from '@/shared/components/ui/table';
import { useUsers, usePermissions, useAssignPermission, useRevokePermission, User, Permission } from '@/modules/users/hooks/use-users';
import { UserModal } from '@/modules/users/components/user-modal';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { useAuth } from '@/modules/auth/context/auth-context';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
  </svg>
);

// Group permissions by category
function groupPermissionsByCategory(permissions: Permission[]) {
  const groups: Record<string, Permission[]> = {};
  permissions.forEach(p => {
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
  const userPermissionIds = new Set(user.permissions?.map(p => p.id) || []);

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
            <h4 className="text-sm font-semibold text-surface-700 uppercase mb-3">{category}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {permissions.map(permission => {
                const isAssigned = userPermissionIds.has(permission.id);
                return (
                  <button
                    key={permission.id}
                    onClick={() => handleTogglePermission(permission)}
                    disabled={isLoading}
                    className={`
                      p-3 rounded-lg border text-left transition-all
                      ${isAssigned
                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                        : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${
                        isAssigned ? 'bg-primary-500 text-white' : 'border border-surface-300'
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
                          <p className="text-xs text-surface-500">{permission.description}</p>
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

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const { data: users, isLoading: usersLoading, error: usersError } = useUsers();
  const { data: allPermissions, error: permissionsError } = usePermissions();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  const canManageUsers = hasPermission('user.manage');

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-surface-900">Acceso Restringido</h2>
          <p className="text-surface-500 mt-2">No tienes permisos para gestionar usuarios</p>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardBody className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger-100 text-danger-600 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-surface-900 mb-2">Error al Cargar Usuarios</h2>
            <p className="text-surface-500">
              No se pudo cargar la información de usuarios. Por favor, verifica que el servidor esté corriendo e intenta nuevamente.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleManagePermissions = (user: User) => {
    setSelectedUser(user);
    setIsPermissionsModalOpen(true);
  };

  const getUserType = (user: User) => {
    const hasUserManage = user.permissions?.some(p => p.name === 'user.manage') || false;
    return hasUserManage ? 'Admin' : 'Staff';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Gestion de Usuarios</h1>
          <p className="text-surface-500">Administra usuarios y sus permisos</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
              <UsersIcon />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{users?.length || 0}</p>
              <p className="text-sm text-surface-500">Total Usuarios</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success-100 text-success-600">
              <UsersIcon />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">
                {users?.filter(u => u.permissions?.some(p => p.name === 'user.manage')).length || 0}
              </p>
              <p className="text-sm text-surface-500">Administradores</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info-100 text-info-600">
              <UsersIcon />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">
                {users?.filter(u => !u.permissions?.some(p => p.name === 'user.manage')).length || 0}
              </p>
              <p className="text-sm text-surface-500">Staff</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardBody>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Usuario</TableHeader>
                  <TableHeader>Tipo</TableHeader>
                  <TableHeader>Permisos</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader>Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : !users || users.length === 0 ? (
                  <TableEmpty colSpan={5}>No hay usuarios registrados</TableEmpty>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-surface-900">{user.name}</p>
                            <p className="text-sm text-surface-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getUserType(user) === 'Admin' ? 'primary' : 'neutral'}
                          size="sm"
                        >
                          {getUserType(user)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-surface-600">
                          {user.permissions?.length || 0} permisos
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? 'success' : 'neutral'} size="sm">
                          {user.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleManagePermissions(user)}
                        >
                          Gestionar Permisos
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Modals */}
      <UserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <PermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        allPermissions={allPermissions || []}
      />
    </div>
  );
}
