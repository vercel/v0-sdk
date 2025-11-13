// Convert camelCase to kebab-case
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

// Convert kebab-case to camelCase
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

// Convert operationId to route path
// Example: "chats.findMessages" -> ["chats", "find-messages"]
export function operationIdToRoute(operationId: string): {
  resource: string
  action: string
} {
  const parts = operationId.split('.')
  if (parts.length < 2) {
    return { resource: parts[0] || '', action: 'index' }
  }

  // Handle nested resources like "integrations.vercel.projects.create"
  const resource = parts.slice(0, -1).join('/')
  const action = camelToKebab(parts[parts.length - 1])

  return { resource, action }
}

// Convert route params to operationId
// Example: resource="chats", action="find-messages" -> "chats.findMessages"
export function routeToOperationId(resource: string, action: string): string {
  // Handle nested resources
  const resourceParts = resource.split('/').join('.')
  const actionCamel = kebabToCamel(action)
  return `${resourceParts}.${actionCamel}`
}
