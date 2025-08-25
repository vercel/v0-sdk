---
'@v0/sdk': minor
---

Added proper HTTP error handling using custom error classes

- Created V0 error classes (V0AuthError, V0RateLimitError, etc.) for common 4xx/5xx HTTP status codes
- Added V0HttpErrorMap to map status codes to specific error classes
- Added createV0HttpError() helper function for dynamic error creation
- Fixed broken error.status pattern from documentation that never worked (error.status is always undefined)
- Users can now properly catch and handle specific errors using instanceof checks
- All errors follow consistent V0[Name]Error naming convention
- Individual exports for better tree-shaking and developer experience

This replaces the non-functional error.status approach with proper typed error classes.
