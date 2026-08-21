export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly path?: string;
  public readonly timestamp?: string;

  constructor(
    statusCode: number,
    message: string,
    details?: unknown,
    path?: string,
    timestamp?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.path = path;
    this.timestamp = timestamp || new Date().toISOString();

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  public static fromResponse(statusCode: number, data: unknown, url?: string): ApiError {
    let message = "An unexpected error occurred.";
    let details: unknown = null;
    const responseObj = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : null;

    if (responseObj) {
      if (typeof responseObj.message === "string") {
        message = responseObj.message;
      } else if (Array.isArray(responseObj.message)) {
        message = responseObj.message.join(", ");
        details = responseObj.message;
      } else if (typeof responseObj.error === "string") {
        message = responseObj.error;
      }
    }

    if (!message || message === "Internal server error") {
      switch (statusCode) {
        case 400:
          message = "Bad request. Please check your input.";
          break;
        case 401:
          message = "Unauthorized. Please log in again.";
          break;
        case 403:
          message = "Forbidden. You do not have permission for this resource.";
          break;
        case 404:
          message = "Resource not found.";
          break;
        case 409:
          message = "Conflict. A resource with this information already exists.";
          break;
        case 422:
          message = "Unprocessable entity. Validation failed.";
          break;
        case 429:
          message = "Too many requests. Please try again later.";
          break;
        case 500:
        default:
          message = "An internal server error occurred. Please try again later.";
          break;
      }
    }

    return new ApiError(
      statusCode,
      message,
      details || data,
      url || (responseObj?.path as string | undefined),
      responseObj?.timestamp as string | undefined
    );
  }
}
