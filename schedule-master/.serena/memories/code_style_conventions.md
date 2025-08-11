# Code Style and Conventions

## JavaScript/React Conventions
- **File Extensions**: `.js` for React components
- **Naming**: 
  - Components: PascalCase (`Page`, `Component`)
  - Functions: camelCase (`handleReservation`, `fetchEmployees`)
  - Variables: camelCase (`selectedSlot`, `employeeEmail`)
- **State Management**: React hooks (useState, useEffect)
- **API Routes**: App Router pattern (`app/api/*/route.js`)

## Code Structure
- **Components**: Function-based React components with hooks
- **API Layer**: RESTful APIs with proper error handling
- **Database**: Supabase client with error handling
- **Email**: EmailJS integration for notifications

## Styling
- **Framework**: Tailwind CSS 4.0
- **Design System**: Microsoft Fluent Design inspiration
- **Responsive**: Mobile-first approach
- **Colors**: Indigo primary, gray neutrals
- **Layout**: Grid-based calendar layout

## Best Practices
- Proper error handling in async functions
- Input validation (especially email validation)
- Japanese language support for UI
- Weekday-only business logic (weekends disabled)
- Real-time data fetching and updates