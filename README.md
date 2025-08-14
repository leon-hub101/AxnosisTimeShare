AxnosisTimeShare
A cross-platform timeshare management application built with Ionic 8 and Angular 20, using standalone components and Capacitor for web and native deployment. Allows users to browse available venues, book timeshare slots, and admins to manage venues and approve bookings, with data persisted locally using @capacitor/preferences.
Features

User Authentication: Login and registration with role-based access (admin/viewer).
Venue Management: Admins can add, update, and delete timeshare venues with available dates.
Booking System: Users can view available venues/dates and create booking applications.
Admin Approvals: Admins can approve or deny pending booking applications.
Local Storage: Persists venues, bookings, and user data using @capacitor/preferences.
Responsive UI: Mobile-first design with Ionic components, optimized for web, iOS, and Android.

Tech Stack

Framework: Ionic 8, Angular 20 (standalone components)
Storage: @capacitor/preferences for local persistence
Routing: Angular Router with lazy-loaded routes
Styling: SCSS with Flexbox, consistent 400px max-width
Build Tool: Capacitor for native builds
IDE: VS Code with WebNative extension

Setup Instructions

Clone the Repository:
git clone https://github.com/leon-hub101/AxnosisTimeShare.git
cd AxnosisTimeShare


Install Dependencies:
npm install


Run Locally (Web):
npm run ionic:build
npm run ionic:serve


Build for Native:
npx cap sync
npx cap run ios # or android


Test Admin Features:
Login with John.Doe@example.com to have admin rights.



Project Structure
src/app/
├── pages/
│   ├── home/                     # Navigation hub
│   ├── login/                    # User login
│   ├── register/                 # User registration
│   ├── bookings/                 # Create/view user bookings
│   ├── availability/             # View available venues/dates
│   ├── manage-venues/            # Admin venue CRUD
│   ├── approvals/                # Admin booking approvals
├── models/
│   ├── types.ts                  # TypeScript interfaces
├── services/
│   ├── timeshare.service.ts      # Business logic and data management
├── assets/
│   ├── icon/Axnosis.png          # App logo
├── environments/                 # Configuration settings
├── app-routing.module.ts         # Lazy-loaded routes

Key Files

timeshare.service.ts: Manages venues and bookings, with async methods for CRUD operations and local storage via Preferences.
types.ts: Defines interfaces (User, AdminUser, ViewerUser, TimeshareVenue, TimeshareSlotApplication) for type safety.
Pages: Each page (*.page.ts, .html, .scss) is a standalone component with reactive forms and Ionic UI components.

Known Issues

Ensure @capacitor/preferences is synced (npx cap sync) for native builds.
Validate date inputs in YYYY-MM-DD format to avoid errors in booking/venue forms.

Future Improvements

Integrate REST API and MongoDB for server-side storage.
Add real-time booking status updates.
Enhance validation with custom date format checks.

Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/YourFeature).
Commit changes (git commit -m "Add YourFeature").
Push to the branch (git push origin feature/YourFeature).
Open a pull request.
