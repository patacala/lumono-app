'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { useImportMovements, type BulkMovementRow } from '../hooks/use-inventory';
import { Upload, FileText, AlertCircle, CheckCircle2, Download } from 'lucide-react';

interface MovementCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CsvRow {
  sku?: string;
  ubicacion?: string;
  cantidad?: string;
  tipo?: string;
  razon?: string;
  notas?: string;
}

interface RowError {
  row: number;
  message: string;
}

const EXPECTED_COLUMNS = ['sku', 'ubicacion', 'cantidad', 'tipo', 'razon', 'notas'];

const CSV_TEMPLATE = `sku,ubicacion,cantidad,tipo,razon,notas
"PROD-00001","Bodega Principal",112,ajuste,"Carga Inicial",
"PROD-00002","Bodega Principal",48,entrada,,`;

// Maps friendly Spanish values from the CSV to the API enum values
const TYPE_MAP: Record<string, 'ADJUSTMENT' | 'IN'> = {
  ajuste: 'ADJUSTMENT',
  'ajuste+': 'ADJUSTMENT',
  'ajuste positivo': 'ADJUSTMENT',
  entrada: 'IN',
  compra: 'IN',
  in: 'IN',
};

const REASON_MAP: Record<string, BulkMovementRow['reason']> = {
  'carga inicial': 'INITIAL_LOAD',
  'conteo fisico': 'PHYSICAL_COUNT',
  correccion: 'CORRECTION',
  expiracion: 'EXPIRATION',
  otro: 'OTHER',
};

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla_carga_inventario.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function MovementCsvImportModal({ isOpen, onClose }: MovementCsvImportModalProps) {
  const [step, setStep] = useState<'select' | 'preview'>('select');
  const [parsedRows, setParsedRows] = useState<BulkMovementRow[]>([]);
  const [parseErrors, setParseErrors] = useState<RowError[]>([]);
  const [fileName, setFileName] = useState('');
  const [importResult, setImportResult] = useState<{ created: number; errors: RowError[] } | null>(null);

  const importMutation = useImportMovements();

  const resetState = useCallback(() => {
    setStep('select');
    setParsedRows([]);
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
        const rows: BulkMovementRow[] = [];

        const headers = results.meta.fields || [];
        for (const required of ['sku', 'ubicacion', 'cantidad']) {
          if (!headers.includes(required)) {
            setParseErrors([{ row: 0, message: `El archivo no contiene la columna "${required}" (requerida)` }]);
            setParsedRows([]);
            setStep('preview');
            return;
          }
        }

        results.data.forEach((row, i) => {
          const rowNum = i + 1;

          const sku = row.sku?.trim();
          if (!sku) {
            errors.push({ row: rowNum, message: 'El SKU es requerido' });
            return;
          }

          const locationName = row.ubicacion?.trim();
          if (!locationName) {
            errors.push({ row: rowNum, message: 'La ubicacion es requerida' });
            return;
          }

          const quantity = parseInt(row.cantidad?.trim() || '', 10);
          if (isNaN(quantity) || quantity <= 0) {
            errors.push({ row: rowNum, message: 'La cantidad debe ser un entero mayor a 0' });
            return;
          }

          const typeRaw = row.tipo?.trim().toLowerCase();
          let type: 'ADJUSTMENT' | 'IN' = 'ADJUSTMENT';
          if (typeRaw) {
            const mapped = TYPE_MAP[typeRaw];
            if (!mapped) {
              errors.push({ row: rowNum, message: `Tipo "${row.tipo}" no valido (usa "ajuste" o "entrada")` });
              return;
            }
            type = mapped;
          }

          const parsed: BulkMovementRow = { sku, locationName, quantity, type };

          const reasonRaw = row.razon?.trim().toLowerCase();
          if (reasonRaw) parsed.reason = REASON_MAP[reasonRaw] || 'INITIAL_LOAD';
          if (row.notas?.trim()) parsed.notes = row.notas.trim();

          rows.push(parsed);
        });

        setParsedRows(rows);
        setParseErrors(errors);
        setStep('preview');
      },
      error: () => {
        setParseErrors([{ row: 0, message: 'Error al leer el archivo CSV' }]);
        setStep('preview');
      },
    });

    e.target.value = '';
  };

  const handleImport = async () => {
    try {
      const result = await importMutation.mutateAsync(parsedRows);
      setImportResult(result);
    } catch {
      setImportResult({ created: 0, errors: [{ row: 0, message: 'Error al importar movimientos' }] });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Carga masiva de inventario (CSV)" size="xl">
      {step === 'select' && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center">
            <Upload className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--fg)] font-medium mb-1">Selecciona un archivo CSV</p>
            <p className="text-xs text-[var(--muted)] mb-4">
              Columnas requeridas: <strong>sku</strong>, <strong>ubicacion</strong>, <strong>cantidad</strong>. El producto (por SKU) y la ubicacion (por nombre) deben existir.
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity text-sm font-medium">
              <FileText className="w-4 h-4" />
              Seleccionar archivo
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <p className="text-sm font-medium text-[var(--fg)] mb-2">Columnas del CSV</p>
            <div className="grid grid-cols-3 gap-1 text-xs text-[var(--muted)]">
              {EXPECTED_COLUMNS.map((col) => (
                <span key={col}>
                  {['sku', 'ubicacion', 'cantidad'].includes(col) ? (
                    <strong className="text-[var(--fg)]">{col} *</strong>
                  ) : (
                    col
                  )}
                </span>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)] mt-2">
              <strong>tipo</strong>: "ajuste" (ajuste positivo, por defecto) o "entrada". <strong>razon</strong> opcional (por defecto "Carga Inicial").
            </p>
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

          <div className="flex gap-3">
            <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-[var(--fg)]">{parsedRows.length}</p>
              <p className="text-xs text-[var(--muted)]">Movimientos validos</p>
            </div>
            {parseErrors.length > 0 && (
              <div className="flex-1 bg-[var(--surface)] border border-[var(--status-critical)]/20 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-[var(--status-critical)]">{parseErrors.length}</p>
                <p className="text-xs text-[var(--muted)]">Errores</p>
              </div>
            )}
          </div>

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

          {parsedRows.length > 0 && (
            <div className="border border-[var(--border)] rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[var(--surface)] sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">#</th>
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">SKU</th>
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">Ubicacion</th>
                      <th className="text-right px-3 py-2 text-[var(--muted)] font-medium">Cantidad</th>
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {parsedRows.slice(0, 50).map((r, i) => (
                      <tr key={i} className="hover:bg-[var(--surface)]">
                        <td className="px-3 py-1.5 text-[var(--muted)]">{i + 1}</td>
                        <td className="px-3 py-1.5 text-[var(--fg)] font-mono">{r.sku}</td>
                        <td className="px-3 py-1.5 text-[var(--fg)]">{r.locationName}</td>
                        <td className="px-3 py-1.5 text-[var(--fg)] text-right tabular-nums">{r.quantity}</td>
                        <td className="px-3 py-1.5 text-[var(--muted)]">{r.type === 'IN' ? 'Entrada' : 'Ajuste +'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 50 && (
                <div className="px-3 py-2 bg-[var(--surface)] text-xs text-[var(--muted)] text-center border-t border-[var(--border)]">
                  Mostrando 50 de {parsedRows.length} movimientos
                </div>
              )}
            </div>
          )}

          <ModalFooter className="-mx-6 -mb-6 mt-6">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleImport} isLoading={importMutation.isPending} disabled={parsedRows.length === 0}>
              Cargar {parsedRows.length} movimiento{parsedRows.length !== 1 ? 's' : ''}
            </Button>
          </ModalFooter>
        </div>
      )}

      {step === 'preview' && importResult && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-[var(--status-ok)] mx-auto mb-3" />
            <p className="text-lg font-bold text-[var(--fg)]">
              {importResult.created} movimiento{importResult.created !== 1 ? 's' : ''} registrado{importResult.created !== 1 ? 's' : ''}
            </p>
          </div>

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
