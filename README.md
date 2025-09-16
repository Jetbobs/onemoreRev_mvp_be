# OneMoreRev Backend

OneMoreRev 프로젝트의 백엔드 API 서버입니다.

## 🚀 기술 스택

- **Framework**: NestJS
- **Language**: TypeScript
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer

## 📁 프로젝트 구조

```
src/
├── common/                 # 공통 모듈
│   ├── decorators/        # 커스텀 데코레이터
│   ├── dto/              # 공통 DTO
│   ├── filters/          # 예외 필터
│   └── interceptors/     # 응답 인터셉터
├── app.controller.ts     # 메인 컨트롤러
├── app.module.ts         # 메인 모듈
├── app.service.ts        # 메인 서비스
└── main.ts              # 애플리케이션 진입점
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 서버 설정
PORT=3000
NODE_ENV=development

# CORS 설정
CORS_ORIGIN=http://localhost:3000

# 로그 설정
LOG_LEVEL=debug
```

### 3. 개발 서버 실행

```bash
# 개발 모드
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

## 📚 API 문서

서버 실행 후 다음 URL에서 Swagger API 문서를 확인할 수 있습니다:

- **API 문서**: http://localhost:3000/api/docs

## 🔧 사용 가능한 스크립트

```bash
# 개발 서버 실행 (watch 모드)
npm run start:dev

# 디버그 모드로 실행
npm run start:debug

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start:prod

# 코드 린팅
npm run lint

# 코드 포맷팅
npm run format

# 테스트 실행
npm run test

# 테스트 커버리지
npm run test:cov

# E2E 테스트
npm run test:e2e
```

## 🌐 기본 엔드포인트

- `GET /` - 서버 상태 확인
- `GET /health` - 헬스 체크

## 📝 주요 기능

- ✅ NestJS 프레임워크 설정
- ✅ TypeScript 설정
- ✅ Swagger API 문서 자동 생성
- ✅ 전역 유효성 검사 파이프
- ✅ CORS 설정
- ✅ 커스텀 예외 필터
- ✅ 응답 인터셉터
- ✅ 페이지네이션 DTO
- ✅ 표준화된 API 응답 형식

## 🔄 다음 단계

1. 데이터베이스 설정 (TypeORM, Prisma 등)
2. 인증/인가 시스템 구현 (JWT, Passport 등)
3. 비즈니스 로직 모듈 구현
4. 테스트 코드 작성
5. 로깅 시스템 구현
6. 배포 설정

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.
