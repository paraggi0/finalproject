// Machine Status JavaScript - PT. Topline Evergreen Manufacturing
// Real-time data fetching from database - No caching
let machineData = [];
let filteredData = [];
let editingRow = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Machine Status page loaded');
    loadInitialData();
    // Auto refresh setiap 30 detik untuk live data
    setInterval(loadMachineData, 30000);
});

// Load initial data
async function loadInitialData() {
    try {
        await loadMachineData();
    } catch (error) {
        console.error('Error loading initial data:', error);
        showMessage('Error loading data. Please refresh the page.', 'error');
    }
}

// Load machine status data from backend - Always fresh from database
async function loadMachineData() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost:3001/api/website/machine-status?_t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const result = await response.json();
        
        if (result.success) {
            machineData = result.data;
            filteredData = [...machineData];
            loadTableData();
            console.log('✅ Fresh machine status data loaded from database:', machineData);
            updateStatusIndicator('connected');
        } else {
            console.error('Failed to load machine data:', result.message);
            showMessage('Failed to load machine data: ' + result.message, 'error');
            updateStatusIndicator('error');
        }
    } catch (error) {
        console.error('Error loading machine data:', error);
        showMessage('Error loading machine data. Please check connection.', 'error');
        updateStatusIndicator('disconnected');
    }
}

