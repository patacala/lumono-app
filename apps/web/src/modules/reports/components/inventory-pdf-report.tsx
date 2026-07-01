'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { InventorySummaryProduct } from '../hooks/use-reports';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
    color: '#666',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4472C4',
    color: '#fff',
    padding: 6,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 6,
  },
  tableRowLow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 6,
    backgroundColor: '#FEE2E2',
  },
  col1: { width: '15%' },
  col2: { width: '30%' },
  col3: { width: '10%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  col6: { width: '15%' },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

interface InventoryPdfReportProps {
  products: InventorySummaryProduct[];
  totalProducts: number;
  lowStockCount: number;
  totalStockValue: number;
}

export function InventoryPdfReport({
  products,
  totalProducts,
  lowStockCount,
  totalStockValue,
}: InventoryPdfReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Inventory Stock Report</Text>
        <Text style={styles.subtitle}>
          Generated on {new Date().toLocaleDateString()} at{' '}
          {new Date().toLocaleTimeString()}
        </Text>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Total Products: {totalProducts}
          </Text>
          <Text style={styles.summaryText}>
            Low Stock Products: {lowStockCount}
          </Text>
          <Text style={styles.summaryText}>
            Total Stock Value: ${totalStockValue.toLocaleString()}
          </Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>SKU</Text>
            <Text style={styles.col2}>Product</Text>
            <Text style={styles.col3}>Unit</Text>
            <Text style={styles.col4}>Stock</Text>
            <Text style={styles.col5}>Threshold</Text>
            <Text style={styles.col6}>Value</Text>
          </View>

          {products.map((product) => (
            <View
              key={product.id}
              style={product.isLowStock ? styles.tableRowLow : styles.tableRow}
            >
              <Text style={styles.col1}>{product.sku}</Text>
              <Text style={styles.col2}>{product.name}</Text>
              <Text style={styles.col3}>{product.unit}</Text>
              <Text style={styles.col4}>{product.totalStock}</Text>
              <Text style={styles.col5}>{product.stockThreshold}</Text>
              <Text style={styles.col6}>
                ${product.stockValue.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
