# Local CI/CD Testing Scripts

These scripts help you test your CI/CD pipeline locally before pushing to GitHub.

## Scripts

### `test-ci-locally.ps1` (Full Test)
Runs the complete CI/CD pipeline simulation:
- ✅ Installs dependencies
- ✅ Checks environment configuration
- ✅ Runs database migrations
- ✅ Runs all backend tests with coverage
- ✅ Checks for syntax errors
- ✅ Runs linting (if available)
- ✅ Runs all frontend tests
- ✅ Builds frontend for production

**Usage:**
```powershell
.\test-ci-locally.ps1
```

**When to use:** Before pushing major changes or first-time setup

---

### `quick-check.ps1` (Quick Test)
Runs essential tests only:
- ✅ Backend tests
- ✅ Frontend tests
- ✅ Frontend build

**Usage:**
```powershell
.\quick-check.ps1
```

**When to use:** Quick validation before committing

---

## Recommended Workflow

```powershell
# 1. Make your changes
# 2. Run quick check
.\quick-check.ps1

# 3. If passed, commit
git add .
git commit -m "your message"

# 4. Run full test before pushing
.\test-ci-locally.ps1

# 5. If all passed, push
git push origin master
```

## Exit Codes
- `0` - All tests passed ✅
- `1` - Some tests failed ❌

## What Gets Tested

This matches exactly what GitHub Actions will run:
- Same test commands
- Same build process
- Same validation steps

If these scripts pass locally, your GitHub Actions pipeline should pass too! 🚀
