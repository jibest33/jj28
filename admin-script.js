// Admin Portal Script
let currentAdmin = null;
let allRequests = [];
let allUsers = [];
let currentSort = { key: null, direction: 'asc' };

// Mock database for demo purposes
const admins = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123',
        name: 'Barangay Secretary',
        role: 'secretary'
    }
];

// Load data from localStorage
function loadDataFromStorage() {
    allUsers = JSON.parse(localStorage.getItem('users')) || [
        {
            id: 1,
            firstName: 'Juan',
            lastName: 'Dela Cruz',
            email: 'juan@example.com',
            phone: '09123456789',
            nationalId: '123456789012',
            address: '123 Main Street, Barangay Sample, City',
            password: 'password123'
        }
    ];
    
    allRequests = JSON.parse(localStorage.getItem('requests')) || [
        {
            id: 'REQ001',
            userId: 1,
            purpose: 'employment',
            purposeDetails: 'For job application at ABC Company',
            status: 'pending',
            dateSubmitted: '2024-01-15',
            paymentStatus: 'paid',
            documents: ['valid_id.jpg'],
            paymentMethod: 'gcash',
            adminNotes: ''
        }
    ];
}

// Save data to localStorage
function saveDataToStorage() {
    localStorage.setItem('users', JSON.stringify(allUsers));
    localStorage.setItem('requests', JSON.stringify(allRequests));
}

document.addEventListener('DOMContentLoaded', function() {
    // Load data from localStorage
    loadDataFromStorage();
    
    // Check if admin is already logged in
    const savedAdmin = localStorage.getItem('currentAdmin');
    if (savedAdmin) {
        currentAdmin = JSON.parse(savedAdmin);
        showAdminDashboard();
    }

    // Form event listeners
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    document.getElementById('reportForm').addEventListener('submit', handleReportGeneration);
    // Show change credentials form button
    const showChangeCredentialsBtn = document.getElementById('showChangeCredentialsBtn');
    const changeCredentialsForm = document.getElementById('changeCredentialsForm');
    if (showChangeCredentialsBtn && changeCredentialsForm) {
        showChangeCredentialsBtn.addEventListener('click', function() {
            changeCredentialsForm.style.display = changeCredentialsForm.style.display === 'none' ? 'block' : 'none';
        });
        changeCredentialsForm.addEventListener('submit', handleChangeCredentials);
    }

    // Add event listeners for sorting after DOMContentLoaded
    if (typeof window !== 'undefined') {
        document.querySelectorAll('.sortable').forEach(th => {
            th.style.cursor = 'pointer';
            th.addEventListener('click', function() {
                const key = th.getAttribute('data-column');
                if (currentSort.key === key) {
                    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort.key = key;
                    currentSort.direction = 'asc';
                }
                loadAllRequests();
            });
        });
    }
});

function handleChangeCredentials(e) {
    e.preventDefault();
    const newUsername = document.getElementById('newAdminUsername').value.trim();
    const newPassword = document.getElementById('newAdminPassword').value.trim();
    if (!newUsername || !newPassword) {
        showMessage('Please enter both username and password', 'error');
        return;
    }
    // Update the first admin in the admins array
    admins[0].username = newUsername;
    admins[0].password = newPassword;
    // If the current admin is logged in, update their info as well
    if (currentAdmin) {
        currentAdmin.username = newUsername;
        currentAdmin.password = newPassword;
        localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
    }
    // Save to localStorage for persistence
    localStorage.setItem('adminUsername', newUsername);
    localStorage.setItem('adminPassword', newPassword);
    showMessage('Admin credentials updated successfully!', 'success');
    document.getElementById('changeCredentialsForm').reset();
    document.getElementById('changeCredentialsForm').style.display = 'none';
}

// Authentication functions
function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Check localStorage first
    const storedUsername = localStorage.getItem('adminUsername');
    const storedPassword = localStorage.getItem('adminPassword');
    let admin;
    if (storedUsername && storedPassword) {
        admin = admins.find(a => a.username === storedUsername && a.password === storedPassword && username === storedUsername && password === storedPassword);
    } else {
        admin = admins.find(a => a.username === username && a.password === password);
    }
    
    if (admin) {
        currentAdmin = admin;
        localStorage.setItem('currentAdmin', JSON.stringify(admin));
        showMessage('Login successful!', 'success');
        showAdminDashboard();
    } else {
        showMessage('Invalid username or password', 'error');
    }
}

