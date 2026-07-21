'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { useImportProducts } from '../hooks/use-products';
import { Upload, FileText, AlertCircle, CheckCircle2, Download } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CsvRow {
  nombre?: string;
  precio?: string;
  sku?: string;
  descripcion?: string;
  marca?: string;
  unidad?: string;
  umbral_stock?: string;
  precio_venta?: string;
  codigo_barras?: string;
}

interface ParsedProduct {
  name: string;
  unitPrice: number;
  sku?: string;
  description?: string;
  brand?: string;
  unit?: string;
  stockThreshold?: number;
  salePrice?: number;
  barcode?: string;
}

interface RowError {
  row: number;
  message: string;
}

const EXPECTED_COLUMNS = [
  'nombre',
  'precio',
  'sku',
  'descripcion',
  'marca',
  'unidad',
  'umbral_stock',
  'precio_venta',
  'codigo_barras',
];

const CSV_TEMPLATE = `nombre,precio,sku,descripcion,marca,unidad,umbral_stock,precio_venta,codigo_barras
"Producto Ejemplo",99.99,,"Descripcion del producto","MarcaX","unid",10,119.99,7501234567890`;

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla_productos.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function CsvImportModal({ isOpen, onClose }: CsvImportModalProps) {
  const [step, setStep] = useState<'select' | 'preview'>('select');
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [parseErrors, setParseErrors] = useState<RowError[]>([]);
  const [fileName, setFileName] = useState('');
  const [importResult, setImportResult] = useState<{ created: number; errors: RowError[] } | null>(null);

  const importMutation = useImportProducts();

  const resetState = useCallback(() => {
    setStep('select');
    setParsedProducts([]);
    setParseErrors([]);
    setFileName('');
    setImportResult(null);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const errors: RowError[] = [];
        const products: ParsedProduct[] = [];

        // Check if required columns exist
        const headers = results.meta.fields || [];
        if (!headers.includes('nombre')) {
          setParseErrors([{ row: 0, message: 'El archivo no contiene la columna "nombre" (requerida)' }]);
          setParsedProducts([]);
          setStep('preview');
          return;
        }
        if (!headers.includes('precio')) {
          setParseErrors([{ row: 0, message: 'El archivo no contiene la columna "precio" (requerida)' }]);
          setParsedProducts([]);
          setStep('preview');
          return;
        }

        results.data.forEach((row, i) => {
          const rowNum = i + 1;

          const name = row.nombre?.trim();
          if (!name) {
            errors.push({ row: rowNum, message: 'El nombre es requerido' });
            return;
          }

          const priceStr = row.precio?.trim();
          const unitPrice = parseFloat(priceStr || '');
          if (isNaN(unitPrice) || unitPrice < 0) {
            errors.push({ row: rowNum, message: 'El precio debe ser un numero valido >= 0' });
            return;
          }

          const product: ParsedProduct = { name, unitPrice };

          if (row.sku?.trim()) product.sku = row.sku.trim();
          if (row.descripcion?.trim()) product.description = row.descripcion.trim();
          if (row.marca?.trim()) product.brand = row.marca.trim();
          if (row.unidad?.trim()) product.unit = row.unidad.trim();
          if (row.codigo_barras?.trim()) product.barcode = row.codigo_barras.trim();

          if (row.umbral_stock?.trim()) {
            const threshold = parseInt(row.umbral_stock.trim());
            if (!isNaN(threshold) && threshold >= 1) {
              product.stockThreshold = threshold;
            } else {
              errors.push({ row: rowNum, message: 'umbral_stock debe ser un entero >= 1' });
              return;
            }
          }

          if (row.precio_venta?.trim()) {
            const salePrice = parseFloat(row.precio_venta.trim());
            if (!isNaN(salePrice) && salePrice >= 0) {
              product.salePrice = salePrice;
            } else {
              errors.push({ row: rowNum, message: 'precio_venta debe ser un numero >= 0' });
              return;
            }
          }

          products.push(product);
        });

        setParsedProducts(products);
        setParseErrors(errors);
        setStep('preview');
      },
      error: () => {
        setParseErrors([{ row: 0, message: 'Error al leer el archivo CSV' }]);
        setStep('preview');
      },
    });

    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const handleImport = async () => {
    try {
      const result = await importMutation.mutateAsync(parsedProducts);
      setImportResult(result);
    } catch {
      setImportResult({ created: 0, errors: [{ row: 0, message: 'Error al importar productos' }] });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar Productos desde CSV" size="xl">
      {step === 'select' && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center">
            <Upload className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--fg)] font-medium mb-1">
              Selecciona un archivo CSV
            </p>
            <p className="text-xs text-[var(--muted)] mb-4">
              El archivo debe incluir las columnas: <strong>nombre</strong> y <strong>precio</strong> (requeridas)
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity text-sm font-medium">
              <FileText className="w-4 h-4" />
              Seleccionar archivo
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <p className="text-sm font-medium text-[var(--fg)] mb-2">Columnas del CSV</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-[var(--muted)]">
              {EXPECTED_COLUMNS.map((col) => (
                <span key={col}>
                  {col === 'nombre' || col === 'precio' ? (
                    <strong className="text-[var(--fg)]">{col} *</strong>
                  ) : (
                    col
                  )}
                </span>
              ))}
            </div>
            <button
              onClick={downloadTemplate}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar plantilla CSV
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && !importResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-sm text-[var(--fg)] font-medium">{fileName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={resetState}>
              Cambiar archivo
            </Button>
          </div>

          {/* Summary */}
          <div className="flex gap-3">
            <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-[var(--fg)]">{parsedProducts.length}</p>
              <p className="text-xs text-[var(--muted)]">Productos validos</p>
            </div>
            {parseErrors.length > 0 && (
              <div className="flex-1 bg-[var(--surface)] border border-[var(--status-critical)]/20 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-[var(--status-critical)]">{parseErrors.length}</p>
                <p className="text-xs text-[var(--muted)]">Errores</p>
              </div>
            )}
          </div>

          {/* Errors */}
          {parseErrors.length > 0 && (
            <div className="bg-[var(--status-critical)]/5 border border-[var(--status-critical)]/20 rounded-lg p-3 max-h-32 overflow-y-auto">
              {parseErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[var(--status-critical)] py-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{err.row > 0 ? `Fila ${err.row}: ` : ''}{err.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Preview table */}
          {parsedProducts.length > 0 && (
            <div className="border border-[var(--border)] rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[var(--surface)] sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">#</th>
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">Nombre</th>
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">SKU</th>
                      <th className="text-right px-3 py-2 text-[var(--muted)] font-medium">Precio</th>
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">Marca</th>
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">Unidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {parsedProducts.slice(0, 50).map((p, i) => (
                      <tr key={i} className="hover:bg-[var(--surface)]">
                        <td className="px-3 py-1.5 text-[var(--muted)]">{i + 1}</td>
                        <td className="px-3 py-1.5 text-[var(--fg)]">{p.name}</td>
                        <td className="px-3 py-1.5 text-[var(--muted)]">{p.sku || 'Auto'}</td>
                        <td className="px-3 py-1.5 text-[var(--fg)] text-right tabular-nums">${p.unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-1.5 text-[var(--muted)]">{p.brand || '-'}</td>
                        <td className="px-3 py-1.5 text-[var(--muted)]">{p.unit || 'unid'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedProducts.length > 50 && (
                <div className="px-3 py-2 bg-[var(--surface)] text-xs text-[var(--muted)] text-center border-t border-[var(--border)]">
                  Mostrando 50 de {parsedProducts.length} productos
                </div>
              )}
            </div>
          )}

          <ModalFooter className="-mx-6 -mb-6 mt-6">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              isLoading={importMutation.isPending}
              disabled={parsedProducts.length === 0}
            >
              Importar {parsedProducts.length} producto{parsedProducts.length !== 1 ? 's' : ''}
            </Button>
          </ModalFooter>
        </div>
      )}

      {step === 'preview' && importResult && (
        <div className="space-y-4">
          {/* Success summary */}
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-[var(--status-ok)] mx-auto mb-3" />
            <p className="text-lg font-bold text-[var(--fg)]">
              {importResult.created} producto{importResult.created !== 1 ? 's' : ''} importado{importResult.created !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Server-side errors */}
          {importResult.errors.length > 0 && (
            <div className="bg-[var(--status-critical)]/5 border border-[var(--status-critical)]/20 rounded-lg p-3 max-h-40 overflow-y-auto">
              <p className="text-xs font-medium text-[var(--status-critical)] mb-1">
                {importResult.errors.length} error{importResult.errors.length !== 1 ? 'es' : ''}:
              </p>
              {importResult.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[var(--status-critical)] py-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{err.row > 0 ? `Fila ${err.row}: ` : ''}{err.message}</span>
                </div>
              ))}
            </div>
          )}

          <ModalFooter className="-mx-6 -mb-6 mt-6">
            <Button onClick={handleClose}>Cerrar</Button>
          </ModalFooter>
        </div>
      )}
    </Modal>
  );
}
