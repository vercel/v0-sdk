import validateNpmPackageName from 'validate-npm-package-name'

export function validateNpmName(name: string): {
  valid: boolean
  problems: string[]
} {
  const nameValidation = validateNpmPackageName(name)
  if (nameValidation.validForNewPackages) {
    return { valid: true, problems: [] }
  }

  return {
    valid: false,
    problems: [
      ...(nameValidation.errors || []),
      ...(nameValidation.warnings || []),
    ],
  }
}