function adminLogout() {
    currentAdmin = null;
    localStorage.removeItem('currentAdmin');
    showMessage('Logged out successfully', 'success');
    document.getElementById('login').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
}

// Dashboard functions
function showAdminDashboard() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    
    loadAdminData();
    loadAllRequests();
}

function loadAdminData() {
    if (currentAdmin) {
        document.getElementById('adminName').textContent = currentAdmin.name;
    }
}

function loadAllRequests() {
    // Reload data from localStorage to get latest updates
    loadDataFromStorage();
    
    // Update statistics
    const totalRequests = allRequests.length;
    const pendingRequests = allRequests.filter(req => req.status === 'pending').length;
    const approvedRequests = allRequests.filter(req => req.status === 'approved').length;
    const releasedRequests = allRequests.filter(req => req.status === 'released').length;
    
    document.getElementById('totalRequests').textContent = totalRequests;
    document.getElementById('pendingRequests').textContent = pendingRequests;
    document.getElementById('approvedRequests').textContent = approvedRequests;
    document.getElementById('releasedRequests').textContent = releasedRequests;
    
    // Sort requests if needed
    let requestsToShow = [...allRequests];
    if (currentSort.key) {
        requestsToShow.sort((a, b) => compareRequests(a, b, currentSort.key, currentSort.direction));
    }
    // Update requests table
    updateRequestsTable(requestsToShow);
}

function updateRequestsTable(requestsToShow) {
    const tableBody = document.getElementById('adminRequestsTable');
    tableBody.innerHTML = '';
    
    requestsToShow.forEach(request => {
        const user = allUsers.find(u => u.id === request.userId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.id}</td>
            <td>${user ? `${user.firstName} ${user.lastName}` : 'Unknown'}</td>
            <td>${user ? user.email : 'Unknown'}</td>
            <td>${getPurposeText(request.purpose)}</td>
            <td>${new Date(request.dateSubmitted).toLocaleDateString()}</td>
            <td><span class="status-badge status-${request.status}">${request.status.toUpperCase()}</span></td>
            <td>
                <button class="btn btn-small btn-primary" onclick="viewRequestDetails('${request.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                ${request.status === 'approved' ? `
                    <button class="btn btn-small btn-success" onclick="generateClearance('${request.id}')">
                        <i class="fas fa-certificate"></i> Clearance
                    </button>
                ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function compareRequests(a, b, key, direction) {
    let valA, valB;
    switch (key) {
        case 'id':
            valA = a.id;
            valB = b.id;
            break;
        case 'resident':
            const userA = allUsers.find(u => u.id === a.userId);
            const userB = allUsers.find(u => u.id === b.userId);
            valA = userA ? `${userA.firstName} ${userA.lastName}` : '';
            valB = userB ? `${userB.firstName} ${userB.lastName}` : '';
            break;
        case 'email':
            const uA = allUsers.find(u => u.id === a.userId);
            const uB = allUsers.find(u => u.id === b.userId);
            valA = uA ? uA.email : '';
            valB = uB ? uB.email : '';
            break;
        case 'purpose':
            valA = getPurposeText(a.purpose);
            valB = getPurposeText(b.purpose);
            break;
        case 'dateSubmitted':
            valA = a.dateSubmitted;
            valB = b.dateSubmitted;
            break;
        case 'status':
            valA = a.status;
            valB = b.status;
            break;
        default:
            valA = '';
            valB = '';
    }
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
}

// Filter and search functions
function filterRequests() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    let filteredRequests = [...allRequests];
    
    if (statusFilter) {
        filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
    }
    
    if (dateFilter) {
        filteredRequests = filteredRequests.filter(req => req.dateSubmitted === dateFilter);
    }
    
    updateRequestsTable(filteredRequests);
}

function searchRequests() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        updateRequestsTable(allRequests);
        return;
    }
    
    const filteredRequests = allRequests.filter(request => {
        const user = allUsers.find(u => u.id === request.userId);
        return (
            request.id.toLowerCase().includes(searchTerm) ||
            (user && user.firstName.toLowerCase().includes(searchTerm)) ||
            (user && user.lastName.toLowerCase().includes(searchTerm)) ||
            (user && user.email.toLowerCase().includes(searchTerm))
        );
    });
    
    updateRequestsTable(filteredRequests);
}

