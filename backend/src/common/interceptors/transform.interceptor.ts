import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((result) => {
        // Handle responses that already specify message or success
        if (
          result &&
          typeof result === 'object' &&
          'success' in result &&
          'data' in result
        ) {
          return result;
        }

        let message = 'Operation successful';
        let data = result;

        if (result && typeof result === 'object' && 'message' in result) {
          message = result.message;
          if (Object.keys(result).length === 1) {
            data = null as any;
          } else {
            const { message: _, ...rest } = result;
            data = rest;
          }
        }

        return {
          success: true,
          message,
          data: data ?? null,
        };
      }),
    );
  }
}
