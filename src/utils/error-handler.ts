export enum Httpcode {
    BAD_REQUEST = 400,
    FORBIDDEN = 403,
    CONFLICTING_ERROR = 409,
    INTERNAL_SERVER_ERROR = 500,
}
  
interface ErrorMsgArgs {
    name?: string;
    httpCode: Httpcode;
    description: string;
}
  
class InternalServerException extends Error {
    statusCode: number;

    constructor(args: ErrorMsgArgs) {
        super(args.description);
        this.name = 'InternalServer Error';
        this.statusCode = Httpcode.INTERNAL_SERVER_ERROR;
    }
}
  
class BadRequestException extends Error {
    statusCode: number;

    constructor(args: ErrorMsgArgs) {
        super(args.description);
        this.name = 'BadRequest Error';
        this.statusCode = Httpcode.BAD_REQUEST;
    }
}
  
class ForbiddenException extends Error {
    statusCode: number;

    constructor(args: ErrorMsgArgs) {
    super(args.description);
    this.name = 'Forbidden Error';
    this.statusCode = Httpcode.FORBIDDEN;
    }
}
  
class ConflictingException extends Error {
    statusCode: number;

    constructor(args: ErrorMsgArgs) {
        super(args.description);
        this.name = 'Conflicting Error';
        this.statusCode = Httpcode.CONFLICTING_ERROR;
    }
}
  

export {
    InternalServerException,
    BadRequestException,
    ForbiddenException,
    ConflictingException,
};
  