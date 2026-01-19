# The River of God

다국어 EPUB 리더 앱 (React Native / Expo)

## Tech Stack

- **Framework:** Expo (React Native)
- **State Management:** Zustand
- **Navigation:** React Navigation
- **i18n:** i18next
- **TTS:** expo-speech

## Getting Started

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# iOS 실행
npm run ios

# Android 실행
npm run android
```

## 테스트

```bash
# 단위/통합 테스트
npm test

# E2E 테스트
npm run test:e2e
```

---

## 언어팩 추가 및 배포 가이드

### 개요

이 앱은 EPUB 파일을 앱에 번들하여 **완전 오프라인**으로 동작합니다. 새 언어를 추가하려면 CLI 스크립트를 사용하여 소스코드를 수정한 후 앱을 다시 빌드해야 합니다.

### 아키텍처

```
[개발자]
    ↓ npm run add-epub -- --code=ko --file=./book.epub
[CLI 스크립트]
    ↓ 자동 처리
    ├── assets/books/ko.epub (복사)
    ├── assets/manifest.json (생성/업데이트)
    └── src/shared/services/epubService.ts (업데이트)
    ↓ Git commit & push
[EAS Build / CI]
    ↓
[App Store / Play Store 배포]
```

### 사전 준비

```bash
# ts-node 설치 (최초 1회)
npm install -D ts-node
```

### CLI 명령어

#### 현재 언어팩 목록 확인

```bash
npm run list-epubs
```

출력 예시:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Code  Name           Local Name     RTL   File        In Code
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  en    English        English        -     231.0 KB    ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 새 언어 추가

```bash
npm run add-epub -- --code=<언어코드> --file=<EPUB파일경로>
```

예시:
```bash
# 한국어 추가
npm run add-epub -- --code=ko --file=./downloads/book-korean.epub

# 아랍어 추가 (RTL 언어)
npm run add-epub -- --code=ar --file=./downloads/book-arabic.epub
```

스크립트가 자동으로 수행하는 작업:
1. EPUB 파일을 `assets/books/{code}.epub`로 복사
2. `epubService.ts`의 `BUNDLED_EPUBS` 객체에 require 구문 추가
3. `manifest.json`에 언어 정보 기록

#### 언어 삭제

```bash
npm run remove-epub -- --code=<언어코드>
```

예시:
```bash
npm run remove-epub -- --code=ko
```

> **주의:** 기본 언어인 `en`(영어)는 삭제할 수 없습니다.

### 지원 가능한 언어 코드

| 코드 | 언어 | 현지 이름 | RTL |
|------|------|-----------|-----|
| en | English | English | - |
| ko | Korean | 한국어 | - |
| es | Spanish | Español | - |
| zh | Chinese | 中文 | - |
| ar | Arabic | العربية | ✓ |
| fr | French | Français | - |
| pt | Portuguese | Português | - |
| ru | Russian | Русский | - |
| hi | Hindi | हिन्दी | - |
| ja | Japanese | 日本語 | - |
| de | German | Deutsch | - |
| it | Italian | Italiano | - |
| vi | Vietnamese | Tiếng Việt | - |
| th | Thai | ไทย | - |
| id | Indonesian | Bahasa Indonesia | - |
| tr | Turkish | Türkçe | - |
| pl | Polish | Polski | - |
| uk | Ukrainian | Українська | - |
| nl | Dutch | Nederlands | - |
| he | Hebrew | עברית | ✓ |
| fa | Persian | فارسی | ✓ |
| ur | Urdu | اردو | ✓ |
| sw | Swahili | Kiswahili | - |
| am | Amharic | አማርኛ | - |

### 전체 배포 워크플로우

```bash
# 1. 번역된 EPUB 파일 준비
#    (번역가로부터 book-korean.epub 파일 수령)

# 2. 언어팩 추가
npm run add-epub -- --code=ko --file=./book-korean.epub

# 3. 변경사항 확인
npm run list-epubs
git status

# 4. Git 커밋
git add assets/ src/shared/services/epubService.ts
git commit -m "Add Korean language pack"
git push

# 5. EAS 빌드 (또는 CI/CD 자동 실행)
eas build --platform all

# 6. 스토어 제출
eas submit --platform all

# 7. (선택) App Store Connect / Play Console에서 IAP 설정
#    - 새 언어에 대한 인앱 구매 상품 추가
```

### 주의사항

- **빌드 필수:** 언어를 추가/삭제한 후에는 반드시 앱을 다시 빌드해야 합니다. OTA 업데이트로는 EPUB 파일이 반영되지 않습니다.
- **파일 크기:** 각 EPUB 파일은 앱 크기에 직접 영향을 줍니다. 파일 크기를 확인하세요.
- **RTL 언어:** 아랍어, 히브리어, 페르시아어, 우르두어는 자동으로 RTL(오른쪽에서 왼쪽) 레이아웃이 적용됩니다.

### 문제 해결

#### "ts-node: command not found"
```bash
npm install -D ts-node
```

#### "Invalid language code"
`scripts/languages.ts`에 정의된 언어 코드만 사용 가능합니다. 새 언어 코드가 필요하면 해당 파일에 추가하세요.

#### 빌드 후에도 새 언어가 안 보임
- `npm run list-epubs`로 언어가 제대로 추가되었는지 확인
- `epubService.ts`의 `BUNDLED_EPUBS` 객체에 해당 언어가 있는지 확인
- Metro 캐시 삭제 후 재빌드: `npx expo start --clear`

---

## 프로젝트 구조

```
theriverofgod/
├── assets/
│   └── books/           # 번들된 EPUB 파일들
├── scripts/             # CLI 스크립트
│   ├── add-epub.ts
│   ├── remove-epub.ts
│   ├── list-epubs.ts
│   └── languages.ts
├── src/
│   ├── screens/         # 화면 컴포넌트
│   ├── shared/
│   │   ├── components/  # 공유 UI 컴포넌트
│   │   ├── services/    # API, TTS 등 서비스
│   │   ├── stores/      # Zustand 스토어
│   │   └── hooks/       # 커스텀 훅
│   └── navigation/      # 네비게이션 설정
└── package.json
```

## License

Private - All rights reserved
