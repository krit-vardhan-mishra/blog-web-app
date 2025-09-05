export class ApiError extends Error {
    constructor(message, status = 500, errors = [], stack = '', data = null) {
        super(message);
        this.status = status;
        this.data = data;
        this.errors = errors;
        this.message = message;
        this.success = false;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}