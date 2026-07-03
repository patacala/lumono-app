'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Select } from '@/shared/components/ui/select';
import { Tabs } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { StatusBadge } from '@/shared/components/ui/status-badge';
import { DataTable } from '@/shared/components/ui/data-table';
import { useProducts, Product } from '@/modules/products/hooks/use-products';
import { useCategories, Category } from '@/modules/categories/hooks/use-categories';
import { ProductModal } from '@/modules/products/components/product-modal';
import { CategoryModal } from '@/modules/categories/components/category-modal';
import {
  getStockStatus,
  formatExpirationDate,
  getDaysUntilExpiration,
} from '@/shared/lib/stock-utils';
import { useAuth } from '@/modules/auth/context/auth-context';
import { Package, AlertTriangle, CalendarDays, Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';

const METRIC_CARDS = [
  {
    key: 'total',
    icon: Package,
    title: 'Total Productos',
    description: 'Productos registrados en el sistema',
  },
  {
    key: 'lowStock',
    icon: AlertTriangle,
    title: 'Stock Bajo',
    description: 'Productos bajo el minimo configurado',
  },
  {
    key: 'expiringSoon',
    icon: CalendarDays,
    title: 'Por Vencer',
    description: 'Caducan en los proximos 7 dias',
  },
] as const;


export default function ProductsPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | undefined>();

  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts({
    page,
    limit: 20,
    search: search || undefined,
    categoryId: selectedCategory || undefined,
  });

  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const canCreate = hasPermission('product.create');
  const canUpdate = hasPermission('product.update');

  const metrics = useMemo(() => {
    if (!productsData?.data) return { total: 0, lowStock: 0, expiringSoon: 0 };

    const products = productsData.data;
    const total = productsData.pagination.total;
    const lowStock = products.filter(
      (p) => (p.totalStock || 0) < p.stockThreshold && (p.totalStock || 0) > 0,
    ).length;
    const expiringSoon = products.filter(
      (p) =>
        p.expirationDate &&
        getDaysUntilExpiration(p.expirationDate) <= 7 &&
        getDaysUntilExpiration(p.expirationDate) >= 0,
    ).length;

    return { total, lowStock, expiringSoon };
  }, [productsData]);

  const categoryOptions = [
    { value: '', label: 'Todas las categorias' },
    ...(categories?.map((c) => ({ value: c.id, label: c.name })) || []),
  ];

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategoryForEdit(category);
    setIsCategoryModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(undefined);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategoryForEdit(undefined);
  };

  const productColumns = useMemo<ColumnDef<Product, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => (
          <Link
            href={`/dashboard/products/${row.original.id}`}
            className="block group/link"
          >
            <p className="font-medium text-[var(--fg)] group-hover/link:text-[var(--accent)] transition-colors">
              {row.original.name}
            </p>
            <p className="text-xs text-[var(--muted)]">{row.original.sku}</p>
          </Link>
        ),
      },
      {
        accessorKey: 'categoryName',
        header: 'Categoria',
        cell: ({ getValue }) => {
          const name = getValue() as string | undefined;
          return name ? (
            <Badge variant="neutral" size="sm">{name}</Badge>
          ) : (
            <span className="text-[var(--muted)]">-</span>
          );
        },
      },
      {
        accessorKey: 'totalStock',
        header: 'Stock Actual',
        cell: ({ getValue }) => (
          <span className="font-semibold tabular-nums">{getValue() ?? 0}</span>
        ),
      },
      {
        accessorKey: 'stockThreshold',
        header: 'Stock Minimo',
        cell: ({ getValue }) => (
          <span className="tabular-nums">{getValue()}</span>
        ),
      },
      {
        accessorKey: 'unit',
        header: 'Unidad',
        cell: ({ getValue }) => (getValue() as string) || 'unid',
      },
      {
        accessorKey: 'expirationDate',
        header: 'Caducidad',
        cell: ({ getValue }) => {
          const date = getValue() as string | undefined;
          if (!date) return <span className="text-[var(--muted)]">-</span>;
          const days = getDaysUntilExpiration(date);
          return (
            <div>
              <p>{formatExpirationDate(date)}</p>
              {days <= 7 && days >= 0 && (
                <p className="text-xs text-[oklch(68%_0.01_260)]">{days} dias</p>
              )}
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const status = getStockStatus(
            row.original.totalStock || 0,
            row.original.stockThreshold,
            row.original.expirationDate,
          );
          return <StatusBadge status={status} />;
        },
      },
      ...(canUpdate
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Product } }) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditProduct(row.original)}
                >
                  Editar
                </Button>
              ),
            } as ColumnDef<Product, any>,
          ]
        : []),
    ],
    [canUpdate],
  );

  const categoryColumns = useMemo<ColumnDef<Category, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: row.original.color || 'oklch(68% 0.19 55)' }}
            />
            <div>
              <p className="font-medium text-[var(--fg)]">{row.original.name}</p>
              {row.original.description && (
                <p className="text-xs text-[var(--muted)] max-w-xs truncate">
                  {row.original.description}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'productCount',
        header: 'Productos',
        cell: ({ getValue }) => (
          <span className="tabular-nums">{getValue() ?? 0}</span>
        ),
      },
      ...(canUpdate
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: Category } }) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditCategory(row.original)}
                >
                  Editar
                </Button>
              ),
            } as ColumnDef<Category, any>,
          ]
        : []),
    ],
    [canUpdate],
  );

  if (productsLoading && activeTab === 'items') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--muted)]">Cargando productos...</div>
      </div>
    );
  }

  if (productsError) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-[var(--status-critical)]">
            Error al cargar productos. Intenta de nuevo.
          </div>
        </CardBody>
      </Card>
    );
  }

  const products = productsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Productos</h1>
          <p className="text-[var(--muted)]">Gestiona productos, categorias y niveles de stock</p>
        </div>
        {canCreate && (
          <Button
            onClick={() =>
              activeTab === 'items'
                ? setIsProductModalOpen(true)
                : setIsCategoryModalOpen(true)
            }
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'items' ? 'Nuevo Producto' : 'Nueva Categoria'}
          </Button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {METRIC_CARDS.map(({ key, icon: Icon, title, description }) => (
          <div
            key={key}
            className="border border-[var(--border)] rounded-xl p-4 transition-all text-left"
          >
            <Icon className="w-5 h-5 text-[var(--accent)] mb-2" />
            <p className="text-2xl font-bold text-[var(--fg)] tabular-nums mb-0.5">
              {metrics[key]}
            </p>
            <p className="text-sm font-semibold text-[var(--fg)]">{title}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{description}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Tabs
            tabs={[
              { id: 'items', label: 'Productos', count: productsData?.pagination.total },
              { id: 'categories', label: 'Categorias', count: categories?.length },
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as 'items' | 'categories')}
          />
        </CardHeader>

        <CardBody className="p-0 sm:p-4">
          {activeTab === 'items' && (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Buscar productos..."
                  className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] w-full sm:w-64 text-sm"
                />
                <div className="w-full sm:w-64">
                  <Select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(1);
                    }}
                    options={categoryOptions}
                  />
                </div>
              </div>
              <DataTable
                data={products}
                columns={productColumns}
                showSearch={false}
                showPagination={false}
              />
            </>
          )}

          {activeTab === 'categories' && (
            categoriesLoading ? (
              <div className="text-center py-8 text-[var(--muted)]">Cargando categorias...</div>
            ) : categories?.length === 0 ? (
              <div className="text-center py-12 text-[var(--muted)]">
                <p>No hay categorias creadas</p>
                {canCreate && (
                  <Button className="mt-4" onClick={() => setIsCategoryModalOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Crear Primera Categoria
                  </Button>
                )}
              </div>
            ) : (
              <DataTable
                data={categories}
                columns={categoryColumns}
                searchPlaceholder="Buscar categorias..."
              />
            )
          )}
        </CardBody>
      </Card>

      {activeTab === 'items' && productsData && productsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--muted)]">
            Mostrando {products.length} de {productsData.pagination.total} productos
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <span className="px-3 py-1 text-sm text-[var(--muted)]">
              Pagina {page} de {productsData.pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= productsData.pagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        product={selectedProduct}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        category={selectedCategoryForEdit}
      />
    </div>
  );
}
