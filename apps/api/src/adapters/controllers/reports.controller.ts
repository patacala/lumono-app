import { Controller, Get, Res, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { RequirePermissions } from '../auth/permissions.decorator';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IInventoryMovementRepository')
    private readonly inventoryMovementRepository: IInventoryMovementRepository,
  ) {}

  @Get('inventory/excel')
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'Export inventory stock report as Excel' })
  async exportInventoryExcel(@Res() res: Response) {
    const products = await this.productRepository.findAllWithStock();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Lumono';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Inventory Stock');

    sheet.columns = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Product Name', key: 'name', width: 30 },
      { header: 'Unit', key: 'unit', width: 10 },
      { header: 'Unit Price', key: 'unitPrice', width: 15 },
      { header: 'Total Stock', key: 'totalStock', width: 15 },
      { header: 'Threshold', key: 'stockThreshold', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Expiration Date', key: 'expirationDate', width: 18 },
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const product of products) {
      const totalStock = product.totalStock ?? 0;
      sheet.addRow({
        sku: product.sku,
        name: product.name,
        unit: product.unit,
        unitPrice: Number(product.unitPrice),
        totalStock,
        stockThreshold: product.stockThreshold,
        status: totalStock <= product.stockThreshold ? 'LOW STOCK' : 'OK',
        expirationDate: product.expirationDate
          ? new Date(product.expirationDate).toLocaleDateString()
          : '',
      });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=inventory-stock-${new Date().toISOString().split('T')[0]}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('movements/excel')
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'Export inventory movements as Excel' })
  async exportMovementsExcel(
    @Res() res: Response,
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
  ) {
    let movements;
    if (productId) {
      movements = await this.inventoryMovementRepository.findByProductId(productId);
    } else if (locationId) {
      movements = await this.inventoryMovementRepository.findByLocationId(locationId);
    } else {
      movements = await this.inventoryMovementRepository.findAll();
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Lumono';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Movements');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Product ID', key: 'productId', width: 36 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Origin Location', key: 'originLocationId', width: 36 },
      { header: 'Dest Location', key: 'destLocationId', width: 36 },
      { header: 'Reference', key: 'referenceDocument', width: 20 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Created By', key: 'createdBy', width: 36 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const movement of movements) {
      sheet.addRow({
        id: movement.id,
        type: movement.type,
        productId: movement.productId,
        quantity: movement.quantity,
        originLocationId: movement.originLocationId ?? '',
        destLocationId: movement.destLocationId ?? '',
        referenceDocument: movement.referenceDocument ?? '',
        notes: movement.notes ?? '',
        createdAt: new Date(movement.createdAt).toLocaleString(),
        createdBy: movement.createdBy ?? '',
      });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=movements-${new Date().toISOString().split('T')[0]}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('inventory/summary')
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'Get inventory summary data for charts' })
  async getInventorySummary() {
    const products = await this.productRepository.findAllWithStock();

    let lowStockCount = 0;
    let totalStockValue = 0;

    const mappedProducts = products.map((p) => {
      const totalStock = p.totalStock ?? 0;
      const isLowStock = totalStock <= p.stockThreshold;
      if (isLowStock) lowStockCount++;
      const stockValue = totalStock * Number(p.unitPrice);
      totalStockValue += stockValue;

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        totalStock,
        stockThreshold: p.stockThreshold,
        isLowStock,
        stockValue,
        unit: p.unit,
      };
    });

    return {
      totalProducts: products.length,
      lowStockCount,
      totalStockValue,
      products: mappedProducts,
    };
  }
}
