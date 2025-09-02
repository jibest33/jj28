// User Portal Script
let currentUser = null;
let userRequests = [];

// Initialize data from localStorage or use defaults
let users = JSON.parse(localStorage.getItem('users')) || [
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

let requests = JSON.parse(localStorage.getItem('requests')) || [
    {
        id: 'REQ001',
        userId: 1,
        purpose: 'employment',
        purposeDetails: 'For job application at ABC Company',
        status: 'pending',
        dateSubmitted: '2024-01-15',
        paymentStatus: 'pending',
        documents: ['valid_id.jpg'],
        paymentMethod: 'gcash'
    }
];

// Save data to localStorage
function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('requests', JSON.stringify(requests));
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }

    // Form event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('requestForm').addEventListener('submit', handleNewRequest);
});

// Navigation functions
function showLogin() {
    document.getElementById('login').style.display = 'block';
    document.getElementById('register').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
}

function showRegister() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.add('active');
}

function showDashboard() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    loadUserData();
    loadUserRequests();
}

// Authentication functions
function showLoginMessage(message, type = 'error') {
    const msgDiv = document.getElementById('loginMessage');
    if (!msgDiv) return;
    msgDiv.innerHTML = `<div class="login-blocked-message animate-bounce-fade message-${type}">${message}</div>`;
    msgDiv.style.display = 'flex';
    msgDiv.style.justifyContent = 'center';
    msgDiv.style.alignItems = 'center';
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const user = users.find(u => u.email === email && u.password === password);
    // Clear previous login message
    showLoginMessage('');
    if (user) {
        if (user.status === 'blocked') {
            showLoginMessage('Your account has been blocked. Please contact the barangay for assistance.', 'error');
            return;
        }
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMessage('Login successful!', 'success');
        showDashboard();
    } else {
        showLoginMessage('Invalid email or password', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        id: users.length + 1,
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        nationalId: formData.get('nationalId'),
        address: formData.get('address'),
        password: formData.get('password')
    };
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
        showMessage('Email already registered', 'error');
        return;
    }
    
    // Check if passwords match
    if (userData.password !== formData.get('confirmPassword')) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    users.push(userData);
    currentUser = userData;
    localStorage.setItem('currentUser', JSON.stringify(userData));
    saveData(); // Save to localStorage
    showMessage('Registration successful!', 'success');
    showDashboard();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showMessage('Logged out successfully', 'success');
    showLogin();
}

// Dashboard functions
function loadUserData() {
    if (currentUser) {
        document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    }
}

function loadUserRequests() {
    // Reload requests from localStorage
    requests = JSON.parse(localStorage.getItem('requests')) || requests;
    userRequests = requests.filter(req => req.userId === currentUser.id);
    
    // Update statistics
    const pendingCount = userRequests.filter(req => req.status === 'pending').length;
    const approvedCount = userRequests.filter(req => req.status === 'approved').length;
    const releasedCount = userRequests.filter(req => req.status === 'released').length;
    
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('approvedCount').textContent = approvedCount;
    document.getElementById('releasedCount').textContent = releasedCount;
    
    // Update requests table
    const tableBody = document.getElementById('requestsTable');
    tableBody.innerHTML = '';
    
    userRequests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.id}</td>
            <td>${new Date(request.dateSubmitted).toLocaleDateString()}</td>
            <td>${getPurposeText(request.purpose)}</td>
            <td><span class="status-badge status-${request.status}">${request.status.toUpperCase()}</span></td>
            <td>
                <button class="btn btn-small btn-primary" onclick="viewRequest('${request.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                ${request.status === 'approved' ? `
                    <button class="btn btn-small btn-success" onclick="downloadClearance('${request.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                ` : ''}
                ${request.status === 'pending' ? `
                    <button class="btn btn-small btn-danger" onclick="cancelRequest('${request.id}')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Request functions
function showNewRequestForm() {
    document.getElementById('requestModal').style.display = 'block';
}

function closeRequestModal() {
    document.getElementById('requestModal').style.display = 'none';
    document.getElementById('requestForm').reset();
}

function handleNewRequest(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const requestData = {
        id: `REQ${String(requests.length + 1).padStart(3, '0')}`,
        userId: currentUser.id,
        purpose: formData.get('purpose'),
        purposeDetails: formData.get('purposeDetails'),
        status: 'pending',
        dateSubmitted: new Date().toISOString().split('T')[0],
        paymentStatus: 'pending',
        documents: [],
        paymentMethod: formData.get('paymentMethod')
    };
    
    // Handle file uploads
    const validIdFile = document.getElementById('validId').files[0];
    if (validIdFile) {
        requestData.documents.push(validIdFile.name);
    }
    
    requests.push(requestData);
    userRequests.push(requestData);
    
    saveData(); // Save to localStorage
    
    closeRequestModal();
    loadUserRequests();
    showMessage('Request submitted successfully!', 'success');
    
    // Show payment modal
    showPaymentModal(requestData);
}

function showPaymentModal(request) {
    document.getElementById('paymentRequestId').textContent = request.id;
    document.getElementById('paymentMethodText').textContent = getPaymentMethodText(request.paymentMethod);

    const instructions = getPaymentInstructions(request.paymentMethod);
    document.getElementById('paymentInstructions').innerHTML = instructions;

    // Hide or show payment proof field based on payment method
    const paymentProofGroup = document.getElementById('paymentProofGroup');
    const paymentProofInput = document.getElementById('paymentProof');
    if (request.paymentMethod === 'cash') {
        paymentProofGroup.style.display = 'none';
        paymentProofInput.required = false;
    } else {
        paymentProofGroup.style.display = 'block';
        paymentProofInput.required = true;
    }

    document.getElementById('paymentModal').style.display = 'block';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('paymentProof').value = '';
}

function confirmPayment() {
    // Get the current request ID
    const requestId = document.getElementById('paymentRequestId').textContent;
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    // Only require payment proof for non-cash methods
    if (request.paymentMethod !== 'cash') {
        const paymentProof = document.getElementById('paymentProof').files[0];
        if (!paymentProof) {
            showMessage('Please upload payment proof', 'error');
            return;
        }
        // Update request payment status and proof
        request.paymentStatus = 'paid';
        request.paymentProof = paymentProof.name;
    } else {
        // For cash, just mark as pending payment (or paid if you want)
        request.paymentStatus = 'pending';
    }
    saveData(); // Save to localStorage
    closePaymentModal();
    loadUserRequests();
    showMessage('Payment confirmed! Your request is now under review.', 'success');
}

function viewRequest(requestId) {
    const request = requests.find(req => req.id === requestId);
    if (request) {
        // Populate the modal table
        const tableBody = document.querySelector('#viewRequestTable tbody');
        tableBody.innerHTML = '';
        const details = [
            { label: 'Request ID', value: request.id },
            { label: 'Date Submitted', value: new Date(request.dateSubmitted).toLocaleDateString() },
            { label: 'Purpose', value: getPurposeText(request.purpose) },
            { label: 'Status', value: request.status ? request.status.toUpperCase() : 'N/A' },
            { label: 'Additional Details', value: request.purposeDetails ? request.purposeDetails : 'None' },
            { label: 'Payment Status', value: request.paymentStatus ? request.paymentStatus.toUpperCase() : 'N/A' },
            { label: 'Payment Method', value: getPaymentMethodText(request.paymentMethod) },
        ];
        details.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<th>${row.label}</th><td>${row.value}</td>`;
            tableBody.appendChild(tr);
        });
        document.getElementById('viewRequestModal').style.display = 'block';
    }
}
function closeViewRequestModal() {
    document.getElementById('viewRequestModal').style.display = 'none';
}

