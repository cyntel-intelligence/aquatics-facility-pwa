# Aquatics Facility Manager PWA

A comprehensive Progressive Web App for managing aquatics facilities, inspired by HydroApps Facility Manager. Built with React, TypeScript, Firebase, and Tailwind CSS.

## Features (Planned)

### Phase 1: Foundation ✅ **COMPLETED**
- ✅ React + TypeScript + Vite setup
- ✅ Tailwind CSS styling
- ✅ Firebase configuration (Auth, Firestore, Storage)
- ✅ Complete TypeScript type definitions
- ✅ Authentication system (Email/Password)
- ✅ Role-based access control (Admin, Manager, Staff)
- ✅ Responsive layout with sidebar navigation
- ✅ Protected routes and route guards

### Phase 2: Facility Management ✅ **COMPLETED**
- ✅ Multi-facility support with FacilityContext
- ✅ Facility CRUD operations (Create, Read, Update, Delete)
- ✅ Facility selector dropdown in header
- ✅ Configurable MAHC compliance standards
- ✅ Custom compliance rules per facility
- ✅ Operating hours configuration

### Phase 3: Pool Testing Logs ✅ **COMPLETED**
- ✅ Water chemistry tracking (pH, chlorine, alkalinity, calcium hardness, cyanuric acid, temperature)
- ✅ Real-time automated compliance checking
- ✅ Automated recommendations when out of range
- ✅ Chemical addition tracking
- ✅ Historical data view (last 30 tests)
- ✅ Interactive trend charts with Recharts (7-day view)
- ✅ Color-coded compliance status badges
- ✅ Notes and observations

### Phase 4: Checklists (Next)
- Customizable checklist templates
- Daily, weekly, monthly inspections
- Photo attachments
- Completion tracking

### Phase 5: Maintenance Logs
- Salt level tracking
- Salt cell cleaning logs
- Filter cleaning logs
- Temperature logs
- Maintenance alerts

### Phase 6: Incident Reporting
- Digital incident forms
- Photo/document uploads
- Digital signature capture
- Auto-generated incident numbers

### Phase 7: Dashboard & Analytics
- Real-time compliance monitoring
- Pool chemistry trends
- Staff activity tracking
- Quick actions

### Phase 8: Reports & Export
- PDF report generation
- Excel/CSV export
- Audit-ready documentation

### Phase 9: PWA & Offline Support
- Service worker configuration
- Offline data sync
- Background synchronization
- Installable on mobile devices

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd aquatics-facility-pwa
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**
   - Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Email/Password authentication
   - Create a Firestore database
   - Enable Firebase Storage
   - Copy your Firebase config

4. **Configure environment variables:**
   - Edit `.env` file with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:5173](http://localhost:5173)

## Project Structure

```
aquatics-facility-pwa/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── layout/         # Layout components (Sidebar, Header)
│   │   ├── common/         # Reusable UI components
│   │   └── ...             # Feature-specific components
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── pages/              # Route pages
│   ├── types/              # TypeScript type definitions
│   ├── config/             # Firebase configuration
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── .env                    # Environment variables (not in git)
├── .env.example            # Environment variables template
└── package.json
```

## Current Features

### Authentication
- **Sign Up**: Create new user accounts
- **Login**: Email/password authentication
- **Role-Based Access**: Admin, Manager, and Staff roles
- **Protected Routes**: Automatic redirection for unauthenticated users

### Navigation
- **Responsive Sidebar**: Collapsible on mobile
- **Role-Based Menu**: Admin/Manager see additional menu items
- **Quick Access**: Navigate to Dashboard, Checklists, Pool Testing, Maintenance, Incidents, Reports, Settings

### User Interface
- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Mobile-First**: Fully responsive design
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Smooth loading indicators

## Firebase Setup Details

### Firestore Collections

The following collections need to be created (will happen automatically on first use):

- **users/** - User profiles with role and facility access
- **facilities/** - Facility information and settings
- **checklistTemplates/** - Reusable checklist templates
- **checklists/** - Active and completed checklists
- **logs/** - All types of logs (pool testing, inspections, maintenance)
- **incidents/** - Incident reports
- **complianceRules/** - Facility-specific compliance standards

### Firestore Security Rules

Deploy these rules to your Firebase project (see `firestore.rules` in the plan):

```javascript
// Users must be authenticated
// Role-based access control enforced
// Users can only access facilities in their facilityIds array
```

### Initial Data

After setting up, you'll need to:

1. **Create the first admin user:**
   - Sign up through the app
   - Manually update the user's role to "admin" in Firestore console
   - Add facility IDs to the user's facilityIds array

2. **Create a facility:**
   - Use the Facilities page (coming in Phase 2)
   - Or manually add to Firestore

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **Routing**: React Router DOM 7
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: React Context API
- **Form Handling**: React Hook Form (to be added)
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Charts**: Recharts (to be integrated)
- **PDF Generation**: jsPDF (to be integrated)

## Environment

- **Development**: `npm run dev` runs on http://localhost:5173
- **Production**: Deploy to Firebase Hosting (Phase 10)

## Next Steps

1. **Set up your Firebase project** with the credentials
2. **Create your first admin user** and set their role in Firestore
3. **Test the authentication flow** (signup, login, logout)
4. **Begin Phase 2**: Facility Management

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved

---

**Current Status**: Phase 3 Complete ✅
**Next Phase**: Checklists
**Version**: 0.3.0
