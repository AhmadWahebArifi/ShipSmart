import * as XLSX from 'xlsx';

export const exportShipmentsToExcel = (shipments, t) => {
  // Prepare data for Excel
  const excelData = shipments.map(shipment => ({
    [t('shipments.table.trackingNumber')]: shipment.tracking_number,
    [t('shipments.table.from')]: shipment.from_province,
    [t('shipments.table.to')]: shipment.to_province,
    [t('shipments.table.status')]: t(`shipments.status.${shipment.status}`) || shipment.status,
    [t('shipments.table.created')]: new Date(shipment.created_at).toLocaleDateString(),
    [t('shipments.table.expectedDeparture')]: shipment.expected_departure_date 
      ? new Date(shipment.expected_departure_date).toLocaleDateString() 
      : '-',
    [t('shipments.table.expectedArrival')]: shipment.expected_arrival_date 
      ? new Date(shipment.expected_arrival_date).toLocaleDateString() 
      : '-',
    [t('shipments.table.vehicle')]: shipment.vehicle ? shipment.vehicle.vehicle_id : '-',
    'Route Info': shipment.route_info || '-',
    'Route Hops': shipment.route_hops || 0,
    'Updated At': new Date(shipment.updated_at).toLocaleDateString()
  }));

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Shipments');

  // Auto-size columns
  const colWidths = [];
  const headers = Object.keys(excelData[0] || {});
  headers.forEach((header, index) => {
    const maxContentLength = Math.max(
      header.length,
      ...excelData.map(row => String(row[header] || '').length)
    );
    colWidths[index] = { wch: Math.min(maxContentLength + 2, 50) }; // Max width of 50
  });
  ws['!cols'] = colWidths;

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `Shipments_${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
};

export const exportProductsToExcel = (products, t) => {
  // Prepare data for Excel
  const excelData = products.map(product => ({
    'ID': product.id,
    [t('products.table.name')]: product.name,
    [t('products.table.description')]: product.description || '-',
    [t('products.table.quantity')]: product.quantity || 1,
    [t('products.table.weight')]: product.weight ? parseFloat(product.weight).toFixed(2) + ' kg' : '-',
    [t('products.table.price')]: product.price ? parseFloat(product.price).toFixed(2) + ' AFN' : '-',
    [t('products.form.discount')]: product.discount ? parseFloat(product.discount).toFixed(2) + '%' : '-',
    [t('products.form.remaining')]: product.remaining ? parseFloat(product.remaining).toFixed(2) + ' AFN' : '-',
    [t('products.form.sender')]: product.sender || '-',
    [t('products.form.senderPhone')]: product.sender_phone || '-',
    [t('products.form.senderEmail')]: product.sender_email || '-',
    [t('products.form.senderAddress')]: product.sender_address || '-',
    [t('products.receiverName')]: product.receiver_name || '-',
    [t('products.receiverPhone')]: product.receiver_phone || '-',
    [t('products.receiverEmail')]: product.receiver_email || '-',
    [t('products.receiverAddress')]: product.receiver_address || '-',
    [t('shipments.trackingNumber')]: product.shipment_tracking_number || '-',
    [t('shipments.table.status')]: product.shipment ? t(`shipments.status.${product.shipment.status}`) || product.shipment.status : '-',
    'Created At': new Date(product.created_at).toLocaleDateString(),
    'Updated At': new Date(product.updated_at).toLocaleDateString()
  }));

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  // Auto-size columns
  const colWidths = [];
  const headers = Object.keys(excelData[0] || {});
  headers.forEach((header, index) => {
    const maxContentLength = Math.max(
      header.length,
      ...excelData.map(row => String(row[header] || '').length)
    );
    colWidths[index] = { wch: Math.min(maxContentLength + 2, 50) }; // Max width of 50
  });
  ws['!cols'] = colWidths;

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `Products_${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
};
