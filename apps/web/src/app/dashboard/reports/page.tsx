'use client';

import { useProducts } from '@/modules/products/hooks/use-products';
import { useLocations } from '@/modules/locations/hooks/use-locations';
import { useInventoryMovements } from '@/modules/inventory/hooks/use-inventory';
import { Card, CardHeader, CardBody, CardTitle } from '@/shared/components/ui/card';

export default function ReportsPage() {
  const { data: products } = useProducts();
  const { data: locations } = useLocations();
  const { data: movements } = useInventoryMovements();

  const productsList = products?.data || [];
  const locationsList = locations || [];
  const movementsList = movements || [];

  const stats = {
    totalProducts: productsList.length,
    totalLocations: locationsList.length,
    totalMovements: movementsList.length,
    movementsIn: movementsList.filter(m => m.type === 'IN').length,
    movementsOut: movementsList.filter(m => m.type === 'OUT').length,
    movementsTransfer: movementsList.filter(m => m.type === 'TRANSFER').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your inventory system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="text-center py-8">
            <div className="text-4xl font-bold text-primary-600">{stats.totalProducts}</div>
            <div className="text-sm font-medium text-gray-600 mt-2">Total Products</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center py-8">
            <div className="text-4xl font-bold text-blue-600">{stats.totalLocations}</div>
            <div className="text-sm font-medium text-gray-600 mt-2">Total Locations</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center py-8">
            <div className="text-4xl font-bold text-purple-600">{stats.totalMovements}</div>
            <div className="text-sm font-medium text-gray-600 mt-2">Total Movements</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-800">Incoming Movements</CardTitle>
          </CardHeader>
          <CardBody className="text-center py-6">
            <div className="text-3xl font-bold text-green-600">{stats.movementsIn}</div>
            <div className="text-sm text-gray-600 mt-1">IN operations</div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-800">Outgoing Movements</CardTitle>
          </CardHeader>
          <CardBody className="text-center py-6">
            <div className="text-3xl font-bold text-red-600">{stats.movementsOut}</div>
            <div className="text-sm text-gray-600 mt-1">OUT operations</div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800">Transfers</CardTitle>
          </CardHeader>
          <CardBody className="text-center py-6">
            <div className="text-3xl font-bold text-blue-600">{stats.movementsTransfer}</div>
            <div className="text-sm text-gray-600 mt-1">TRANSFER operations</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardBody>
          {movements && movements.length > 0 ? (
            <div className="space-y-3">
              {movements.slice(0, 5).map(movement => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        movement.type === 'IN'
                          ? 'bg-green-100 text-green-800'
                          : movement.type === 'OUT'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {movement.type}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {movement.quantity} units
                    </span>
                    {movement.referenceDocument && (
                      <span className="text-xs text-gray-500">
                        Ref: {movement.referenceDocument}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(movement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No movements recorded yet
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