function loadTableData() {
    const tableBody = document.getElementById('machineTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Add "Add New" row at the top
    const addRow = document.createElement('tr');
    addRow.id = 'addRow';
    addRow.className = 'add-row';
    addRow.innerHTML = `
        <td><input type="text" id="newMachineId" placeholder="Machine ID" class="table-input"></td>
        <td>
            <select id="newStatus" class="table-input">
                <option value="">Select Status</option>
                <option value="Running">🟢 Running</option>
                <option value="Idle">🟡 Idle</option>
                <option value="Maintenance">🔧 Maintenance</option>
                <option value="Down">🔴 Down</option>
            </select>
        </td>
        <td><input type="number" id="newTarget" placeholder="Target %" class="table-input" min="0" max="100"></td>
        <td><input type="number" id="newActual" placeholder="Actual %" class="table-input" min="0" max="100"></td>
        <td><span id="newEfficiency" class="efficiency-display">-</span></td>
        <td><input type="number" id="newOutput" placeholder="Output" class="table-input" min="0"></td>
        <td><input type="text" id="newOperator" placeholder="Operator" class="table-input"></td>
        <td><span class="timestamp">Now</span></td>
        <td>
            <button onclick="saveNewMachine()" class="btn-save">Save</button>
            <button onclick="clearNewRow()" class="btn-cancel">Clear</button>
        </td>
    `;
    tableBody.appendChild(addRow);

    // Add event listeners for efficiency calculation
    document.getElementById('newTarget').addEventListener('input', calculateNewEfficiency);
    document.getElementById('newActual').addEventListener('input', calculateNewEfficiency);

    // Add existing data rows
    filteredData.forEach((machine, index) => {
        const row = document.createElement('tr');
        const efficiency = machine.target > 0 ? ((machine.actual / machine.target) * 100).toFixed(1) : 0;
        const statusIcon = getStatusIcon(machine.status);
        const efficiencyClass = getEfficiencyClass(efficiency);
        
        row.innerHTML = `
            <td><strong>${machine.machine_id}</strong></td>
            <td><span class="status-badge status-${machine.status.toLowerCase()}">${statusIcon} ${machine.status}</span></td>
            <td class="text-center">${machine.target}%</td>
            <td class="text-center">${machine.actual}%</td>
            <td class="text-center"><span class="efficiency-badge ${efficiencyClass}">${efficiency}%</span></td>
            <td class="text-center">${machine.output_today || 0}</td>
            <td>${machine.operator || '-'}</td>
            <td class="text-small">${formatTimestamp(machine.last_update)}</td>
            <td>
                <button onclick="editMachine(${machine.id})" class="btn-edit">Edit</button>
                <button onclick="deleteMachine(${machine.id})" class="btn-delete">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function getStatusIcon(status) {
    const icons = {
        'Running': '🟢',
        'Idle': '🟡',
        'Maintenance': '🔧',
        'Down': '🔴'
    };
    return icons[status] || '⚪';
}

function getEfficiencyClass(efficiency) {
    if (efficiency >= 90) return 'high';
    if (efficiency >= 70) return 'medium';
    return 'low';
}

function calculateNewEfficiency() {
    const target = parseFloat(document.getElementById('newTarget').value) || 0;
    const actual = parseFloat(document.getElementById('newActual').value) || 0;
    const efficiency = target > 0 ? ((actual / target) * 100).toFixed(1) : 0;
    document.getElementById('newEfficiency').textContent = efficiency + '%';
    document.getElementById('newEfficiency').className = `efficiency-display ${getEfficiencyClass(efficiency)}`;
}

async function saveNewMachine() {
    const machine_id = document.getElementById('newMachineId').value.trim();
    const status = document.getElementById('newStatus').value;
    const target = parseFloat(document.getElementById('newTarget').value) || 0;
    const actual = parseFloat(document.getElementById('newActual').value) || 0;
    const output_today = parseInt(document.getElementById('newOutput').value) || 0;
    const operator = document.getElementById('newOperator').value.trim();

    if (!machine_id || !status) {
        showMessage('Machine ID and Status are required', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/website/machine-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                machine_id,
                status,
                target,
                actual,
                output_today,
                operator
            })
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Machine status added successfully!', 'success');
            clearNewRow();
            loadMachineData(); // Reload data from server
        } else {
            showMessage('Failed to add machine: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error adding machine:', error);
        showMessage('Error adding machine. Please try again.', 'error');
    }
}

function clearNewRow() {
    document.getElementById('newMachineId').value = '';
    document.getElementById('newStatus').value = '';
    document.getElementById('newTarget').value = '';
    document.getElementById('newActual').value = '';
    document.getElementById('newOutput').value = '';
    document.getElementById('newOperator').value = '';
    document.getElementById('newEfficiency').textContent = '-';
    document.getElementById('newEfficiency').className = 'efficiency-display';
}

async function editMachine(id) {
    // Implementation for editing machine status
    const machine = machineData.find(m => m.id === id);
    if (!machine) return;

    const newStatus = prompt(`Update status for ${machine.machine_id}:`, machine.status);
    if (newStatus && newStatus !== machine.status) {
        try {
            const response = await fetch(`http://localhost:3001/api/website/machine-status/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();
            if (result.success) {
                showMessage('Machine status updated successfully!', 'success');
                loadMachineData();
            } else {
                showMessage('Failed to update machine: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating machine:', error);
            showMessage('Error updating machine. Please try again.', 'error');
        }
    }
}

async function deleteMachine(id) {
    const machine = machineData.find(m => m.id === id);
    if (!machine || !confirm(`Delete machine ${machine.machine_id}?`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/website/machine-status/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            showMessage('Machine deleted successfully!', 'success');
            loadMachineData();
        } else {
            showMessage('Failed to delete machine: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting machine:', error);
        showMessage('Error deleting machine. Please try again.', 'error');
    }
}

function searchData() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();

    filteredData = machineData.filter(machine => 
        machine.machine_id.toLowerCase().includes(searchTerm) ||
        machine.status.toLowerCase().includes(searchTerm) ||
        (machine.operator && machine.operator.toLowerCase().includes(searchTerm))
    );

    loadTableData();
}

function addNew() {
    document.getElementById('newMachineId').focus();
}

function exportCSV() {
    try {
        if (!filteredData || filteredData.length === 0) {
            showMessage('No data available to export', 'warning');
            return;
        }

        const headers = ['Machine ID', 'Status', 'Target %', 'Actual %', 'Efficiency %', 'Output Today', 'Operator', 'Last Update'];
        
        // Create CSV content with BOM for Excel compatibility
        let csvContent = '\uFEFF' + headers.join(',') + '\r\n';
        
        filteredData.forEach(machine => {
            const efficiency = machine.target > 0 ? ((machine.actual / machine.target) * 100).toFixed(1) : 0;
            const row = [
                `"${machine.machine_id || ''}"`,
                `"${machine.status || ''}"`,
                `"${machine.target || 0}"`,
                `"${machine.actual || 0}"`,
                `"${efficiency}%"`,
                `"${machine.output_today || 0}"`,
                `"${machine.operator || ''}"`,
                `"${formatTimestamp(machine.last_update)}"`
            ];
            csvContent += row.join(',') + '\r\n';
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `machine_status_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showMessage('CSV exported successfully!', 'success');
    } catch (error) {
        console.error('Export CSV error:', error);
        showMessage('Error exporting CSV: ' + error.message, 'error');
    }
}

function formatTimestamp(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID');
}

function updateStatusIndicator(status) {
    const statusDot = document.querySelector('.status-dot');
    if (statusDot) {
        statusDot.className = 'status-dot';
        switch(status) {
            case 'connected':
                statusDot.style.backgroundColor = '#10b981';
                break;
            case 'disconnected':
                statusDot.style.backgroundColor = '#f59e0b';
                break;
            case 'error':
                statusDot.style.backgroundColor = '#ef4444';
                break;
        }
    }
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    let backgroundColor;
    let textColor = 'white';
    
    switch(type) {
        case 'success':
            backgroundColor = '#10b981';
            break;
        case 'error':
            backgroundColor = '#ef4444';
            break;
        case 'warning':
            backgroundColor = '#f59e0b';
            textColor = '#000';
            break;
        default:
            backgroundColor = '#3b82f6';
    }
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${backgroundColor};
        color: ${textColor};
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-weight: 500;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}