import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // 이미 ApiResponseDto 형태인 경우 그대로 반환
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        
        // 일반 데이터인 경우 ApiResponseDto로 래핑
        return new ApiResponseDto(data);
      }),
    );
  }
}
