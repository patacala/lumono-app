'use client';

import { useMemo } from 'react';
import { useAuth } from '@/modules/auth/context/auth-context';
import { useProducts, Product } from '@/modules/products/hooks/use-products';
import { useCategories } from '@/modules/categories/hooks/use-categories';
import { Card, CardHeader, CardBody, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { getDaysUntilExpiration } from '@/shared/lib/stock-utils';
import Link from 'next/link';

// Icons
const BoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M10.362 1.093a.75.75 0 00-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925zM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0018 14.25V6.443zm-8.75 12.25v-8.25l-7.25-4v7.807a.75.75 0 00.388.657l6.862 3.786z" clipRule="evenodd" />
  </svg>
);

const CurrencyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
    <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.160.46.284.736.363v-2.48a3.13 3.13 0 00-1.138.432c-.482.315-.612.648-.612.875 0 .227.13.56.612.875a3.13 3.13 0 00.218.171z" />
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3a3.78 3.78 0 01-1.653-.713 2.833 2.833 0 01-.925-1.199.75.75 0 011.395-.55c.12.282.296.516.447.563.264.082.551.14.856.165v-2.783a5.032 5.032 0 01-1.959-.696C4.291 9.645 3.787 8.89 3.787 8.03c0-.86.504-1.616 1.29-2.13.576-.376 1.261-.603 1.96-.696V4.75A.75.75 0 019 4v.316c.698.093 1.383.32 1.96.696a2.833 2.833 0 01.924 1.199.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 01-1.5 0v-.3z" clipRule="evenodd" />
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
  </svg>
);

const EmptyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
  </svg>
);

interface AlertSection {
  categoryName: string;
  categoryId: string;
  products: Product[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: productsData } = useProducts({ limit: 500 });
  const { data: categories } = useCategories();

  const products = productsData?.data || [];

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalItems = products.length;
    const totalValue = products.reduce((sum, p) => sum + ((p.totalStock || 0) * p.unitPrice), 0);
    const outOfStock = products.filter(p => (p.totalStock || 0) === 0).length;
    const lowStock = products.filter(p => (p.totalStock || 0) > 0 && (p.totalStock || 0) < p.stockThreshold).length;
    const expiringSoon = products.filter(p => {
      if (!p.expirationDate) return false;
      const days = getDaysUntilExpiration(p.expirationDate);
      return days >= 0 && days <= 7;
    }).length;

