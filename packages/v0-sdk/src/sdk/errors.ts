export const createHttpError = (
  defaultMessage: string,
  defaultName: string,
  statusCode?: number,
) => {
  return class extends Error {
    public readonly status_code = statusCode

    constructor(message = defaultMessage) {
      super(message)
      this.name = defaultName
      Object.setPrototypeOf(this, new.target.prototype)
    }
  }
}

// 4xx Client Errors
export const V0BadRequestError = createHttpError(
  'Bad request - invalid parameters or malformed request',
  'V0BadRequestError',
  400,
)
export const V0AuthError = createHttpError(
  'Authentication failed',
  'V0AuthError',
  401,
)
export const V0PaymentRequiredError = createHttpError(
  'Payment required - insufficient credits or expired subscription',
  'V0PaymentRequiredError',
  402,
)
export const V0ForbiddenError = createHttpError(
  'Forbidden - access denied to this resource',
  'V0ForbiddenError',
  403,
)
export const V0NotFoundError = createHttpError(
  'Resource not found',
  'V0NotFoundError',
  404,
)
export const V0TimeoutError = createHttpError(
  'Resource not found',
  'V0NotFoundError',
  408,
)
export const V0UnprocessableEntityError = createHttpError(
  'Unprocessable entity - validation failed',
  'V0UnprocessableEntityError',
  422,
)
export const V0RateLimitError = createHttpError(
  'Rate limit exceeded - too many requests',
  'V0RateLimitError',
  429,
)

// 5xx Server Errors
export const V0InternalServerError = createHttpError(
  'Internal server error - unexpected server condition',
  'V0InternalServerError',
  500,
)
export const V0ServiceUnavailableError = createHttpError(
  'Service temporarily unavailable - server overloaded or maintenance',
  'V0ServiceUnavailableError',
  503,
)
export const V0GatewayTimeoutError = createHttpError(
  'Gateway timeout - upstream server response timeout',
  'V0GatewayTimeoutError',
  504,
)

export const V0UnknownError = createHttpError(
  'An unexpected error occurred',
  'UnknownError',
  0,
)

export const V0HttpErrorMap = new Map([
  [400, V0BadRequestError],
  [401, V0AuthError],
  [402, V0PaymentRequiredError],
  [403, V0ForbiddenError],
  [404, V0NotFoundError],
  [422, V0UnprocessableEntityError],
  [429, V0RateLimitError],
  [500, V0InternalServerError],
  [503, V0ServiceUnavailableError],
  [504, V0GatewayTimeoutError],
])