function downloadClearance(requestId) {
    const request = requests.find(req => req.id === requestId);
    if (request && request.status === 'approved') {
        // Generate and download clearance
        generateClearancePDF(request);
    }
}

function cancelRequest(requestId) {
    if (confirm('Are you sure you want to cancel this request?')) {
        const req = requests.find(r => r.id === requestId);
        if (req && req.status === 'pending') {
            req.status = 'cancelled';
            saveData();
            loadUserRequests();
            showMessage('Request cancelled successfully.', 'success');
        }
    }
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

function getPaymentMethodText(method) {
    const methods = {
        'gcash': 'GCash',
        'paymaya': 'PayMaya',
        'bank': 'Bank Transfer',
        'cash': 'Cash Payment'
    };
    return methods[method] || method;
}

function getPaymentInstructions(method) {
    const instructions = {
        'gcash': `
            <p><strong>GCash Payment Instructions:</strong></p>
            <p>1. Open your GCash app</p>
            <p>2. Send ₱100.00 to: 09123456789</p>
            <p>3. Use "Clearance Payment" as reference</p>
        `,
        'paymaya': `
            <p><strong>PayMaya Payment Instructions:</strong></p>
            <p>1. Open your PayMaya app</p>
            <p>2. Send ₱100.00 to: 09123456789</p>
            <p>3. Use "Clearance Payment" as reference</p>
        `,
        'bank': `
            <p><strong>Bank Transfer Instructions:</strong></p>
            <p>Bank: Sample Bank</p>
            <p>Account: 1234567890</p>
            <p>Amount: ₱100.00</p>
            <p>Reference: Clearance Payment</p>
        `,
        'cash': `
            <p><strong>Cash Payment Instructions:</strong></p>
            <p>Please visit the barangay hall during office hours (8:00 AM - 5:00 PM) to pay the clearance fee.</p>
        `
    };
    return instructions[method] || '<p>Payment instructions not available.</p>';
}

function generateClearancePDF(request) {
    // Generate PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
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
    doc.text(`${currentUser.firstName} ${currentUser.lastName}`, 20, 105);
    doc.setFont(undefined, 'normal');
    
    doc.setFontSize(12);
    doc.text('of legal age, Filipino, and a resident of', 20, 115);
    doc.text(currentUser.address, 20, 125);
    
    doc.text('is a person of good moral character and law-abiding citizen', 20, 140);
    doc.text('of this barangay.', 20, 150);
    
    doc.text('This clearance is being issued upon the request of the above-named', 20, 165);
    doc.text('person for', 20, 175);
    doc.text(getPurposeText(request.purpose) + '.', 20, 185);
    
    // Footer
    doc.setFontSize(12);
    doc.text('Issued this', 20, 200);
    doc.text(new Date().toLocaleDateString(), 20, 210);
    doc.text('at Barangay Daanlungsod, City of Toledo, Philippines.', 20, 220);
    
    // Signature lines
    doc.text('Prepared by:', 20, 240);
    doc.text('_________________________', 20, 250);
    doc.text('Barangay Secretary', 20, 260);
    
    doc.text('Approved by:', 120, 240);
    doc.text('_________________________', 120, 250);
    doc.text('Barangay Captain', 120, 260);
    
    // QR Code placeholder
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Clearance ID: ' + request.id, 20, 280);
    doc.text('QR Code: [QR Code for verification]', 20, 290);
    
    // Save the PDF
    doc.save(`clearance_${request.id}.pdf`);
    
    showMessage('Clearance PDF downloaded successfully!', 'success');
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
