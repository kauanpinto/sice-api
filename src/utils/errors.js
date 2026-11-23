export class AppError extends Error {
  constructor(status, code, fields = null) {
    super(code);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
