export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Convert array of objects to CSV string
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(fieldName => {
        let cell = row[fieldName] === null || row[fieldName] === undefined ? '' : row[fieldName];
        // Handle strings that might contain commas
        if (typeof cell === 'string') {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    )
  ].join('\n');

  // Create a blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
