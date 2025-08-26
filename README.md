AxnosisTimeShare
AxnosisTimeShare is a timeshare venue management application built with Ionic 8 and Angular 20, using a fully standalone components architecture. Users can browse venues, check availability, book dates, and manage venues/applications (admin-only). The app features a responsive UI, role-based access, and dynamic updates for venue and booking management.
Features

Venue Management: Admins can add/delete venues with name, location, website link, description, and available dates.
Availability Checking: Users can select venues and view/book available dates, with preselected venues from the home page.
Role-Based Access: Admin-only access to the admin dashboard; viewer users can browse and book.
Dynamic Updates: Real-time venue and booking updates with toast notifications.
Responsive UI: Consistent logo (70px), floating labels, and centered layout (max-width 400px).
Standalone Architecture: Fully standalone Angular components with lazy-loaded routes for optimal performance.

Recent Updates (August 2025)

Added website link and description to TimeshareVenue.
Enabled admin venue add/delete with visible delete buttons.
Added preselected venue and available dates display on the availability page.
Removed default venues for an empty initial state.
Consolidated manage-venues and approvals into a single admin page.
Replaced manage-venues/approvals buttons with an admin-only button on the home page, preserving logo and login/registration buttons.
Transitioned from module-based routing (app.routes.ts) to a fully standalone routes.ts.
Fixed floating label visibility on the availability page for consistent UI with the admin page.
Resolved unused imports in admin.page.ts and form name errors in availability.page.html.
Standardized logo size (70px) across home and availability pages.

Prerequisites

Node.js: v18.x or later
npm: v9.x or later
Ionic CLI: npm install -g @ionic/cli
Angular CLI: npm install -g @angular/cli
Git: For cloning the repository

Setup Instructions

Clone the Repository:
git clone https://github.com/your-username/axnosis-timeshare.git
cd axnosis-timeshare


Install Dependencies:
npm install


Clear Preferences (Optional):To start with an empty venue list:
node -e "require('@capacitor/preferences').Preferences.remove({ key: 'venues' }).then(() => console.log('Venues cleared'))"


Set Up Admin Login:To test admin functionality, log in with the following credentials:

Email: John.Doe@example

Set this in the app via the /login page or manually in Preferences:node -e "require('@capacitor/preferences').Preferences.set({ key: 'currentUser', value: JSON.stringify({ email: 'John.Doe@example', role: 'admin' }) }).then(() => console.log('Admin user set'))"
Take note that the role based functionality still needs work accross the application, but the current John.Doe login will give admin access. 



Run Locally:
npm run ionic:build && npm run ionic:serve

Open http://localhost:8100 in your browser.

Run on Native (iOS/Android):
npx cap sync
npx cap run ios
# or
npx cap run android



Project Structure

src/app/routes.ts: Defines lazy-loaded routes for home, login, register, bookings, availability, and admin.
src/app/main.ts: Bootstraps the standalone AppComponent with provideIonicAngular and provideRouter.
src/app/home/: Home page with venue grid, admin-only button, and login/registration navigation.
src/app/availability/: Availability page with venue selection and date booking.
src/app/admin/: Admin dashboard for managing venues and approving/denying bookings.
src/app/services/timeshare.service.ts: Handles venue and booking logic with Capacitor Preferences.
src/app/models/types.ts: Defines TimeshareVenue, User, AdminUser, and TimeshareSlotApplication interfaces.

Contributing
We welcome contributions to enhance AxnosisTimeShare! Follow these steps to contribute:

Fork the Repository:

Fork https://github.com/your-username/axnosis-timeshare on GitHub.
Clone your fork:git clone https://github.com/your-username/axnosis-timeshare.git
cd axnosis-timeshare




Create a Feature Branch:
git checkout -b feature/your-feature-name


Follow Coding Guidelines:

Use standalone components (standalone: true) for new components.
Import dependencies directly in components (e.g., CommonModule, IonContent).
Maintain consistent styling (max-width: 400px, floating labels, 70px logo).
Add unit tests in *.spec.ts files using Angular’s testing framework.
Update routes.ts for new routes, using lazy loading (loadComponent).


Test Your Changes:

Run locally:npm run ionic:build && npm run ionic:serve


Test navigation (/home, /availability, /admin, etc.).
Verify floating labels, toasts, and dynamic updates (e.g., venue add/delete).
For admin features, test with the John.Doe@example admin account (role: 'admin').


Commit Changes:

Use clear commit messages:git commit -m "Add feature: describe your changes concisely"


Example: Add feature: implement ion-alert for venue delete confirmation.


Push and Create Pull Request:
git push origin feature/your-feature-name


Open a pull request on GitHub, describing your changes and referencing related issues.


Code Review:

Address feedback from maintainers.
Ensure no build errors (ng build) and all tests pass (ng test).



Debugging Tips

Routing Issues: Add console.log('Routes loaded:', routes) in routes.ts and check the console (F12).
Label Visibility: Inspect <ion-label position="floating"> in dev tools for display: none or opacity: 0.
Preferences: Check stored data:node -e "require('@capacitor/preferences').Preferences.get({ key: 'venues' }).then(console.log)"

Or verify admin user:node -e "require('@capacitor/preferences').Preferences.get({ key: 'currentUser' }).then(console.log)"


Build Errors: Run ng build and inspect console output.

Future Enhancements

Add <ion-alert> for delete confirmation on the admin page.
Implement placeholders for empty venues/applications.
Add unit tests for services and components.
Support dark mode with Ionic theming.
Enhance accessibility (e.g., ARIA labels for forms).

License
MIT License. See LICENSE for details.
Contact
For questions or suggestions, open an issue on GitHub or contact [Leon.Pretorius@Axnosis.com].