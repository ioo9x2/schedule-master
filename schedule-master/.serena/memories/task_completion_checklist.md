# Task Completion Checklist

## After Making Code Changes

### 1. Code Quality Check
```bash
npm run lint
```
- Fix any ESLint errors or warnings
- Ensure code follows project conventions

### 2. Local Testing
```bash
npm run dev
```
- Test functionality locally
- Verify UI renders correctly
- Check responsive design

### 3. Build Verification
```bash
npm run build
```
- Ensure no build errors
- Verify production build works

### 4. Functionality Testing
- Test the main scheduling flow
- Verify email functionality (if applicable)
- Check database operations
- Test error handling

### 5. Final Checks
- Verify Japanese text displays correctly
- Check weekday-only restriction works
- Ensure time slot validation functions
- Test responsive design on different screen sizes

## Don't Commit Unless
- All linting passes
- Build completes successfully
- Core functionality tested
- No console errors in browser