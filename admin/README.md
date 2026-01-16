# Language Pack Admin

The River of God 앱의 언어팩(번역본 EPUB)을 관리하는 Admin 대시보드입니다.

## 기능

- **언어팩 업로드**: 새로운 언어의 EPUB 파일 업로드
- **버전 관리**: 각 언어팩의 버전 관리
- **파일 교체**: 기존 언어팩의 EPUB 파일 교체
- **삭제**: 더 이상 필요없는 언어팩 삭제
- **Manifest 자동 생성**: 언어팩 변경 시 `manifest.json` 자동 업데이트

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS v4
- **Language**: TypeScript
- **Testing**: Jest + React Testing Library

## 시작하기

### 설치

```bash
cd admin
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 Admin에 접속할 수 있습니다.

### 테스트 실행

```bash
npm test
```

### 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
admin/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   └── languages/      # 언어팩 API 엔드포인트
│   │   ├── languages/          # 언어팩 관리 페이지
│   │   ├── globals.css         # 전역 스타일
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   └── page.tsx            # 대시보드 홈
│   ├── components/             # React 컴포넌트
│   │   ├── Sidebar.tsx
│   │   ├── UploadModal.tsx
│   │   └── LanguageTable.tsx
│   └── lib/                    # 유틸리티
│       ├── types.ts            # TypeScript 타입
│       ├── languages.ts        # 지원 언어 목록
│       └── storage.ts          # 파일 저장 로직
├── public/
│   ├── books/                  # EPUB 파일 저장 위치
│   └── manifest.json           # 앱에서 사용하는 언어팩 목록
├── data/                       # 내부 데이터 (languages.json)
└── __tests__/                  # 테스트 파일
```

## API 엔드포인트

### GET /api/languages
등록된 모든 언어팩 목록 조회

### POST /api/languages
새 언어팩 업로드 (FormData: code, version, file)

### PUT /api/languages
manifest.json 재생성

### GET /api/languages/[code]
특정 언어팩 조회

### PATCH /api/languages/[code]
언어팩 버전 업데이트 (JSON: version)

### PUT /api/languages/[code]
언어팩 EPUB 파일 교체 (FormData: file, version?)

### DELETE /api/languages/[code]
언어팩 삭제

## 배포

### Firebase Hosting 배포

1. Firebase 프로젝트 생성
2. Firebase CLI 설치: `npm install -g firebase-tools`
3. 로그인: `firebase login`
4. 초기화: `firebase init hosting`
5. 빌드: `npm run build`
6. 배포: `firebase deploy`

### Vercel 배포

```bash
npx vercel
```

## 앱과의 연동

Admin에서 생성된 `manifest.json`과 EPUB 파일들은 앱의 `contentService.ts`에서 사용됩니다.

앱의 `CONTENT_BASE_URL`을 Admin이 배포된 URL로 설정하세요:

```typescript
// src/shared/services/contentService.ts
const CONTENT_BASE_URL = 'https://your-admin-url.com';
```

앱에서 `/manifest.json`을 다운로드하여 사용 가능한 언어팩 목록을 가져오고,
`/books/{code}.epub` 경로에서 EPUB 파일을 다운로드합니다.