// Request management functions
function viewRequestDetails(requestId) {
    const request = allRequests.find(req => req.id === requestId);
    const user = allUsers.find(u => u.id === request.userId);
    
    if (request && user) {
        document.getElementById('detailRequestId').textContent = request.id;
        document.getElementById('detailResidentName').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('detailEmail').textContent = user.email;
        document.getElementById('detailPhone').textContent = user.phone;
        document.getElementById('detailAddress').textContent = user.address;
        document.getElementById('detailPurpose').textContent = getPurposeText(request.purpose);
        document.getElementById('detailAdditional').textContent = request.purposeDetails || 'None';
        document.getElementById('detailStatus').textContent = request.status.toUpperCase();
        document.getElementById('detailPaymentStatus').textContent = request.paymentStatus.toUpperCase();
        
        // Display Valid ID (first document)
        const documentsDiv = document.getElementById('detailDocuments');
        documentsDiv.innerHTML = '';
        if (request.documents && request.documents.length > 0) {
            const validId = request.documents[0];
            const isImage = /\.(jpg|jpeg|png|gif)$/i.test(validId);
            if (isImage) {
                const label = document.createElement('label');
                label.textContent = 'Valid ID:';
                label.style.display = 'block';
                label.style.marginBottom = '0.5rem';
                documentsDiv.appendChild(label);
                const img = document.createElement('img');
                img.src = 'image/' + validId;
                img.alt = validId;
                img.style.maxWidth = '160px';
                img.style.marginRight = '10px';
                img.style.marginBottom = '10px';
                img.style.cursor = 'pointer';
                img.onclick = () => window.open(img.src, '_blank');
                documentsDiv.appendChild(img);
            } else {
                const label = document.createElement('label');
                label.textContent = 'Valid ID:';
                label.style.display = 'block';
                label.style.marginBottom = '0.5rem';
                documentsDiv.appendChild(label);
                const docElement = document.createElement('p');
                docElement.innerHTML = `<i class="fas fa-file"></i> ${validId}`;
                documentsDiv.appendChild(docElement);
            }
        }
        // Display additional documents (if any)
        if (request.documents && request.documents.length > 1) {
            const addLabel = document.createElement('label');
            addLabel.textContent = 'Additional Documents:';
            addLabel.style.display = 'block';
            addLabel.style.margin = '1rem 0 0.5rem 0';
            documentsDiv.appendChild(addLabel);
            for (let i = 1; i < request.documents.length; i++) {
                const doc = request.documents[i];
                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(doc);
                if (isImage) {
                    const img = document.createElement('img');
                    img.src = 'image/' + doc;
                    img.alt = doc;
                    img.style.maxWidth = '120px';
                    img.style.marginRight = '10px';
                    img.style.marginBottom = '10px';
                    img.style.cursor = 'pointer';
                    img.onclick = () => window.open(img.src, '_blank');
                    documentsDiv.appendChild(img);
                } else {
                    const docElement = document.createElement('p');
                    docElement.innerHTML = `<i class="fas fa-file"></i> ${doc}`;
                    documentsDiv.appendChild(docElement);
                }
            }
        }
        
        // Set current status in dropdown
        document.getElementById('statusUpdate').value = request.status;
        document.getElementById('adminNotes').value = request.adminNotes || '';
        
        document.getElementById('requestDetailsModal').style.display = 'block';
    }
}

function closeRequestDetailsModal() {
    document.getElementById('requestDetailsModal').style.display = 'none';
}

function updateRequestStatus() {
    const requestId = document.getElementById('detailRequestId').textContent;
    const newStatus = document.getElementById('statusUpdate').value;
    const adminNotes = document.getElementById('adminNotes').value;
    
    const request = allRequests.find(req => req.id === requestId);
    if (request) {
        request.status = newStatus;
        request.adminNotes = adminNotes;
        
        // Save updated data to localStorage
        saveDataToStorage();
        
        closeRequestDetailsModal();
        loadAllRequests();
        showMessage('Request status updated successfully!', 'success');
    }
}

// Report functions
function showReports() {
    document.getElementById('reportsModal').style.display = 'block';
}

function closeReportsModal() {
    document.getElementById('reportsModal').style.display = 'none';
    document.getElementById('reportForm').reset();
}

