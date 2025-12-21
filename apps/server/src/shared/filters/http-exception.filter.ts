import { ERROR_CODE } from '@monorepo/error-code';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { AppError, BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from '$errors';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let errorCode: string = '';
    let message: string;

    if (exception instanceof AppError) {
      // AppErrorの場合
      status = getStatusCode(exception);
      errorCode = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      // NestJS標準のHttpExceptionの場合
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message = typeof errorResponse === 'string' ? errorResponse : (errorResponse as any).message;
    } else {
      // その他の予期せぬエラーの場合
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = ERROR_CODE.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
    }

    // 5xxエラーかつ本番環境の場合はerrorCodeを統一（セキュリティ対策）
    const is5xxError = status >= 500 && status < 600;
    const isProd = process.env.NODE_ENV === 'production';

    if (is5xxError && isProd) {
      errorCode = ERROR_CODE.INTERNAL_SERVER_ERROR;
    }

    response.status(status).json({
      errorCode,
      message,
    });
  }
}

const getStatusCode = (exception: AppError): number => {
  if (exception instanceof BadRequestError) {
    return HttpStatus.BAD_REQUEST;
  }
  if (exception instanceof UnauthorizedError) {
    return HttpStatus.UNAUTHORIZED;
  }
  if (exception instanceof ForbiddenError) {
    return HttpStatus.FORBIDDEN;
  }
  if (exception instanceof NotFoundError) {
    return HttpStatus.NOT_FOUND;
  }
  return HttpStatus.INTERNAL_SERVER_ERROR;
};
