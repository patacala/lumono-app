'use client';

import { useState, useMemo } from 'react';
import { Card, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Tabs } from '@/shared/components/ui/tabs';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableEmpty } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { StatusBadge } from '@/shared/components/ui/status-badge';
import { Pagination } from '@/shared/components/ui/pagination';
import { useProducts, Product } from '@/modules/products/hooks/use-products';
import { useCategories, Category } from '@/modules/categories/hooks/use-categories';
import { ProductModal } from '@/modules/products/components/product-modal';
import { CategoryModal } from '@/modules/categories/components/category-modal';
import { getStockStatus, getRowClassName, getStockCellClassName, formatExpirationDate, getDaysUntilExpiration } from '@/shared/lib/stock-utils';
import { useAuth } from '@/modules/auth/context/auth-context';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

const BoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10.362 1.093a.75.75 0 00-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925zM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0018 14.25V6.443zm-8.75 12.25v-8.25l-7.25-4v7.807a.75.75 0 00.388.657l6.862 3.786z" clipRule="evenodd" />
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
  </svg>
);

export default function StockPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | undefined>();

  const { data: productsData, isLoading: productsLoading } = useProducts({
    page,
    limit: 10,
    search: search || undefined,
    categoryId: selectedCategory || undefined,
  });

  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const canCreate = hasPermission('product.create');
  const canUpdate = hasPermission('product.update');

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!productsData?.data) return { total: 0, lowStock: 0, expiringSoon: 0 };

    const products = productsData.data;
    const total = productsData.pagination.total;
    const lowStock = products.filter(p => (p.totalStock || 0) < p.stockThreshold && (p.totalStock || 0) > 0).length;
    const expiringSoon = products.filter(p => p.expirationDate && getDaysUntilExpiration(p.expirationDate) <= 7 && getDaysUntilExpiration(p.expirationDate) >= 0).length;

    return { total, lowStock, expiringSoon };
  }, [productsData]);

  const categoryOptions = [
    { value: '', label: 'Todas las categorias' },
    ...(categories?.map(c => ({ value: c.id, label: c.name })) || []),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Gestion de Stock</h1>
          <p className="text-surface-500">Gestiona items, categorias y niveles minimos</p>
        </div>
        {canCreate && (
          <Button
            onClick={() => activeTab === 'items' ? setIsProductModalOpen(true) : setIsCategoryModalOpen(true)}
          >
            <PlusIcon />
            {activeTab === 'items' ? 'Nuevo Item' : 'Nueva Categoria'}
          </Button>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-surface-100 text-surface-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors duration-300">
                <BoxIcon />
              </div>
            </div>
            <p className="text-3xl font-bold text-surface-900 mb-1">{metrics.total}</p>
            <p className="text-sm text-surface-500 font-medium">Total Items</p>
          </CardBody>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-surface-100 text-surface-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors duration-300">
                <WarningIcon />
              </div>
            </div>
            <p className="text-3xl font-bold text-surface-900 mb-1">{metrics.lowStock}</p>
            <p className="text-sm text-surface-500 font-medium">Stock Bajo</p>
          </CardBody>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-surface-100 text-surface-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors duration-300">
                <CalendarIcon />
              </div>
            </div>
            <p className="text-3xl font-bold text-surface-900 mb-1">{metrics.expiringSoon}</p>
            <p className="text-sm text-surface-500 font-medium">Por Vencer</p>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'items', label: 'Items', count: productsData?.pagination.total },
          { id: 'categories', label: 'Categorias', count: categories?.length },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'items' | 'categories')}
      />

      {/* Items Tab */}
      {activeTab === 'items' && (
        <Card>
          <CardBody>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Buscar items..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                  }
                />
              </div>
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

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Nombre</TableHeader>
                    <TableHeader>Categoria</TableHeader>
                    <TableHeader>Stock Actual</TableHeader>
                    <TableHeader>Stock Minimo</TableHeader>
                    <TableHeader>Unidad</TableHeader>
                    <TableHeader>Caducidad</TableHeader>
                    <TableHeader>Status</TableHeader>
                    {canUpdate && <TableHeader>Acciones</TableHeader>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productsLoading ? (
                    <TableRow>
                      <TableCell colSpan={canUpdate ? 8 : 7} className="text-center py-8">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : productsData?.data.length === 0 ? (
                    <TableEmpty colSpan={canUpdate ? 8 : 7}>
                      No se encontraron items
                    </TableEmpty>
                  ) : (
                    productsData?.data.map((product) => {
                      const status = getStockStatus(
                        product.totalStock || 0,
                        product.stockThreshold,
                        product.expirationDate
                      );
                      const rowClass = getRowClassName(status);
                      const stockCellClass = getStockCellClassName(
                        product.totalStock || 0,
                        product.stockThreshold
                      );

                      return (
                        <TableRow key={product.id} className={rowClass}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-surface-900">{product.name}</p>
                              <p className="text-xs text-surface-500">{product.sku}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {product.categoryName ? (
                              <Badge variant="neutral" size="sm">
                                {product.categoryName}
                              </Badge>
                            ) : (
                              <span className="text-surface-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className={stockCellClass}>
                            <span className="font-medium">{product.totalStock || 0}</span>
                          </TableCell>
                          <TableCell>{product.stockThreshold}</TableCell>
                          <TableCell>{product.unit || 'unid'}</TableCell>
                          <TableCell>
                            {product.expirationDate ? (
                              <div>
                                <p>{formatExpirationDate(product.expirationDate)}</p>
                                {getDaysUntilExpiration(product.expirationDate) <= 7 && (
                                  <p className="text-xs text-danger-600">
                                    {getDaysUntilExpiration(product.expirationDate)} dias
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-surface-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={status} />
                          </TableCell>
                          {canUpdate && (
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                Editar
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {productsData && productsData.pagination.totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={productsData.pagination.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesLoading ? (
            <p className="text-surface-500">Cargando categorias...</p>
          ) : categories?.length === 0 ? (
            <Card className="col-span-full">
              <CardBody className="text-center py-8">
                <p className="text-surface-500">No hay categorias creadas</p>
                {canCreate && (
                  <Button className="mt-4" onClick={() => setIsCategoryModalOpen(true)}>
                    <PlusIcon />
                    Crear Primera Categoria
                  </Button>
                )}
              </CardBody>
            </Card>
          ) : (
            categories?.map((category) => (
              <Card key={category.id} className="hover:shadow-elevated transition-shadow duration-200">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color || '#6366f1' }}
                      />
                      <div>
                        <h3 className="font-semibold text-surface-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-surface-500">{category.description}</p>
                        )}
                      </div>
                    </div>
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-surface-100">
                    <p className="text-sm text-surface-600">
                      <span className="font-medium">{category.productCount || 0}</span> items
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modals */}
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
