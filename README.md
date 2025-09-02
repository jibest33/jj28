# Barangay Clearance System

A modern, web-based barangay clearance management system built with HTML, CSS, and JavaScript. This system provides both user and admin portals for efficient clearance request processing.

## 🌟 Features

### User Side (Residents)
- **Registration & Login**: Secure authentication with email, phone, or national ID
- **Online Clearance Request**: Submit requests with purpose and document uploads
- **Document Upload**: Support for valid IDs and additional documents
- **Payment Processing**: Multiple payment options (GCash, PayMaya, Bank Transfer, Cash)
- **Status Tracking**: Real-time tracking of application status
- **Digital Clearance**: Download/print clearance with QR code verification
- **Dashboard**: Personal dashboard with request history and statistics

### Admin Side (Barangay Officials)
- **Secure Login**: Admin-only access with role-based permissions
- **Request Management**: View, approve, and manage all clearance requests
- **Document Verification**: Review uploaded IDs and documents
- **Status Updates**: Update request status (Pending → Approved → Released)
- **Clearance Generation**: Generate digital clearances with barangay seal and QR codes
- **Report Generation**: Export reports (daily, weekly, monthly) in multiple formats
- **Resident Management**: Manage resident records and blocklist
- **Dashboard Analytics**: Comprehensive statistics and overview

### Security & Validation
- **QR Code Verification**: Each clearance includes a unique QR code for authenticity
- **Data Encryption**: Secure storage of sensitive information
- **Session Management**: Secure login/logout functionality
- **Input Validation**: Comprehensive form validation and sanitization

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Download or clone the project files
2. Open `index.html` in your web browser
3. The system is ready to use!

### Demo Credentials

#### User Portal
- **Email**: juan@example.com
- **Password**: password123

#### Admin Portal
- **Username**: admin
- **Password**: admin123

## 📁 File Structure

```
barangay-clearance-system/
├── index.html              # Main landing page
├── user-portal.html        # Resident portal
├── admin-portal.html       # Admin portal
├── styles.css             # Main stylesheet
├── script.js              # Landing page script
├── user-script.js         # User portal functionality
├── admin-script.js        # Admin portal functionality
└── README.md              # This file
```

## 🎯 Usage Guide

### For Residents

1. **Access the System**
   - Open `index.html` in your browser
   - Click "Resident Portal" or navigate to `user-portal.html`

2. **Registration**
   - Click "Register" tab
   - Fill in all required information
   - Submit the form

3. **Login**
   - Use your registered email and password
   - Access your personal dashboard

4. **Request Clearance**
   - Click "New Request" button
   - Select purpose and provide details
   - Upload required documents
   - Choose payment method
   - Submit request

5. **Payment**
   - Follow payment instructions
   - Upload payment proof
   - Confirm payment

6. **Track Status**
   - Monitor request status in dashboard
   - Download clearance when approved

### For Administrators

1. **Access Admin Portal**
   - Navigate to `admin-portal.html`
   - Login with admin credentials

2. **Dashboard Overview**
   - View statistics and pending requests
   - Monitor system activity

3. **Request Management**
   - View all clearance requests
   - Filter by status, date, or search
   - Review uploaded documents
   - Update request status

4. **Generate Reports**
   - Select report type (daily/weekly/monthly)
   - Choose format (PDF/Excel/CSV)
   - Download generated reports

5. **Resident Management**
   - View all registered residents
   - Search and filter residents
   - Block or edit user accounts

6. **Clearance Generation**
   - Generate digital clearances
   - Include QR codes for verification
   - Print or download clearances

## 🔧 Customization

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- The system uses CSS Grid and Flexbox for responsive design
- Color scheme can be customized by updating CSS variables

### Functionality
- Edit JavaScript files to modify behavior
- Add new payment methods in `user-script.js`
- Extend admin features in `admin-script.js`

### Data
- Update mock data in JavaScript files
- In production, replace mock data with real database integration

## 🔒 Security Features

- **Input Validation**: All forms include client-side validation
- **Session Management**: Secure login/logout with localStorage
- **Data Sanitization**: Prevents XSS and injection attacks
- **File Upload Validation**: Restricts file types and sizes
- **QR Code Verification**: Unique codes for each clearance

## 📱 Responsive Design

The system is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Future Enhancements

- **Database Integration**: MySQL/PostgreSQL backend
- **Email Notifications**: Automated status updates
- **SMS Integration**: Text message notifications
- **Advanced Analytics**: Detailed reporting and insights
- **Multi-language Support**: Filipino and English
- **API Integration**: Connect with government systems
- **Mobile App**: Native mobile applications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For support or questions:
- Email: barangay@example.com
- Phone: +63 912 345 6789
- Address: Barangay Hall, Main Street, City

## 🎉 Acknowledgments

- Font Awesome for icons
- Modern CSS techniques for responsive design
- LocalStorage for session management
- QR Code generation for verification

---

**Note**: This is a demo system using mock data. For production use, implement proper backend services, database integration, and security measures.
