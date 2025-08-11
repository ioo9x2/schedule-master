# Development Commands

## Essential Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint (code quality check)
npm run lint
```

## System Commands (Windows)
```bash
# List files
dir
ls (if using Git Bash)

# Navigate directories
cd directory_name

# Search files
findstr "pattern" *.js
rg "pattern" (if ripgrep installed)

# Git operations
git status
git add .
git commit -m "message"
git push
```

## Task Completion Workflow
1. Make code changes
2. Run `npm run lint` to check code quality
3. Fix any linting issues
4. Test locally with `npm run dev`
5. Build with `npm run build` to verify no build errors