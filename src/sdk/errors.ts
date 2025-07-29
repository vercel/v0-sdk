
function createHttpError(defaultMessage: string, defaultName: string, statusCode?: number) {
    return class extends Error {
        public readonly status_code = statusCode

        constructor(message = defaultMessage) {
            super(message);
            this.name = defaultName;
            Object.setPrototypeOf(this, new.target.prototype);
        }
    };
}


export const BadRequestError = createHttpError(
  'HTTP 400: The request was invalid or malformed.',
  'BadRequestError',
  400
);
export const PaymentRequiredError = createHttpError(
  'HTTP 402: Payment required - please check your account credits.',
  'PaymentRequiredError',
  402
);
export const AuthenticationError = createHttpError(
  'HTTP 401: Authentication required or session expired.',
  'AuthenticationError',
  401
);
export const ForbiddenError = createHttpError(
  'HTTP 403: You do not have permission to access this resource - possibly due to exceeded quotas or insufficient credits.',
  'ForbiddenError',
  403
);
export const NotFoundError = createHttpError(
  'HTTP 404: The requested resource was not found.',
  'NotFoundError',
  404
);
export const RequestTimeoutError = createHttpError(
  'HTTP 408: Request timeout. Please try again.',
  'RequestTimeoutError',
  408
);
export const TooManyRequestsError = createHttpError(
  'HTTP 429: Too many requests - please slow down or check quota limits.',
  'TooManyRequestsError',
  429
);
export const InternalServerError = createHttpError(
  'HTTP 500: Internal server error. Please try again later.',
  'InternalServerError',
  500
);
export const BadGatewayError = createHttpError(
  'HTTP 502: Bad gateway. Try again later.',
  'BadGatewayError',
  502
);
export const ServiceUnavailableError = createHttpError(
  'HTTP 503: Service unavailable. Please try again later.',
  'ServiceUnavailableError',
  503
);
export const GatewayTimeoutError = createHttpError(
  'HTTP 504: Gateway timeout. Please try again later.',
  'GatewayTimeoutError',
  504
);
export const UnexpectedError = createHttpError(
  'An unexpected error occurred. Please try again later.',
  'UnexpectedError'
);


export function handleHttpStatus(status: number): never {
  switch (status) {
    case 400:
      throw new BadRequestError();
    case 402:
      throw new PaymentRequiredError();
    case 401:
      throw new AuthenticationError();
    case 403:
      throw new ForbiddenError();
    case 404:
      throw new NotFoundError();
    case 408:
      throw new RequestTimeoutError();
    case 429:
      throw new TooManyRequestsError();
    case 500:
      throw new InternalServerError();
    case 502:
      throw new BadGatewayError();
    case 503:
      throw new ServiceUnavailableError();
    case 504:
      throw new GatewayTimeoutError();
    default:
      throw new UnexpectedError();
  }
}


export const collectionErrors = {
  BadRequestError,
  PaymentRequiredError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  RequestTimeoutError,
  TooManyRequestsError,
  InternalServerError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  UnexpectedError
};
