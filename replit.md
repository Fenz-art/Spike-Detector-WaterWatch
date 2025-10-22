# WaterWatch - Water-Borne Spike Detector

## Overview
WaterWatch is an advanced ML-powered water quality monitoring system that detects disease outbreak spikes by analyzing water quality data. The platform integrates machine learning models with a modern web interface to provide hospitals and municipal authorities with real-time disease detection capabilities.

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **ML Service**: Python + FastAPI + scikit-learn
- **Database**: PostgreSQL (with in-memory fallback)
- **Authentication**: Express Session with bcrypt password hashing

### Project Structure
```
├── client/                 # Frontend React application
│   └── src/
│       ├── pages/         # Route pages (Home, Dashboard, Upload, Reports, etc.)
│       ├── components/    # Reusable UI components
│       ├── lib/           # Utilities and query client
│       └── hooks/         # Custom React hooks
├── server/                # Backend Node.js/Express server
│   ├── routes.ts          # API endpoints
│   ├── middleware/        # Auth middleware
│   ├── models/            # Data models
│   ├── storage/           # Database abstraction layer
│   └── utils/             # Helper utilities
├── ml_models/             # ML service
│   └── BE/
│       ├── main.py        # FastAPI application
│       ├── model_utils.py # Model loading and preprocessing
│       └── models/        # Trained ML models (pkl files)
└── shared/                # Shared types between frontend and backend
```

## Features Implemented

### 1. Enhanced Landing Page
- Smooth parallax scrolling effects
- Animated statistics counters with proper spacing
- Majestic gradient backgrounds with glass-morphism
- Interactive step-by-step tutorial cards
- Responsive navigation

### 2. Hospital Portal
- User registration and login system
- Session-based authentication
- Hospital information collection
- Secure password handling with bcrypt

### 3. Dashboard
- Real-time statistics display
- Recent uploads overview
- Quick action buttons for upload and reports
- Role-based access control

### 4. File Upload System
- Drag-and-drop CSV/Excel file upload
- Form validation for metadata (location, disease type, date)
- Geographic coordinates (latitude/longitude) support
- Integration ready for ML prediction service

### 5. Reports Management
- Historical data viewing
- Detailed report information
- Analysis summaries with key findings
- Export capabilities (UI ready)

### 6. Additional Pages
- **About Us**: Mission, vision, and platform features
- **Contact Us**: Contact form and information
- **Demo**: Interactive demo with sample data and visualizations

## Recent Changes (October 21, 2025)

### Major Updates
1. **Frontend Redesign**: Complete UI overhaul with smooth transitions and animations
2. **ML Integration Setup**: FastAPI service configured and ready for deployment
3. **Enhanced UX**: Added proper spacing to animated counters and improved transitions
4. **Database Support**: Configured for PostgreSQL with in-memory fallback
5. **Session Management**: Implemented secure session handling

### Configuration
- Server configured to run on port 5000
- Vite dev server configured for Replit environment
- CORS enabled for ML service integration
- HMR configured for development

## Environment Variables

### Required for Production
- `MONGODB_URI` or `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption
- `ML_SERVICE_URL`: URL of the FastAPI ML service (default: http://localhost:8000)

### Optional
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

## User Preferences & Coding Style
- TypeScript for type safety
- Functional React components with hooks
- Tailwind CSS for styling
- Framer Motion for animations
- Clean, modular code structure
- Comprehensive error handling
- User-friendly UI/UX with smooth transitions

## ML Model Integration

### Model Details
- **Random Forest Classifier** for outbreak prediction
- Features: Disease type, Location, Cases, Temperature, Precipitation, LAI
- Preprocessing includes feature engineering and scaling
- Output: Outbreak probability and heatmap data

### API Endpoints (FastAPI)
- `GET /`: Service information
- `GET /health`: Health check
- `POST /predict-spike`: Upload CSV for prediction

## Database Schema

### Users
- username, email, password (hashed)
- role (hospital/municipal)
- hospitalName, location
- timestamps

### Medical Records
- fileName, uploadedBy
- location, diseaseType, dateReported
- casesCount, latitude, longitude
- uploadedAt timestamp

### Alerts
- location, diseaseType
- severity (low/medium/high)
- message, status
- relatedRecordId
- timestamps

## Known Issues & Future Enhancements

### In Progress
- FastAPI ML service workflow configuration
- PostgreSQL database setup and migration
- Real-time WebSocket notifications

### Planned Features
- PDF/Excel report export
- Advanced data visualizations
- Multi-user collaboration
- Role-based permissions system
- Email notifications for alerts
- Mobile responsive improvements

## Development Workflow

### Running the Project
1. Frontend/Backend: Runs on port 5000 via `npm run dev`
2. ML Service: Run `./start_ml_service.sh` on port 8000
3. Database: PostgreSQL (optional, falls back to in-memory)

### Testing
- Upload test CSV files through the upload interface
- Check logs for API calls and errors
- Verify authentication flow
- Test report generation

## Deployment Notes
- Always serve frontend on port 5000
- Backend serves both API and static files
- ML service should be deployed separately
- Configure DATABASE_URL for persistence
- Set SESSION_SECRET in production

Last Updated: October 21, 2025
