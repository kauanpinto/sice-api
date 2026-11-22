export class AppError extends Error {
  constructor(status, code) {
    super(code);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}