    return { totalItems, totalValue, outOfStock, lowStock, expiringSoon };
  }, [products]);

  // Group alerts by category
  const alertGroups = useMemo(() => {
    const lowStockProducts = products.filter(p => (p.totalStock || 0) > 0 && (p.totalStock || 0) < p.stockThreshold);
    const outOfStockProducts = products.filter(p => (p.totalStock || 0) === 0);
    const expiringProducts = products.filter(p => {
      if (!p.expirationDate) return false;
      const days = getDaysUntilExpiration(p.expirationDate);
      return days >= 0 && days <= 7;
    });

    const groupByCategory = (items: Product[]): AlertSection[] => {
      const groups: Record<string, Product[]> = {};
      items.forEach(p => {
        const key = p.categoryName || 'Sin Categoria';
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
      });
      return Object.entries(groups).map(([categoryName, products]) => ({
        categoryName,
        categoryId: products[0]?.categoryId || '',
        products,
      }));
    };

    return {
      lowStock: groupByCategory(lowStockProducts),
      outOfStock: groupByCategory(outOfStockProducts),
      expiring: groupByCategory(expiringProducts),
    };
  }, [products]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          {getGreeting()}, {user?.name || user?.email}!
        </h1>
        <p className="text-surface-500">Aqui esta un resumen de tu stock actual</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-surface-100 text-surface-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors duration-300">
                <BoxIcon />
              </div>
            </div>
            <p className="text-3xl font-bold text-surface-900 mb-1">{metrics.totalItems}</p>
            <p className="text-sm text-surface-500 font-medium">Total Items</p>
          </CardBody>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-surface-100 text-surface-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors duration-300">
                <CurrencyIcon />
              </div>
            </div>
            <p className="text-3xl font-bold text-surface-900 mb-1">${metrics.totalValue.toFixed(2)}</p>
            <p className="text-sm text-surface-500 font-medium">Valor Stock</p>
          </CardBody>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-surface-100 text-surface-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors duration-300">
                <EmptyIcon />
              </div>
            </div>
            <p className="text-3xl font-bold text-surface-900 mb-1">{metrics.outOfStock}</p>
            <p className="text-sm text-surface-500 font-medium">Sin Stock</p>
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

      {/* Alert Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Section */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-surface-100 text-surface-600">
                <WarningIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-surface-900">Stock Bajo</h3>
                <p className="text-xs text-surface-500">Items con stock bajo por categoria</p>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto -mx-6 px-6">
              {alertGroups.lowStock.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-100 text-surface-400 mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-surface-500">Ningun item con stock bajo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertGroups.lowStock.map((group) => (
                    <div key={group.categoryName}>
                      <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2">
                        {group.categoryName}
                      </p>
                      <div className="space-y-2">
                        {group.products.slice(0, 3).map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 bg-surface-50/50 hover:bg-surface-50 rounded-lg border border-surface-200/50 hover:border-surface-300/50 transition-all duration-200">
                            <span className="text-sm font-medium text-surface-700 truncate flex-1">{product.name}</span>
                            <span className="ml-3 text-sm font-semibold text-surface-900 bg-white px-2.5 py-1 rounded-md border border-surface-200">
                              {product.totalStock || 0} {product.unit || 'unid'}
                            </span>
                          </div>
                        ))}
                        {group.products.length > 3 && (
                          <p className="text-xs text-surface-400 text-center pt-1">
                            +{group.products.length - 3} mas
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Out of Stock Section */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-surface-100 text-surface-600">
                <EmptyIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-surface-900">Sin Stock</h3>
                <p className="text-xs text-surface-500">Items sin stock por categoria</p>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto -mx-6 px-6">
              {alertGroups.outOfStock.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-100 text-surface-400 mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-surface-500">Ningun item sin stock</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertGroups.outOfStock.map((group) => (
                    <div key={group.categoryName}>
                      <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2">
                        {group.categoryName}
                      </p>
                      <div className="space-y-2">
                        {group.products.slice(0, 3).map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 bg-surface-50/50 hover:bg-surface-50 rounded-lg border border-surface-200/50 hover:border-surface-300/50 transition-all duration-200">
                            <span className="text-sm font-medium text-surface-700 truncate flex-1">{product.name}</span>
                            <span className="ml-3 text-sm font-semibold text-surface-900 bg-white px-2.5 py-1 rounded-md border border-surface-200">
                              Sin Stock
                            </span>
                          </div>
                        ))}
                        {group.products.length > 3 && (
                          <p className="text-xs text-surface-400 text-center pt-1">
                            +{group.products.length - 3} mas
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Expiring Soon Section */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-surface-100 text-surface-600">
                <CalendarIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-surface-900">Proximo a Vencer</h3>
                <p className="text-xs text-surface-500">Items por vencer en 7 dias</p>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto -mx-6 px-6">
              {alertGroups.expiring.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-100 text-surface-400 mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-surface-500">Ningun item proximo a vencer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertGroups.expiring.map((group) => (
                    <div key={group.categoryName}>
                      <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2">
                        {group.categoryName}
                      </p>
                      <div className="space-y-2">
                        {group.products.slice(0, 3).map((product) => {
                          const days = getDaysUntilExpiration(product.expirationDate!);
                          return (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-surface-50/50 hover:bg-surface-50 rounded-lg border border-surface-200/50 hover:border-surface-300/50 transition-all duration-200">
                              <span className="text-sm font-medium text-surface-700 truncate flex-1">{product.name}</span>
                              <span className="ml-3 text-sm font-semibold text-surface-900 bg-white px-2.5 py-1 rounded-md border border-surface-200">
                                {days <= 0 ? 'Vencido' : `${days} dias`}
                              </span>
                            </div>
                          );
                        })}
                        {group.products.length > 3 && (
                          <p className="text-xs text-surface-400 text-center pt-1">
                            +{group.products.length - 3} mas
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias del Stock</CardTitle>
          <p className="text-xs text-surface-500 mt-1">Vision general de las categorias</p>
        </CardHeader>
        <CardBody>
          {!categories || categories.length === 0 ? (
            <div className="text-center py-6 text-surface-500">
              No hay categorias creadas
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/dashboard/stock?category=${category.id}`}
                  className="block"
                >
                  <div className="p-4 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || '#6366f1' }}
                      />
                      <h4 className="font-medium text-surface-900 truncate">{category.name}</h4>
                    </div>
                    <p className="text-sm text-surface-500">{category.productCount || 0} items</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
