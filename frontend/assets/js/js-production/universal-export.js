// Universal Export Utility for Production Module - PT. Topline Evergreen Manufacturing

/**
 * Enhanced CSV Export utility with improved error handling and Excel compatibility
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header names
 * @param {string} filename - Base filename for the export
 * @param {Function} showMessage - Message display function
 */
function exportToCSV(data, headers, filename, showMessage) {
    try {
        if (!data || data.length === 0) {
            if (showMessage) showMessage('No data available to export', 'warning');
            return false;
        }

        if (!headers || headers.length === 0) {
            if (showMessage) showMessage('No headers defined for export', 'error');
            return false;
        }

        // Create CSV content with BOM for Excel compatibility
        let csvContent = '\uFEFF'; // BOM for UTF-8
        
        // Add headers
        csvContent += headers.join(',') + '\r\n';
        
        // Add data rows
        data.forEach(row => {
            const csvRow = headers.map(header => {
                let cellValue = '';
                
                // Handle nested properties (e.g., 'customer.name')
                if (header.includes('.')) {
                    const keys = header.split('.');
                    let value = row;
                    for (let key of keys) {
                        value = value ? value[key] : '';
                    }
                    cellValue = value || '';
                } else {
                    cellValue = row[header] || '';
                }
                
                // Convert to string and escape special characters
                cellValue = String(cellValue).trim();
                
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
                if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n') || cellValue.includes('\r')) {
                    cellValue = '"' + cellValue.replace(/"/g, '""') + '"';
                }
                
                return cellValue;
            });
            
            csvContent += csvRow.join(',') + '\r\n';
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(url);
        
        if (showMessage) showMessage('CSV exported successfully!', 'success');
        return true;
        
    } catch (error) {
        console.error('Export CSV error:', error);
        if (showMessage) showMessage('Error exporting CSV: ' + error.message, 'error');
        return false;
    }
}

/**
 * Export table directly from DOM element
 * @param {string} tableId - ID of the table element
 * @param {string} filename - Base filename for the export
 * @param {Function} showMessage - Message display function
 * @param {boolean} skipLastColumn - Skip last column (usually actions)
 */
function exportTableToCSV(tableId, filename, showMessage, skipLastColumn = true) {
    try {
        const table = document.getElementById(tableId);
        if (!table) {
            if (showMessage) showMessage('Table not found!', 'error');
            return false;
        }
        
        const rows = table.querySelectorAll('tr');
        if (rows.length === 0) {
            if (showMessage) showMessage('No data in table to export', 'warning');
            return false;
        }
        
        let csvContent = '\uFEFF'; // BOM for Excel compatibility
        
        rows.forEach((row, rowIndex) => {
            const cols = row.querySelectorAll('th, td');
            const rowData = [];
            
            cols.forEach((col, colIndex) => {
                // Skip actions column if specified (usually the last column)
                if (skipLastColumn && colIndex === cols.length - 1) {
                    return;
                }
                
                let cellText = col.textContent.trim();
                
                // Clean up the text
                cellText = cellText.replace(/\s+/g, ' '); // Replace multiple spaces with single space
                
                // Escape quotes and wrap in quotes if contains comma or quote
                if (cellText.includes(',') || cellText.includes('"') || cellText.includes('\n')) {
                    cellText = '"' + cellText.replace(/"/g, '""') + '"';
                }
                
                rowData.push(cellText);
            });
            
            csvContent += rowData.join(',') + '\r\n';
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        if (showMessage) showMessage('CSV exported successfully!', 'success');
        return true;
        
    } catch (error) {
        console.error('Export table CSV error:', error);
        if (showMessage) showMessage('Error exporting CSV: ' + error.message, 'error');
        return false;
    }
}

/**
 * Show progress indicator for large exports
 * @param {string} message - Progress message
 */
function showExportProgress(message) {
    const progressDiv = document.createElement('div');
    progressDiv.id = 'exportProgress';
    progressDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    progressDiv.innerHTML = `
        <div style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>${message}</span>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(progressDiv);
    
    return {
        update: (newMessage) => {
            const span = progressDiv.querySelector('span');
            if (span) span.textContent = newMessage;
        },
        remove: () => {
            if (progressDiv.parentElement) {
                progressDiv.remove();
            }
        }
    };
}

// Export functions to global scope
window.exportToCSV = exportToCSV;
window.exportTableToCSV = exportTableToCSV;
window.showExportProgress = showExportProgress;
