export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Convert an Axios error into a user-friendly string.
 */
export function handleApiError(error: unknown): string {
  if (typeof error !== 'object' || error === null) return 'An unexpected error occurred.';

  const err = error as { response?: { status?: number; data?: { detail?: string } }; message?: string };

  if (err.response) {
    const { status, data } = err.response;
    switch (status) {
      case 400: return data?.detail || 'Invalid request. Please check your input.';
      case 401: return 'Session expired. Please sign in again.';
      case 403: return 'You do not have permission to perform this action.';
      case 404: return 'The requested resource was not found.';
      case 409: return data?.detail || 'A conflict occurred. This resource may already exist.';
      case 422: return data?.detail || 'Validation failed. Please check your input.';
      case 429: return 'Too many requests. Please slow down and try again.';
      case 500: return 'Server error. Please try again in a moment.';
      case 503: return 'Service unavailable. Please try again later.';
      default:  return data?.detail || `Error ${status}. Please try again.`;
    }
  }

  if (err.message === 'Network Error') {
    return 'Network error. Please check your internet connection.';
  }

  return 'Something went wrong. Please try again.';
}
