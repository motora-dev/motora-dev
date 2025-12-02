import { ERROR_CODE } from '@monorepo/error-code';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';

import { BusinessLogicError } from '$exceptions';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorCode: string = '';
    let message: string;

    if (exception instanceof BusinessLogicError) {
      // AppErrorの場合
      status = exception.statusCode;
      errorCode = exception.errorCode;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      // NestJS標準のHttpExceptionの場合
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message = typeof errorResponse === 'string' ? errorResponse : (errorResponse as any).message;
    } else {
      // その他の予期せぬエラーの場合
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = ERROR_CODE.INTERNAL_SERVER_ERROR.code;
      message = ERROR_CODE.INTERNAL_SERVER_ERROR.message;
    }

    // 5xxエラーかつ本番環境の場合はerrorCodeを統一（セキュリティ対策）
    const is5xxError = status >= 500 && status < 600;
    const isProd = process.env.NODE_ENV === 'production';

    if (is5xxError && isProd) {
      errorCode = ERROR_CODE.INTERNAL_SERVER_ERROR.code;
      message = ERROR_CODE.INTERNAL_SERVER_ERROR.message;
    }

    response.status(status).json({
      path: request.url,
      errorCode,
      message,
    });
  }
}
