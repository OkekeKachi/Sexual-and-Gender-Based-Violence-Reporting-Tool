# SGBV Dashboard
A web-based dashboard for monitoring and analyzing gender-based violence incidents reported through the mobile application.
Overview
This dashboard provides real-time visualization of gender-based violence (GBV) incidents across different categories, allowing administrators, researchers, and other stakeholders to gain insights into reported data. The dashboard connects to the same database as the mobile application to ensure data consistency.
Features

Real-time statistics of GBV incidents by category (rape, verbal abuse, economic abuse, physical abuse, negligence, etc.)
Filtering capabilities by date range, location, and incident type
Trend analysis over time
Geographical distribution of incidents
Demographic analysis of reporters and victims
Export functionality for reports in various formats (PDF, CSV, Excel)
User authentication and role-based access control

## Technology Stack

Frontend: React.js, Material UI/Tailwind CSS, Chart.js/D3.js
Backend: Node.js/Express (utilizing the existing backend structure from the mobile app)
Database: Same database as the mobile app (MongoDB/PostgreSQL)
Authentication: JWT/OAuth 2.0
Hosting: AWS/Google Cloud/Azure

## Prerequisites

Node.js (v18.x or higher)
npm (v9.x or higher)
Access to the existing backend API
Database credentials

Installation

Clone the repository

bashgit clone https://github.com/your-organization/gbv-dashboard.git
cd gbv-dashboard

Install dependencies

bashnpm install

Create a .env file in the root directory with the following variables:

API_URL=<backend-api-url>
DATABASE_URL=<database-connection-string>
JWT_SECRET=<your-jwt-secret>
PORT=3000

Start the development server

bashnpm run dev

Build for production

bashnpm run build
Project Structure
gbv-dashboard/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Charts/
│   │   ├── Filters/
│   │   └── Layout/
│   ├── contexts/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── pages/
│   ├── App.jsx
│   └── index.js
├── .env
├── .gitignore
├── package.json
└── README.md

Configuration
The dashboard is designed to work with the existing backend structure. Update the API endpoint configurations in src/services/api.js to match the endpoints available in Dr. Julius's backend implementation.
API Integration
The dashboard connects to the following API endpoints:

GET /api/incidents - Retrieve all incidents
GET /api/incidents/categories - Get incident counts by category
GET /api/incidents/timeline - Get incident trends over time
GET /api/incidents/location - Get geographical distribution
GET /api/users/stats - Get user reporting statistics

Authentication
The dashboard implements role-based access control:

Admins: Full access to all dashboard features
Researchers: Access to anonymized data and analytics
Support Staff: Limited access to specific modules

Deployment
Development
bashnpm run dev
Production
bashnpm run build
serve -s dist
Docker
bashdocker build -t gbv-dashboard .
docker run -p 3000:3000 gbv-dashboard
Contributing

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

Maintenance

Regular dependency updates
Database optimizations for performance
Security audits and patches

Troubleshooting
Common issues and their solutions:

API Connection Issues: Verify backend server is running and credentials are correct
Dashboard Not Loading: Check browser console for JavaScript errors
Data Not Displaying: Verify database connection and API endpoints

License


Contact
For technical support or inquiries, find out yourself