function handleReportGeneration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const reportType = formData.get('reportType');
    const reportFormat = formData.get('reportFormat');
    
    // Generate report based on type
    let reportData = [];
    let reportTitle = '';
    
    switch (reportType) {
        case 'daily':
            const reportDate = formData.get('reportDate');
            reportData = allRequests.filter(req => req.dateSubmitted === reportDate);
            reportTitle = `Daily Report - ${reportDate}`;
            break;
        case 'weekly':
            // Calculate week range
            const today = new Date();
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            reportData = allRequests.filter(req => {
                const reqDate = new Date(req.dateSubmitted);
                return reqDate >= weekAgo && reqDate <= today;
            });
            reportTitle = `Weekly Report - ${weekAgo.toLocaleDateString()} to ${today.toLocaleDateString()}`;
            break;
        case 'monthly':
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            reportData = allRequests.filter(req => {
                const reqDate = new Date(req.dateSubmitted);
                return reqDate.getMonth() === currentMonth && reqDate.getFullYear() === currentYear;
            });
            reportTitle = `Monthly Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
            break;
        case 'custom':
            const startDate = formData.get('startDate');
            const endDate = formData.get('endDate');
            reportData = allRequests.filter(req => {
                return req.dateSubmitted >= startDate && req.dateSubmitted <= endDate;
            });
            reportTitle = `Custom Report - ${startDate} to ${endDate}`;
            break;
    }
    
    // Generate and download report
    generateReport(reportData, reportTitle, reportFormat);
    closeReportsModal();
}

function generateReport(data, title, format) {
    if (format === 'pdf') {
        generatePDFReport(data, title);
    } else {
        generateTextReport(data, title, format);
    }
}

function formatPesos(amount) {
    return '₱' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function generatePDFReport(data, title) {
    try {
        // Check if jsPDF is available
        if (!window.jspdf) {
            throw new Error('jsPDF library not loaded');
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add header
        doc.setFontSize(20);
        doc.text('BARANGAY CLEARANCE SYSTEM', 105, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.text(title, 105, 35, { align: 'center' });
        
        // Add generation info
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 50);
        doc.text(`Total Requests: ${data.length}`, 20, 60);
        const totalCost = data.length * 100;
        doc.text(`Total Cost: ${formatPesos(totalCost)}`, 20, 70);
        // Approved summary
        const approvedCount = data.filter(r => r.status === 'approved').length;
        const approvedCost = approvedCount * 100;
        doc.text(`Total Approved Requests: ${approvedCount}`, 20, 80);
        doc.text(`Total Approved Cost: ${formatPesos(approvedCost)}`, 20, 90);

        // Add table headers
        let yPosition = 100;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Request ID', 20, yPosition);
        doc.text('Resident Name', 50, yPosition);
        doc.text('Purpose', 100, yPosition);
        doc.text('Status', 140, yPosition);
        doc.text('Date', 170, yPosition);
        
        // Add table data
        yPosition += 10;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        data.forEach((request, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            const user = allUsers.find(u => u.id === request.userId);
            const residentName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
            
            doc.text(request.id, 20, yPosition);
            doc.text(residentName.substring(0, 20), 50, yPosition);
            doc.text(getPurposeText(request.purpose).substring(0, 15), 100, yPosition);
            doc.text(request.status, 140, yPosition);
            doc.text(request.dateSubmitted, 170, yPosition);
            
            yPosition += 8;
        });
        
        // Add statistics
        const statusCounts = {};
        data.forEach(req => {
            statusCounts[req.status] = (statusCounts[req.status] || 0) + 1;
        });
        
        yPosition += 10;
        doc.setFont(undefined, 'bold');
        doc.text('Status Summary:', 20, yPosition);
        yPosition += 8;
        doc.setFont(undefined, 'normal');
        
        Object.entries(statusCounts).forEach(([status, count]) => {
            doc.text(`${status.toUpperCase()}: ${count}`, 25, yPosition);
            yPosition += 6;
        });
        
        // Save PDF
        doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
        showMessage('PDF report generated and downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showMessage('PDF generation failed. Generating text report instead.', 'warning');
        // Fallback to text format
        generateTextReport(data, title, 'txt');
    }
}

function generateTextReport(data, title, format) {
    let reportContent = `${title}\n\n`;
    reportContent += `Generated on: ${new Date().toLocaleString()}\n`;
    reportContent += `Total Requests: ${data.length}\n`;
    const totalCost = data.length * 100;
    reportContent += `Total Cost: ${formatPesos(totalCost)}\n`;
    // Approved summary
    const approvedCount = data.filter(r => r.status === 'approved').length;
    const approvedCost = approvedCount * 100;
    reportContent += `Total Approved Requests: ${approvedCount}\n`;
    reportContent += `Total Approved Cost: ${formatPesos(approvedCost)}\n\n`;

    reportContent += `Request ID | Resident Name | Purpose | Status | Date Submitted\n`;
    reportContent += `-----------|---------------|---------|--------|----------------\n`;
    
    data.forEach(request => {
        const user = allUsers.find(u => u.id === request.userId);
        const residentName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
        reportContent += `${request.id} | ${residentName} | ${getPurposeText(request.purpose)} | ${request.status} | ${request.dateSubmitted}\n`;
    });
    
    // Add statistics
    const statusCounts = {};
    data.forEach(req => {
        statusCounts[req.status] = (statusCounts[req.status] || 0) + 1;
    });
    
    reportContent += `\nStatus Summary:\n`;
    Object.entries(statusCounts).forEach(([status, count]) => {
        reportContent += `${status.toUpperCase()}: ${count}\n`;
    });
    
    // Download report
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    showMessage('Report generated and downloaded successfully!', 'success');
}

// Resident management functions
function showResidentManagement() {
    document.getElementById('residentModal').style.display = 'block';
    loadResidentsTable();
}

function closeResidentModal() {
    document.getElementById('residentModal').style.display = 'none';
}

function loadResidentsTable() {
    const tableBody = document.getElementById('residentsTable');
    tableBody.innerHTML = '';
    
    allUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td><span class="status-badge status-approved">Active</span></td>
            <td>
                <button class="btn btn-small btn-warning" onclick="blockUser(${user.id})">
                    <i class="fas fa-ban"></i> Block
                </button>
                <button class="btn btn-small btn-primary" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function searchResidents() {
    const searchTerm = document.getElementById('residentSearch').value.toLowerCase();
    
    if (!searchTerm) {
        loadResidentsTable();
        return;
    }
    
    const filteredUsers = allUsers.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.nationalId.includes(searchTerm)
    );
    
    const tableBody = document.getElementById('residentsTable');
    tableBody.innerHTML = '';
    
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td><span class="status-badge status-approved">Active</span></td>
            <td>
                <button class="btn btn-small btn-warning" onclick="blockUser(${user.id})">
                    <i class="fas fa-ban"></i> Block
                </button>
                <button class="btn btn-small btn-primary" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function blockUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    if (user.status === 'blocked') {
        if (confirm('This user is already blocked. Unblock this user?')) {
            user.status = 'active';
            showMessage('User unblocked successfully', 'success');
        } else {
            return;
        }
    } else {
        if (confirm('Are you sure you want to block this user?')) {
            user.status = 'blocked';
            showMessage('User blocked successfully', 'success');
        } else {
            return;
        }
    }
    saveDataToStorage();
    loadResidentsTable();
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    // Show a modal with a form to edit user info
    showEditUserModal(user);
}

function showEditUserModal(user) {
    // Create modal if not exists
    let modal = document.getElementById('editUserModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editUserModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeEditUserModal()">&times;</span>
                <h2><i class='fas fa-edit'></i> Edit Resident</h2>
                <form id="editUserForm">
                    <div class="form-group">
                        <label for="editFirstName">First Name</label>
                        <input type="text" id="editFirstName" required>
                    </div>
                    <div class="form-group">
                        <label for="editLastName">Last Name</label>
                        <input type="text" id="editLastName" required>
                    </div>
                    <div class="form-group">
                        <label for="editEmail">Email</label>
                        <input type="email" id="editEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="editPhone">Phone</label>
                        <input type="text" id="editPhone" required>
                    </div>
                    <div class="form-group">
                        <label for="editAddress">Address</label>
                        <input type="text" id="editAddress" required>
                    </div>
                    <button type="submit" class="btn btn-success"><i class="fas fa-save"></i> Save Changes</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }
    // Fill form with user data
    document.getElementById('editFirstName').value = user.firstName;
    document.getElementById('editLastName').value = user.lastName;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.phone;
    document.getElementById('editAddress').value = user.address;
    // Show modal
    modal.style.display = 'block';
    // Handle form submit
    document.getElementById('editUserForm').onsubmit = function(e) {
        e.preventDefault();
        user.firstName = document.getElementById('editFirstName').value;
        user.lastName = document.getElementById('editLastName').value;
        user.email = document.getElementById('editEmail').value;
        user.phone = document.getElementById('editPhone').value;
        user.address = document.getElementById('editAddress').value;
        saveDataToStorage();
        loadResidentsTable();
        closeEditUserModal();
        showMessage('Resident updated successfully!', 'success');
    };
}
function closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    if (modal) modal.style.display = 'none';
}
// Update loadResidentsTable to show status
function loadResidentsTable() {
    const tableBody = document.getElementById('residentsTable');
    tableBody.innerHTML = '';
    allUsers.forEach(user => {
        const row = document.createElement('tr');
        const status = user.status === 'blocked' ? 'Blocked' : 'Active';
        const badgeClass = user.status === 'blocked' ? 'status-rejected' : 'status-approved';
        row.innerHTML = `
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td><span class="status-badge ${badgeClass}">${status}</span></td>
            <td>
                <button class="btn btn-small btn-warning" onclick="blockUser(${user.id})">
                    <i class="fas fa-ban"></i> ${user.status === 'blocked' ? 'Unblock' : 'Block'}
                </button>
                <button class="btn btn-small btn-primary" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Clearance generation functions
function generateClearance(requestId) {
    const request = allRequests.find(req => req.id === requestId);
    const user = allUsers.find(u => u.id === request.userId);
    
    if (request && user) {
        // Populate clearance modal
        document.getElementById('clearanceName').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('clearanceAddress').textContent = user.address;
        document.getElementById('clearancePurpose').textContent = getPurposeText(request.purpose);
        document.getElementById('clearanceDate').textContent = new Date().toLocaleDateString();
        document.getElementById('clearanceId').textContent = request.id;
        document.getElementById('clearanceValidUntil').textContent = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
        
        document.getElementById('clearanceModal').style.display = 'block';
    }
}

function closeClearanceModal() {
    document.getElementById('clearanceModal').style.display = 'none';
}

function downloadClearance() {
    // Generate PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get clearance data
    const clearanceId = document.getElementById('clearanceId').textContent;
    const name = document.getElementById('clearanceName').textContent;
    const address = document.getElementById('clearanceAddress').textContent;
    const purpose = document.getElementById('clearancePurpose').textContent;
    const date = document.getElementById('clearanceDate').textContent;
    const validUntil = document.getElementById('clearanceValidUntil').textContent;
    
    // Set font and colors
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    
    // Header
    doc.text('BARANGAY CLEARANCE', 105, 30, { align: 'center' });
    
    // Add barangay seal/logo placeholder
    doc.setFontSize(12);
    doc.text('Republic of the Philippines', 105, 45, { align: 'center' });
    doc.text('City of Toledo', 105, 52, { align: 'center' });
    doc.text('Barangay Daanlungsod', 105, 59, { align: 'center' });
    
    // Main content
    doc.setFontSize(14);
    doc.text('TO WHOM IT MAY CONCERN:', 20, 80);
    
    doc.setFontSize(12);
    doc.text('This is to certify that', 20, 95);
    
    // Resident name (highlighted)
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(name, 20, 105);
    doc.setFont(undefined, 'normal');
    
    doc.setFontSize(12);
    doc.text('of legal age, Filipino, and a resident of', 20, 115);
    doc.text(address, 20, 125);
    
    doc.text('is a person of good moral character and law-abiding citizen', 20, 140);
    doc.text('of this barangay.', 20, 150);
    
    doc.text('This clearance is being issued upon the request of the above-named', 20, 165);
    doc.text('person for', 20, 175);
    doc.text(purpose + '.', 20, 185);
    
    doc.text('This certification is valid until', 20, 200);
    doc.text(validUntil, 20, 210);
    doc.text('unless revoked for cause.', 20, 220);
    
    // Footer
    doc.setFontSize(12);
    doc.text('Issued this', 20, 240);
    doc.text(date, 20, 250);
    doc.text('at Barangay Daanlungsod, City of Toledo.', 20, 260);
    
    // Signature line
    doc.text('_________________________', 120, 280);
    doc.text('Barangay Captain', 120, 290);
    
    // QR Code placeholder
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('QR Code: ' + clearanceId, 20, 300);
    
    // Save the PDF
    doc.save(`clearance_${clearanceId}.pdf`);
    
    showMessage('Clearance PDF downloaded successfully!', 'success');
}

function printClearance() {
    const printWindow = window.open('', '_blank');
    const clearanceContent = document.getElementById('clearanceContent').innerHTML;
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Barangay Clearance</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .clearance { border: 2px solid #333; padding: 20px; }
                </style>
            </head>
            <body>
                <div class="clearance">${clearanceContent}</div>
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Utility functions
function getPurposeText(purpose) {
    const purposes = {
        'employment': 'Employment',
        'business': 'Business Permit',
        'school': 'School Requirements',
        'travel': 'Travel Abroad',
        'other': 'Other'
    };
    return purposes[purpose] || purpose;
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
