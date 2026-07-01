import { Controller, Get, Param, Res, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import * as bwipjs from 'bwip-js';
import { RequirePermissions } from '../auth/permissions.decorator';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { NotFoundError } from '@/domain/errors/domain.error';

@ApiTags('Barcodes')
@ApiBearerAuth()
@Controller('products')
export class BarcodeController {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  @Get(':id/barcode')
  @RequirePermissions('product.read')
  @ApiOperation({ summary: 'Generate barcode image for a product' })
  async getBarcode(
    @Param('id') id: string,
    @Res() res: Response,
    @Query('format') format: string = 'code128',
    @Query('width') width: string = '4',
    @Query('height') height: string = '20',
  ) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product', id);
    }

    const png = await bwipjs.toBuffer({
      bcid: format,
      text: product.sku,
      scale: 3,
      height: parseInt(height, 10),
      width: parseInt(width, 10),
      includetext: true,
      textxalign: 'center',
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename=${product.sku}-barcode.png`);
    res.send(png);
  }

  @Get(':id/barcode/label')
  @RequirePermissions('product.read')
  @ApiOperation({ summary: 'Get product label data with barcode' })
  async getBarcodeLabel(@Param('id') id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product', id);
    }

    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: product.sku,
      scale: 3,
      height: 15,
      includetext: true,
      textxalign: 'center',
    });

    return {
      product: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        unitPrice: product.unitPrice,
        unit: product.unit,
      },
      barcodeBase64: `data:image/png;base64,${png.toString('base64')}`,
    };
  }
}
