import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';

import { BusinessLogicError } from '$exceptions';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorCode: string;
    let message: string;

    if (exception instanceof BusinessLogicError) {
      // AppErrorの場合
      status = exception.errorObject.statusCode;
      errorCode = exception.errorObject.code;
      message = exception.errorObject.message;
    } else if (exception instanceof HttpException) {
      // NestJS標準のHttpExceptionの場合
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      errorCode = String(status); // HttpExceptionにはerrorCodeがないのでstatusを代用
      message = typeof errorResponse === 'string' ? errorResponse : (errorResponse as any).message;
    } else {
      // その他の予期せぬエラーの場合
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = 'INTERNAL_SERVER_ERROR';
      message = 'An unexpected internal server error occurred.';
    }

    response.status(status).json({
      path: request.url,
      errorCode,
      message,
    });
  }
}
