# 언어팩 배포 가이드

The River of God 앱의 언어팩(번역본 EPUB) 서버 구축 및 배포 가이드입니다.

---

## 목차

1. [개요](#1-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [Admin 대시보드 설정](#3-admin-대시보드-설정)
4. [언어팩 관리](#4-언어팩-관리)
5. [서버 배포](#5-서버-배포)
6. [앱 연동](#6-앱-연동)
7. [EAS 빌드 및 배포](#7-eas-빌드-및-배포)
8. [문제 해결](#8-문제-해결)

---

## 1. 개요

### 1.1 언어팩이란?

언어팩은 "The River of God" 책의 각 언어별 번역본 EPUB 파일입니다. 앱 사용자는 원하는 언어의 번역본을 서버에서 다운로드하여 읽을 수 있습니다.

### 1.2 왜 서버가 필요한가?

| 방식 | 장점 | 단점 |
|------|------|------|
| **앱에 번들** | 오프라인 즉시 사용 | 앱 용량 증가, 업데이트 시 앱 재배포 필요 |
| **서버 다운로드** | 앱 용량 최소화, 언어팩 독립 업데이트 | 인터넷 필요 |

현재 앱은 **하이브리드 방식**을 사용합니다:
- 영어(en)는 앱에 번들 (오프라인 기본 제공)
- 다른 언어는 서버에서 다운로드

---

## 2. 시스템 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Admin 웹앱    │────▶│   파일 서버     │◀────│   모바일 앱     │
│   (관리자)      │     │   (호스팅)      │     │   (사용자)      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
   EPUB 업로드            manifest.json           언어팩 다운로드
   버전 관리              + EPUB 파일들           오프라인 저장
```

### 2.1 서버 파일 구조

```
public/
├── manifest.json          # 언어팩 목록 (앱에서 먼저 다운로드)
└── books/
    ├── en.epub           # 영어
    ├── ko.epub           # 한국어
    ├── es.epub           # 스페인어
    ├── zh.epub           # 중국어
    ├── ar.epub           # 아랍어 (RTL)
    └── ...
```

### 2.2 manifest.json 형식

```json
{
  "version": "1.0",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "languages": [
    {
      "code": "en",
      "name": "English",
      "localName": "English",
      "file": "books/en.epub",
      "size": "2.5 MB",
      "version": "1.0"
    },
    {
      "code": "ko",
      "name": "Korean",
      "localName": "한국어",
      "file": "books/ko.epub",
      "size": "2.8 MB",
      "version": "1.0"
    },
    {
      "code": "ar",
      "name": "Arabic",
      "localName": "العربية",
      "file": "books/ar.epub",
      "size": "2.7 MB",
      "version": "1.0",
      "rtl": true
    }
  ]
}
```

---

## 3. Admin 대시보드 설정

### 3.1 설치

```bash
# admin 디렉토리로 이동
cd admin

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 3.2 프로젝트 구조

```
admin/
├── src/
│   ├── app/
│   │   ├── api/languages/      # REST API 엔드포인트
│   │   ├── languages/          # 언어팩 관리 페이지
│   │   └── page.tsx            # 대시보드 홈
│   ├── components/
│   │   ├── Sidebar.tsx         # 사이드바 네비게이션
│   │   ├── UploadModal.tsx     # 업로드 모달
│   │   └── LanguageTable.tsx   # 언어팩 테이블
│   └── lib/
│       ├── types.ts            # TypeScript 타입
│       ├── languages.ts        # 지원 언어 목록
│       └── storage.ts          # 파일 저장 로직
├── public/
│   ├── books/                  # EPUB 파일 저장 위치
│   └── manifest.json           # 생성된 manifest
└── data/
    └── languages.json          # 언어팩 메타데이터
```

### 3.3 테스트 실행

```bash
npm test
```

---

## 4. 언어팩 관리

### 4.1 새 언어팩 추가

1. Admin 대시보드 접속
2. **"새 언어팩 추가"** 버튼 클릭
3. 언어 선택 (드롭다운)
4. 버전 입력 (예: 1.0)
5. EPUB 파일 드래그 & 드롭 또는 클릭하여 선택
6. **"업로드"** 버튼 클릭

### 4.2 버전 업데이트

1. 테이블에서 해당 언어의 버전 번호 클릭
2. 새 버전 입력
3. 체크 아이콘 클릭하여 저장

### 4.3 EPUB 파일 교체

1. 테이블에서 해당 언어의 업로드 아이콘(↑) 클릭
2. 새 EPUB 파일 선택
3. 자동으로 파일 크기 업데이트

### 4.4 언어팩 삭제

1. 테이블에서 해당 언어의 휴지통 아이콘 클릭
2. 확인 버튼 클릭

### 4.5 Manifest 재생성

모든 변경 사항은 자동으로 `manifest.json`에 반영됩니다.
수동 재생성이 필요한 경우 **"Manifest 재생성"** 버튼 클릭

---

## 5. 서버 배포

### 5.1 Firebase Hosting (권장)

Firebase는 무료 티어와 글로벌 CDN을 제공합니다.

#### 설정 단계

```bash
# 1. Firebase CLI 설치
npm install -g firebase-tools

# 2. Firebase 로그인
firebase login

# 3. admin 디렉토리에서 Firebase 초기화
cd admin
firebase init hosting

# 설정 옵션:
# - Public directory: out
# - Single-page app: Yes
# - GitHub Actions: No (선택)

# 4. Next.js 정적 빌드
npm run build

# 5. 배포
firebase deploy
```

#### firebase.json 예시

```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/books/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      },
      {
        "source": "/manifest.json",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=300"
          }
        ]
      }
    ]
  }
}
```

### 5.2 Vercel

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
cd admin
vercel
```

### 5.3 AWS S3 + CloudFront

대규모 트래픽이 예상되는 경우 권장

```bash
# AWS CLI로 S3 업로드
aws s3 sync ./public s3://your-bucket-name --acl public-read

# CloudFront 배포 생성 (AWS Console에서)
```

### 5.4 배포 URL 확인

배포 후 다음 URL이 작동하는지 확인:
- `https://your-domain.com/manifest.json`
- `https://your-domain.com/books/en.epub`

---

## 6. 앱 연동

### 6.1 CONTENT_BASE_URL 설정

`src/shared/services/contentService.ts` 파일을 수정합니다:

```typescript
// Before (개발용)
const CONTENT_BASE_URL = 'https://your-project.web.app';

// After (실제 서버 URL로 변경)
const CONTENT_BASE_URL = 'https://theriverofgod-admin.web.app';
```

### 6.2 앱 동작 흐름

```
1. 앱 시작
   ↓
2. fetchManifest() 호출
   GET https://your-server.com/manifest.json
   ↓
3. 사용 가능한 언어 목록 표시
   ↓
4. 사용자가 언어 선택
   ↓
5. downloadEpub() 호출
   GET https://your-server.com/books/{code}.epub
   ↓
6. 로컬 저장소에 저장
   ↓
7. 오프라인에서 읽기 가능
```

### 6.3 관련 코드 파일

| 파일 | 역할 |
|------|------|
| `src/shared/services/contentService.ts` | 서버 통신, 다운로드 |
| `src/screens/LanguageDownload/LanguageDownloadScreen.tsx` | 다운로드 UI |
| `src/shared/stores/booksStore.ts` | 다운로드 상태 관리 |

---

## 7. EAS 빌드 및 배포

### 7.1 사전 준비

```bash
# Expo CLI 설치
npm install -g expo-cli eas-cli

# Expo 로그인
npx expo login

# EAS 프로젝트 초기화
npx eas init
```

### 7.2 빌드 프로필

`eas.json`에 3가지 빌드 프로필이 설정되어 있습니다:

| 프로필 | 용도 | Android | iOS |
|--------|------|---------|-----|
| `development` | 개발/디버깅 | APK | Simulator |
| `preview` | 내부 테스트 | APK | Ad-hoc |
| `production` | 스토어 배포 | AAB | App Store |

### 7.3 빌드 명령어

```bash
# 개발용 빌드
npx eas build --profile development --platform android
npx eas build --profile development --platform ios

# 테스트용 빌드 (내부 배포)
npx eas build --profile preview --platform all

# 프로덕션 빌드 (스토어 제출용)
npx eas build --profile production --platform all
```

### 7.4 스토어 제출

#### Android (Google Play)

1. Google Play Console에서 서비스 계정 생성
2. JSON 키 다운로드 → `google-service-account.json`
3. 제출:
```bash
npx eas submit --platform android
```

#### iOS (App Store)

1. Apple Developer Program 가입 ($99/년)
2. App Store Connect에서 앱 생성
3. `eas.json`에 Apple 정보 입력:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD1234"
      }
    }
  }
}
```
4. 제출:
```bash
npx eas submit --platform ios
```

### 7.5 OTA 업데이트 (선택)

JavaScript 코드 변경만 있을 경우 스토어 재제출 없이 업데이트:

```bash
# EAS Update 설정
npx eas update:configure

# 업데이트 배포
npx eas update --branch production --message "버그 수정"
```

---

## 8. 문제 해결

### 8.1 manifest.json 로드 실패

**증상**: 앱에서 언어 목록이 표시되지 않음

**해결**:
1. 서버 URL이 HTTPS인지 확인
2. CORS 설정 확인
3. manifest.json 파일이 존재하는지 확인

```bash
curl https://your-server.com/manifest.json
```

### 8.2 EPUB 다운로드 실패

**증상**: 다운로드가 0%에서 멈춤

**해결**:
1. 파일 경로 확인 (manifest.json의 file 필드)
2. 파일 권한 확인 (public read)
3. 파일 크기가 너무 큰 경우 타임아웃 설정 조정

### 8.3 RTL 언어 표시 문제

**증상**: 아랍어, 히브리어 등이 왼쪽에서 오른쪽으로 표시됨

**해결**:
1. manifest.json에 `rtl: true` 플래그 확인
2. 앱의 `isRTL()` 함수 확인

### 8.4 빌드 실패

**증상**: EAS 빌드가 실패함

**해결**:
```bash
# 캐시 정리
npx expo start --clear

# 의존성 재설치
rm -rf node_modules
npm install

# EAS 빌드 로그 확인
npx eas build:list
```

---

## 부록

### A. 지원 언어 목록

| 코드 | 언어 | 현지명 | RTL |
|------|------|--------|-----|
| en | English | English | |
| ko | Korean | 한국어 | |
| es | Spanish | Español | |
| zh | Chinese | 中文 | |
| ar | Arabic | العربية | ✓ |
| fr | French | Français | |
| pt | Portuguese | Português | |
| ru | Russian | Русский | |
| hi | Hindi | हिन्दी | |
| ja | Japanese | 日本語 | |
| de | German | Deutsch | |
| it | Italian | Italiano | |
| vi | Vietnamese | Tiếng Việt | |
| th | Thai | ไทย | |
| id | Indonesian | Bahasa Indonesia | |
| tr | Turkish | Türkçe | |
| pl | Polish | Polski | |
| uk | Ukrainian | Українська | |
| nl | Dutch | Nederlands | |
| he | Hebrew | עברית | ✓ |
| fa | Persian | فارسی | ✓ |
| ur | Urdu | اردو | ✓ |
| sw | Swahili | Kiswahili | |
| am | Amharic | አማርኛ | |

### B. API 엔드포인트 참조

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/languages` | 모든 언어팩 조회 |
| POST | `/api/languages` | 새 언어팩 업로드 |
| PUT | `/api/languages` | manifest.json 재생성 |
| GET | `/api/languages/{code}` | 특정 언어팩 조회 |
| PATCH | `/api/languages/{code}` | 버전 업데이트 |
| PUT | `/api/languages/{code}` | EPUB 파일 교체 |
| DELETE | `/api/languages/{code}` | 언어팩 삭제 |

### C. 환경 변수 (선택)

```env
# .env.local
NEXT_PUBLIC_APP_NAME=Language Pack Admin
NEXT_PUBLIC_API_URL=https://your-server.com
```

---

## 체크리스트

배포 전 확인사항:

- [ ] Admin 대시보드 로컬 테스트 완료
- [ ] 최소 1개 이상의 언어팩 업로드
- [ ] manifest.json 생성 확인
- [ ] 서버 배포 완료
- [ ] 앱의 CONTENT_BASE_URL 업데이트
- [ ] 앱에서 다운로드 테스트
- [ ] EAS 빌드 테스트
- [ ] 스토어 제출 (해당 시)
