# Alive - Patient Health Records Portal

A modern, patient-centric healthcare application that empowers patients to access and manage their medical records.

## Features

- 🔐 **OTP-based Authentication** - Secure login with phone number and one-time password
- 👤 **Role-based Access** - Separate dashboards for patients and doctors
- 📋 **Medical History Timeline** - View your medical records in a clean, chronological timeline
- 🔍 **OCR Document Scanning** - Scan and extract text from medical documents (for doctors)
- 🏥 **Patient Management** - Doctors can search and manage patient records
- 📱 **Responsive Design** - Works seamlessly on mobile and desktop devices
- 🎨 **Alive Branding** - Consistent design following Alive brand guidelines
- ♿ **Accessible** - Built with accessibility standards in mind

## Tech Stack

- **React 18** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling with CSS variables

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd alive-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
alive-app/
├── src/
│   ├── pages/
│   │   ├── Login.jsx              # Login page with role selection & OTP
│   │   ├── Login.css
│   │   ├── PatientDashboard.jsx   # Patient dashboard with medical timeline
│   │   ├── PatientDashboard.css
│   │   ├── DoctorDashboard.jsx    # Doctor dashboard with patient management
│   │   └── DoctorDashboard.css
│   ├── components/
│   │   ├── OCRScanner.jsx         # OCR document scanning component
│   │   └── OCRScanner.css
│   ├── App.jsx                    # Main app component with role-based routing
│   ├── App.css
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles and CSS variables
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Usage

### Login Flow

1. **Select your role** - Choose either "Patient" or "Doctor"
2. Enter your phone number
3. Click "Send OTP" - In development, the OTP will be logged to the console
4. Enter the 6-digit OTP code
5. Click "Verify OTP" to access your dashboard

**Note:** For demo purposes, the OTP is displayed in the browser console. In production, this would be sent via SMS.

### Patient Dashboard

- View your medical history in a timeline format
- Each record shows date, hospital, type, and description
- Access your complete medical records

### Doctor Dashboard

- **Search Patients** - Search by name or phone number
- **View Patient Records** - Click "View Patient" to see details
- **OCR Document Scanning** - Click "Scan Document" to:
  - Upload an image of a medical document
  - Extract text using OCR technology
  - Save extracted information to patient records
- **Manage Records** - Add manual entries and view all patient records

## Routes

- `/login` - Login page with role selection
- `/patient/dashboard` - Patient dashboard (requires patient role)
- `/doctor/dashboard` - Doctor dashboard (requires doctor role)

**Note:** Routes are protected based on authentication and user role.

## Branding Guidelines

The app follows the Alive branding guidelines:

- **Primary Color:** #1E90FF (Dodger Blue)
- **Font:** Montserrat / Roboto
- **Design Philosophy:** Professional yet approachable, patient empowerment focus

For detailed branding guidelines, see `../Alive_Branding_Guidelines.md`

## Development Notes

- OTP generation is currently simulated for demo purposes
- Medical records data is hardcoded for demonstration
- OCR functionality uses mock data - in production, integrate with:
  - Tesseract.js for client-side OCR
  - Google Cloud Vision API
  - AWS Textract
  - Azure Computer Vision
- In production, this would connect to a backend API
- Authentication state is stored in localStorage (should use proper session management in production)
- Role-based access control is implemented for patient/doctor separation

## License

This project is part of a hackathon submission.

## Contributing

This is a hackathon project. For production use, consider:

- Adding backend API integration
- Implementing proper authentication
- Adding data persistence
- Implementing real SMS OTP delivery
- Adding more features like appointment booking, medication reminders, etc.

