'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { useImportCustomers, type BulkCustomerRow } from '../hooks/use-customers';
import { Upload, FileText, AlertCircle, CheckCircle2, Download } from 'lucide-react';

interface CustomerCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CsvRow {
  codigo?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  documento?: string;
}

interface RowError {
  row: number;
  message: string;
}

const EXPECTED_COLUMNS = ['nombre', 'codigo', 'email', 'telefono', 'direccion', 'documento'];

const CSV_TEMPLATE = `nombre,codigo,email,telefono,direccion,documento
"Cliente Ejemplo",,"cliente@correo.com","3001234567","Calle 1 #2-3","900123456-7"`;

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla_clientes.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function CustomerCsvImportModal({ isOpen, onClose }: CustomerCsvImportModalProps) {
  const [step, setStep] = useState<'select' | 'preview'>('select');
  const [parsedRows, setParsedRows] = useState<BulkCustomerRow[]>([]);
  const [parseErrors, setParseErrors] = useState<RowError[]>([]);
  const [fileName, setFileName] = useState('');
  const [importResult, setImportResult] = useState<{ created: number; errors: RowError[] } | null>(null);

  const importMutation = useImportCustomers();

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
        const rows: BulkCustomerRow[] = [];

        const headers = results.meta.fields || [];
        if (!headers.includes('nombre')) {
          setParseErrors([{ row: 0, message: 'El archivo no contiene la columna "nombre" (requerida)' }]);
          setParsedRows([]);
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

          const parsed: BulkCustomerRow = { name };
          if (row.codigo?.trim()) parsed.code = row.codigo.trim();
          if (row.email?.trim()) parsed.email = row.email.trim();
          if (row.telefono?.trim()) parsed.phone = row.telefono.trim();
          if (row.direccion?.trim()) parsed.address = row.direccion.trim();
          if (row.documento?.trim()) parsed.taxId = row.documento.trim();

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
      setImportResult({ created: 0, errors: [{ row: 0, message: 'Error al importar clientes' }] });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar Clientes desde CSV" size="xl">
      {step === 'select' && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center">
            <Upload className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--fg)] font-medium mb-1">Selecciona un archivo CSV</p>
            <p className="text-xs text-[var(--muted)] mb-4">
              La columna <strong>nombre</strong> es requerida. Si no indicas <strong>codigo</strong>, se genera automaticamente.
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
                  {col === 'nombre' ? <strong className="text-[var(--fg)]">{col} *</strong> : col}
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

          <div className="flex gap-3">
            <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-[var(--fg)]">{parsedRows.length}</p>
              <p className="text-xs text-[var(--muted)]">Clientes validos</p>
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
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">Nombre</th>
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">Codigo</th>
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">Email</th>
                      <th className="text-left px-3 py-2 text-[var(--muted)] font-medium">Telefono</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {parsedRows.slice(0, 50).map((r, i) => (
                      <tr key={i} className="hover:bg-[var(--surface)]">
                        <td className="px-3 py-1.5 text-[var(--muted)]">{i + 1}</td>
                        <td className="px-3 py-1.5 text-[var(--fg)]">{r.name}</td>
                        <td className="px-3 py-1.5 text-[var(--muted)] font-mono">{r.code || 'Auto'}</td>
                        <td className="px-3 py-1.5 text-[var(--muted)]">{r.email || '-'}</td>
                        <td className="px-3 py-1.5 text-[var(--muted)]">{r.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 50 && (
                <div className="px-3 py-2 bg-[var(--surface)] text-xs text-[var(--muted)] text-center border-t border-[var(--border)]">
                  Mostrando 50 de {parsedRows.length} clientes
                </div>
              )}
            </div>
          )}

          <ModalFooter className="-mx-6 -mb-6 mt-6">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleImport} isLoading={importMutation.isPending} disabled={parsedRows.length === 0}>
              Importar {parsedRows.length} cliente{parsedRows.length !== 1 ? 's' : ''}
            </Button>
          </ModalFooter>
        </div>
      )}

      {step === 'preview' && importResult && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-[var(--status-ok)] mx-auto mb-3" />
            <p className="text-lg font-bold text-[var(--fg)]">
              {importResult.created} cliente{importResult.created !== 1 ? 's' : ''} importado{importResult.created !== 1 ? 's' : ''}
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
