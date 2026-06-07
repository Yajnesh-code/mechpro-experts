export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFound(message = "Resource not found") {
  return new AppError(404, message);
}

export function forbidden(message = "Forbidden") {
  return new AppError(403, message);
}

export function badRequest(message = "Bad request") {
  return new AppError(400, message);
}
