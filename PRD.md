# The River of God - Product Requirements Document

## 1. Project Vision & Mission

### 1.1 Mission Statement
> "하나님의 복음이 언어, 기술, 경제적 장벽으로 인해 도달하지 못하는 곳에
> 적정기술을 통해 하나님의 강(The River of God)이 흘러가게 한다."

### 1.2 Problem Statement
- Amazon Kindle 등 주요 플랫폼에서 특정 언어권의 기독교 콘텐츠가 절대적으로 부족
- 선진국/기독교 전파 지역과 그렇지 않은 지역 간 콘텐츠 접근성 격차
- 고사양 기기/최신 OS/안정적 인터넷을 전제로 한 앱들은 실제 필요한 곳에서 작동하지 않음

### 1.3 Solution
"The River of God" 서적을 시작으로, 다국어 기독교 콘텐츠를 전 세계 누구나 접근 가능한
iOS/Android 앱을 통해 제공. **적정기술(Appropriate Technology)** 원칙에 따라 설계.

---

## 2. Target Users

### 2.1 Primary Users
| 사용자 유형 | 특성 | 제약사항 |
|------------|------|----------|
| 개발도상국 신자/구도자 | 모국어 기독교 콘텐츠 부족 | 저사양 기기, 제한된 데이터, 구형 OS |
| 선교지 현지인 | 번역된 콘텐츠 필요 | 오프라인 환경 빈번 |
| 선교사/사역자 | 콘텐츠 배포 도구 필요 | 다양한 언어 동시 필요 |
| 일반 신자 | 영성 서적 읽기 | 제약 적음 |

### 2.2 User Personas

**Persona 1: 아프리카 농촌 지역 청년 (Primary)**
- 기기: 중고 Android (Android 8-10)
- 네트워크: 간헐적 2G/3G, WiFi 없음
- 언어: 스와힐리어/현지어 + 영어 일부
- 니즈: 모국어로 된 영성 서적, 오디오로 듣기 (문해력 제한)

**Persona 2: 동남아 도시 청년**
- 기기: 중저가 Android (Android 10+)
- 네트워크: 모바일 데이터 (비용 부담)
- 언어: 현지어 + 영어
- 니즈: 출퇴근 중 읽기/듣기, 오프라인 저장

**Persona 3: 선진국 신자**
- 기기: 최신 iOS/Android
- 네트워크: 안정적
- 언어: 영어/한국어/기타
- 니즈: 깔끔한 UI, 북마크/하이라이트

---

## 3. Appropriate Technology Principles (적정기술 원칙)

### 3.1 Core Design Philosophy
```
"가장 열악한 환경에서도 작동해야 한다"
"없는 것이 아니라, 있는 것으로 최선을 다한다"
```

### 3.2 Technical Constraints & Solutions

| 제약사항 | 설계 원칙 | 구현 전략 |
|---------|----------|----------|
| **구형 OS** | 하위 호환성 우선 | Android 7+ (API 24), iOS 12+ 지원 |
| **저사양 기기** | 경량화 | 앱 크기 <30MB, 메모리 <100MB |
| **제한된 데이터** | Offline-First | 콘텐츠 사전 다운로드, 증분 동기화 |
| **불안정한 연결** | Resilient Sync | 재시도 로직, 부분 다운로드 resume |
| **제한된 예산** | 크로스플랫폼 | React Native 단일 코드베이스 |

### 3.3 Progressive Enhancement Strategy
```
Level 0 (Core): 텍스트 읽기 + 오프라인 저장
Level 1: 북마크/하이라이트 + 읽기 진행률
Level 2: TTS (OS 네이티브)
Level 3: 클라우드 동기화 + 추가 콘텐츠 다운로드
Level 4: 커뮤니티 기능 (향후)
```
→ 네트워크/기기 상황에 따라 기능 자동 조절

---

## 4. Feature Requirements

### 4.1 MVP Features (Phase 1)

#### F1. EPUB Reader (Core)
| 항목 | 요구사항 |
|-----|---------|
| 기능 | EPUB 파싱 및 렌더링 |
| 지원 형식 | EPUB 2.0/3.0 |
| 렌더링 엔진 | epub.js + WebView |
| 렌더링 | 챕터 단위 lazy loading |
| 성능 | 1000페이지 책 3초 내 로딩 |
| 오프라인 | 100% 오프라인 동작 |

**읽기 모드:**
```
읽기 화면에서 전환 가능:

[페이지 모드]     [스크롤 모드]
┌──────────┐     ┌──────────┐
│ 페이지 1  │     │ 내용...   │
│          │     │ 내용...   │ ↕
│  ← → 넘김│     │ 내용...   │
└──────────┘     └──────────┘

- 페이지 모드: 좌우 스와이프 (Kindle 스타일)
- 스크롤 모드: 위아래 스크롤 (웹 스타일)
- 사용자 선호에 따라 읽기 화면에서 즉시 전환
```

**저장소:**
```
EPUB 파일 저장: 앱 내부 저장소

장점:
- 보안 (다른 앱 접근 불가)
- 앱 삭제 시 자동 정리
- iOS/Android 동일 동작

위치:
- iOS: Application Support
- Android: Internal Storage (/data/data/...)
```

#### F2. Reading Experience
| 항목 | 요구사항 |
|-----|---------|
| 폰트 크기 | 12pt ~ 32pt 조절 (시니어 고려) |
| 테마 | 밝음/어두움/세피아 |
| 줄간격/여백 | 조절 가능 |
| 야간 모드 | 눈 피로 감소 |
| 가로/세로 | 회전 지원 |

#### F3. Bookmark & Highlight
| 항목 | 요구사항 |
|-----|---------|
| 북마크 | 무제한 저장, 로컬 우선 |
| 하이라이트 | 색상 선택 (4색) |
| 메모 | 텍스트 메모 추가 |
| 내보내기 | 하이라이트/메모 텍스트 내보내기 |

#### F4. Offline Storage
| 항목 | 요구사항 |
|-----|---------|
| 저장 위치 | 기기 내부 저장소 |
| 용량 관리 | 콘텐츠별 삭제 가능 |
| 데이터 | SQLite (구조화 데이터) + 파일시스템 (콘텐츠) |

#### F5. Multi-Language Support
| 항목 | 요구사항 |
|-----|---------|
| UI 언어 | 영어, 한국어 (MVP), 확장 가능 구조 |
| 콘텐츠 언어 | 다국어 콘텐츠 독립 관리 |
| 언어 전환 | 앱 내 전환 (재시작 필요) |
| RTL | 아랍어 등 RTL 언어 MVP부터 지원 |

**RTL (Right-to-Left) 지원:**
```
지원 언어: 아랍어(ar), 히브리어(he), 페르시아어(fa), 우르두어(ur)

적용 범위:
├── 앱 UI 전체 (I18nManager.forceRTL)
├── EPUB 콘텐츠 (epub.js 자동 처리)
├── 페이지 넘김 방향 (← 가 다음 페이지)
└── 텍스트 정렬

언어 변경 시:
1. 사용자가 RTL 언어 선택
2. "앱을 재시작합니다" 안내
3. 앱 재시작 후 RTL 적용
→ 일반적인 UX 패턴, 사용자 수용 가능
```

**다국어 UI 텍스트 처리:**
```
문제: 언어별 텍스트 길이 차이
- "Settings" (EN) vs "الإعدادات" (AR) vs "Einstellungen" (DE)
- 고정 너비 사용 시 텍스트 잘림 발생

해결 방안:
1. Flexible Layout
   - 고정 width 지양
   - flex, flexShrink, flexWrap 활용

2. 텍스트 처리
   - adjustsFontSizeToFit (자동 폰트 축소)
   - numberOfLines + ellipsizeMode (최후 수단)

3. 테스트 전략
   - 가장 긴 번역 기준 UI 검증 (독일어, 아랍어)
   - 최소 너비에서 레이아웃 깨짐 확인

설계 원칙:
- 버튼/라벨에 고정 width 사용 금지
- 아이콘 + 텍스트 조합 시 충분한 여백
- 중요 UI는 아이콘 우선, 텍스트 보조
```

### 4.2 Phase 2 Features

#### F6. Text-to-Speech (TTS)
| 항목 | 요구사항 |
|-----|---------|
| 엔진 | iOS/Android 네이티브 TTS (expo-speech) |
| 음성 | OS 설치 음성 활용 |
| 제어 | 재생/일시정지/속도조절 |
| 동기화 | 읽는 위치 하이라이트 |
| Fallback | TTS 미지원 시 graceful degradation |

**TTS 음성 품질 자동 선택:**
```
앱 동작 방식:
1. getAvailableVoicesAsync()로 설치된 음성 목록 조회
2. 해당 언어의 음성 중 최고 품질 자동 선택
   - iOS: Enhanced/Premium > Default
   - Android: High Quality > Default
3. Enhanced 음성 없을 경우 사용자에게 안내
   - "더 나은 음성을 원하시면 설정에서 다운로드하세요"
   - iOS: 설정 > 손쉬운 사용 > 음성 콘텐츠
   - Android: 설정 > 언어 및 입력 > TTS 출력

음성 품질 티어 (iOS):
- Tier 1: Compact (기본, 용량 작음, 품질 낮음)
- Tier 2: Enhanced (다운로드 필요, ~100MB, 품질 좋음)
- Tier 3: Premium (iOS 17+, Siri 음성 기반, 최고 품질)
```

**TTS OS 버전별 전략:**
```
Android 9+: 다양한 언어/음성 지원
iOS 12-13: 기본 TTS
iOS 14+: Enhanced voices 지원
iOS 17+: Premium voices 지원

→ OS 버전 감지 후 지원 언어/기능 동적 표시
→ 미지원 언어는 "음성 미지원" 안내 + 텍스트 읽기로 fallback
```

#### F7. Analytics (최소)
| 항목 | 요구사항 |
|-----|---------|
| 도구 | Firebase Analytics |
| 수집 범위 | 최소한 (앱 실행, 세션, 크래시) |
| ATT 팝업 | 불필요 (광고 추적 안 함) |
| 필요 작업 | Privacy Policy + App Store Privacy Labels |

**커스텀 이벤트 (선택):**
```
- book_downloaded: 언어별 다운로드 수
- reading_completed: 완독률
→ 번역 우선순위 결정에 활용
```

#### F8. Content Download & Sync
| 항목 | 요구사항 |
|-----|---------|
| 다운로드 | 백그라운드 다운로드 |
| Resume | 중단된 다운로드 이어받기 |
| 압축 | gzip 압축 전송 |
| 증분 업데이트 | 변경분만 다운로드 |

#### F9. Typography System (다국어 타이포그래피)

| 항목 | 요구사항 |
|-----|---------|
| 기본 폰트 | Google Noto Font Family (OFL 라이선스) |
| 폰트 크기 | 14pt ~ 32pt (F2와 동일) |
| 폰트 로딩 | 계층적 로딩 (Core + On-demand) |
| Fallback | 시스템 폰트 자동 전환 |
| 총 크기 | < 8MB (앱 크기 예산 내) |

**스크립트별 폰트 매핑:**
| 스크립트 | 폰트 | 지원 언어 | 예상 크기 |
|---------|------|----------|----------|
| Latin | Noto Sans | en, vi, sw, id, fr, es, pt, de, it | ~100KB |
| CJK | Noto Sans CJK | ko, zh, ja | ~5.5MB (서브셋) |
| Arabic | Noto Sans Arabic | ar, fa, ur | ~150KB |
| Hebrew | Noto Sans Hebrew | he | ~100KB |
| Indic | Noto Sans Devanagari | hi | ~150KB |
| Ethiopic | Noto Sans Ethiopic | am | ~200KB |

**폰트 로딩 전략:**
```
Level 0: Core Latin (항상 번들) - ~100KB
Level 1: 사용자 UI 언어 폰트 (앱 시작 시)
Level 2: 콘텐츠 언어 폰트 (책 열 때)
Level 3: 추가 언어 (다운로드 시)
```

**시스템 폰트 Fallback:**
```css
/* iOS */
font-family: 'NotoSans', 'SF Pro', '-apple-system', sans-serif;
font-family: 'NotoSansKR', 'Apple SD Gothic Neo', sans-serif;
font-family: 'NotoSansArabic', 'Geeza Pro', sans-serif;

/* Android */
font-family: 'NotoSans', 'Roboto', sans-serif;
font-family: 'NotoSansKR', 'Source Han Sans KR', sans-serif;
```

**최적화 전략:**
- CJK 폰트: 상용 3,000자 서브셋 사용 (전체 폰트 대비 70% 크기 절감)
- Variable Font: Regular/Bold 단일 파일로 용량 절약
- WOFF2 형식: WebView용 (30% 압축)
- TTF 형식: Native 컴포넌트용

### 4.3 Phase 3 Features (Future)
- 스플래시 화면 (언어별 환영 메시지)
- 읽기 통계/목표
- 커뮤니티 (나눔, 기도제목)
- 전문 오디오북 (낭독 녹음)
- 오프라인 공유 (Bluetooth/WiFi Direct)
- Screen Reader 지원 강화 (VoiceOver/TalkBack)

---

## 5. Technical Architecture

### 5.1 Technology Stack

| Layer | Technology | 선택 이유 |
|-------|-----------|----------|
| Framework | Expo (React Native) | 관리형 워크플로우, 업데이트 간소화, 빌드 자동화 |
| Build | EAS Build | 클라우드 빌드, CI/CD 통합 |
| Submit | EAS Submit | 스토어 자동 제출 |
| Metadata | Fastlane | 다국어 메타데이터(ASO) 자동화 |
| Navigation | React Navigation 6 | 표준, 성능 최적화됨 |
| State | Zustand | 경량, 간단, 번들 크기 작음 |
| Storage | expo-sqlite | 오프라인, 구조화 쿼리, 저사양 호환 |
| EPUB | epub.js + WebView | 안정적, 커뮤니티 활발, 페이지/스크롤 모드 지원 |
| TTS | expo-speech | 네이티브 TTS 래퍼, 음성 품질 자동 선택 |
| i18n | i18next + react-i18next | 표준, 다국어 확장 용이 |
| HTTP | axios | 안정적, 인터셉터 |
| IAP | expo-in-app-purchases | 인앱 결제 (Plus 기능) |
| Hosting | Firebase Hosting | 콘텐츠(EPUB) 배포, 무료 티어 활용 |
| Testing | Detox + Jest | E2E 테스트, Expo 공식 지원 |

### 5.2 Project Structure
```
theriverofgod/
├── src/
│   ├── app/                    # App entry, navigation
│   ├── features/
│   │   ├── reader/             # EPUB reader
│   │   ├── library/            # Book library
│   │   ├── bookmarks/          # Bookmarks & highlights
│   │   ├── tts/                # Text-to-speech
│   │   └── settings/           # User settings
│   ├── shared/
│   │   ├── components/         # Reusable UI
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Utilities
│   │   └── services/           # API, storage services
│   ├── i18n/                   # Translations
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   ├── ko.json
│   │   │   └── ...
│   │   └── index.ts
│   └── assets/                 # Fonts, images
├── content/                    # Bundled EPUB content
│   ├── the-river-of-god/
│   │   ├── en/
│   │   ├── ko/
│   │   └── ...
├── android/
├── ios/
├── __tests__/
└── docs/
    └── PRD.md
```

### 5.3 Data Architecture

**Local Database Schema (SQLite):**
```sql
-- Books metadata
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  language TEXT NOT NULL,
  version TEXT,
  is_bundled INTEGER DEFAULT 0,
  is_downloaded INTEGER DEFAULT 0,
  file_path TEXT,
  cover_path TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- Reading progress
CREATE TABLE reading_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  chapter_id TEXT,
  position REAL,  -- 0.0 ~ 1.0
  updated_at INTEGER,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Bookmarks
CREATE TABLE bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  position REAL,
  title TEXT,
  created_at INTEGER,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Highlights
CREATE TABLE highlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  start_offset INTEGER,
  end_offset INTEGER,
  text TEXT,
  color TEXT DEFAULT 'yellow',
  note TEXT,
  created_at INTEGER,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- User settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### 5.4 Offline-First Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React Native App                  │
├─────────────────────────────────────────────────────┤
│  UI Layer (Components)                              │
├─────────────────────────────────────────────────────┤
│  State Layer (Zustand)                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ bookStore   │ │ readerStore │ │ settingsStore│   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────┤
│  Service Layer                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ EPUBService │ │ TTSService  │ │ SyncService │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────┤
│  Data Layer                                          │
│  ┌─────────────────────────┐ ┌─────────────────┐   │
│  │ SQLite (structured)     │ │ FileSystem      │   │
│  │ - bookmarks, progress   │ │ - EPUB files    │   │
│  │ - settings, metadata    │ │ - covers        │   │
│  └─────────────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────┤
│  Network Layer (Optional)                            │
│  ┌─────────────────────────────────────────────┐   │
│  │ Content API (download new content)           │   │
│  │ - Retry logic, resume downloads              │   │
│  │ - Compression, incremental sync              │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 6. Performance Requirements

### 6.1 App Size & Memory
| Metric | Target | Rationale |
|--------|--------|-----------|
| APK/IPA 크기 | < 30MB (콘텐츠 제외) | 저용량 기기, 데이터 비용 |
| 콘텐츠 포함 | < 50MB | 기본 콘텐츠 1-2권 포함 |
| 런타임 메모리 | < 100MB | 저사양 기기 (2GB RAM) |
| 배터리 | TTS 1시간 < 5% 소모 | 전력 효율 |

### 6.2 Performance Targets
| Action | Target | Condition |
|--------|--------|-----------|
| 앱 시작 | < 3초 | Cold start, 저사양 기기 |
| 책 열기 | < 2초 | 500페이지 책 |
| 페이지 넘김 | < 100ms | 즉각 반응 |
| 검색 | < 1초 | 전체 책 검색 |
| 다운로드 | Resume 지원 | 불안정한 네트워크 |

### 6.3 OS Compatibility
| Platform | Minimum | Recommended | Coverage |
|----------|---------|-------------|----------|
| Android | 9.0 (API 28) | 10+ (API 29) | ~93% 기기 |
| iOS | 12.0 | 14+ | ~95% 기기 |

---

## 7. Localization Strategy

### 7.1 Language Tiers

**Tier 1 (MVP):**
- English (en)
- 한국어 (ko)

**Tier 2 (Phase 2):**
- 中文 简体 (zh-CN)
- 日本語 (ja)
- Español (es)
- Français (fr)

**Tier 3 (Phase 3 - Mission Languages):**
- Swahili (sw)
- Hindi (hi)
- Indonesian (id)
- Vietnamese (vi)
- Arabic (ar) - RTL 지원 필요
- Amharic (am)
- 기타 요청 언어

### 7.2 Content vs UI Localization
```
┌─────────────────────────────────────────┐
│           Localization Layers           │
├─────────────────────────────────────────┤
│ UI Strings (i18next)                    │
│ - 버튼, 메뉴, 시스템 메시지             │
│ - JSON 파일로 관리                      │
├─────────────────────────────────────────┤
│ Content (EPUB per language)             │
│ - 책 콘텐츠는 언어별 EPUB 파일          │
│ - 번역본 독립 관리                      │
├─────────────────────────────────────────┤
│ TTS (OS dependent)                      │
│ - OS 설치 언어팩에 의존                 │
│ - 미지원 언어 graceful fallback         │
└─────────────────────────────────────────┘
```

---

## 8. UI/UX & Accessibility

### 8.1 Design Principles
```
핵심 원칙: 단순함 (Simplicity)
- 하나의 통일된 UI (별도 간편 모드 없음)
- 기능 최소화, 핵심에 집중
- 전체 연령대가 사용 가능한 직관적 설계
```

### 8.2 Typography (EPUB 리더 컨벤션)
```
본문 폰트 조절:
- 범위: 14pt ~ 32pt
- 조절 방식: 슬라이더 또는 프리셋 (작게/보통/크게/매우크게)
- 본문만 조절, 앱 UI는 시스템 설정 따름

앱 UI:
- 시스템 접근성 설정 연동
- 별도 조절 불필요
```

### 8.3 Navigation
```
하단 탭바 방식 (단순, 명확):
├── 📚 서재 (Library)
├── 📖 읽기 (Reading) - 현재 책
└── ⚙️ 설정 (Settings)
```

### 8.4 App Icon
```
디자인 원칙:
- 언어 중립적 (텍스트 없음)
- 강물/물결 심볼 또는 추상적 로고
- 전 세계 동일한 아이콘 사용

예시 콘셉트:
- 흐르는 강물 그래픽
- 책 + 물결 조합
- 심플한 심볼
```

### 8.5 Onboarding (첫 실행)
```
1. 언어 선택 화면
   → 기기 언어 자동 감지, 변경 가능

2. 콘텐츠 다운로드
   → 선택한 언어의 EPUB 다운로드

3. 서재로 이동
   → 바로 읽기 시작

원칙: 최소 단계, 빠르게 콘텐츠 접근
```

### 8.6 Error & Offline States
```
오프라인 상태:
- 다운로드된 콘텐츠는 정상 이용
- 새 다운로드 시도 시 "인터넷 연결 필요" 안내

다운로드 실패:
- 재시도 버튼 제공
- 부분 다운로드 resume 지원

일반 에러:
- 친화적 메시지 (기술 용어 지양)
- 가능한 해결 방법 안내
```

### 8.7 Touch Targets
- 최소 48x48dp (Google 권장)
- 버튼 간 충분한 간격
- 한 손 조작 고려

### 8.8 Visual Design
- 테마: 밝음/어두움/세피아
- 충분한 색상 대비 (WCAG AA 기준)
- 색맹 지원: MVP에서 제외 (추후 검토)

### 8.9 Legal (Privacy Policy / Terms)
```
호스팅: Firebase Hosting (EPUB과 동일)

구조:
firebase-hosting/
├── epub/
├── manifest.json
├── privacy.html    ← Privacy Policy
└── terms.html      ← Terms of Service

URL:
- https://[project].web.app/privacy
- https://[project].web.app/terms

→ 스토어 등록 시 위 URL 사용
→ 추가 비용 없음 (기존 인프라 활용)
```

---

## 9. Versioning & CI/CD

### 9.1 버전 관리 전략
```
Semantic Versioning: v[major].[minor].[patch] (Build [number])

예시:
v1.0.0 (Build 1)  - 최초 출시
v1.0.1 (Build 2)  - 버그 수정
v1.1.0 (Build 5)  - 새 기능 (TTS 등)
v1.2.0 (Build 8)  - 새 언어 추가
v2.0.0 (Build 15) - 대규모 변경

Build Number: EAS에서 자동 증가 (autoIncrement: true)
```

### 9.2 CI/CD 단계별 계획
```
Phase 1 (MVP):
- 수동 빌드: eas build --platform all
- 수동 제출: eas submit
- 버전은 수동 관리

Phase 2 이후 (자동화):
- GitHub Actions 연동
- 테스트 통과 시 자동 빌드
- 버전 자동 증가 & 커밋
- 스토어 자동 제출
```

### 9.3 배포 자동화 파이프라인 (Phase 2)
```
코드 푸시 (main branch)
        ↓
   GitHub Actions
        ↓
┌───────────────────────────┐
│      EAS Build            │
│  (iOS + Android 동시)     │
└───────────────────────────┘
        ↓
┌───────────────────────────┐
│      EAS Submit           │
│  (App Store + Play Store) │
└───────────────────────────┘
        ↓
┌───────────────────────────┐
│      Fastlane             │
│  (다국어 메타데이터 업로드) │
└───────────────────────────┘
```

### 9.2 메타데이터 관리 구조
```
fastlane/
├── metadata/
│   ├── en-US/
│   │   ├── name.txt           # "The River of God"
│   │   ├── subtitle.txt       # iOS only
│   │   ├── description.txt
│   │   ├── keywords.txt       # iOS only
│   │   └── release_notes.txt
│   ├── ko/
│   │   ├── name.txt           # "하나님의 강"
│   │   └── ...
│   └── ar/
│       └── ...
└── screenshots/
    ├── en-US/
    └── ko/
```

### 9.3 배포 명령어
```bash
# 로컬에서 수동 배포
eas build --platform all
eas submit --platform all
fastlane deliver        # iOS 메타데이터
fastlane supply         # Android 메타데이터

# CI/CD 자동 배포
git push origin main    # 자동 트리거
```

---

## 10. Testing Strategy

### 10.1 테스트 도구
| 레벨 | 도구 | 용도 |
|-----|-----|-----|
| Unit Test | Jest | 개별 함수/유틸리티 |
| Component Test | React Native Testing Library | UI 컴포넌트 |
| E2E Test | Detox | 전체 앱 시나리오 |
| Manual Test | 실제 기기 | 최종 검증 |

### 10.2 Detox (E2E 테스트)
```
선택 이유:
- Expo 공식 지원 (공식 문서 있음)
- React Native 특화 (gray-box 테스트)
- JavaScript (앱 코드와 동일 언어)
- RN 라이프사이클 동기화

Claude 연동:
- Claude가 Detox 테스트 코드 작성
- Bash로 테스트 실행: npx detox test
- 결과 분석 및 코드 수정
```

### 10.3 테스트 시나리오 (핵심)
```
1. 앱 실행 및 언어 선택
2. EPUB 다운로드
3. 책 열기 및 읽기
4. 페이지/스크롤 모드 전환
5. 북마크 추가/삭제
6. 하이라이트 생성
7. TTS 재생/정지
8. 설정 변경 (폰트 크기, 테마)
9. RTL 언어 전환 및 레이아웃 확인
```

### 10.4 수동 테스트
```
필수 항목:
- 저사양 기기 성능 확인
- RTL 언어 레이아웃
- 다양한 OS 버전
- 오프라인 동작
- TTS 음성 품질
```

### 10.5 테스트 작성 규칙 (필수)
```
모든 코드 변경 시 테스트 작성 필수:

1. 버그 수정 (Bug Fix)
   - 버그 재현 테스트 먼저 작성
   - 수정 후 테스트 통과 확인
   - 관련 엣지 케이스 테스트 추가

2. 새 기능 구현 (New Feature)
   - 기능 요구사항 기반 테스트 작성
   - Happy path + Error path 모두 커버
   - 통합 테스트 포함

3. 리팩토링 (Refactoring)
   - 기존 동작 보장 테스트 먼저 확인
   - 변경 후 모든 기존 테스트 통과 확인

4. 테스트 커버리지 목표
   - 핵심 비즈니스 로직: > 80%
   - 유틸리티 함수: > 90%
   - UI 컴포넌트: 주요 상호작용 테스트

테스트 위치:
- __tests__/unit/       # 단위 테스트
- __tests__/integration/ # 통합 테스트
- e2e/                  # Detox E2E 테스트
```

---

## 11. Development Roadmap

### Phase 1: MVP (Core Reading Experience)
```
Duration: 8-10 weeks

Week 1-2: Project Setup
- React Native 프로젝트 초기화
- 기본 네비게이션 구조
- SQLite 설정
- i18n 기본 구조

Week 3-4: EPUB Reader Core
- EPUB 파싱 로직
- 기본 렌더링 (WebView 또는 커스텀)
- 챕터 네비게이션
- 읽기 진행률 저장

Week 5-6: Reading Experience
- 폰트/테마 설정
- 북마크 기능
- 하이라이트 기능
- 설정 화면

Week 7-8: Library & Content
- 서재 화면
- 번들 콘텐츠 통합
- 콘텐츠 메타데이터 관리

Week 9-10: Polish & Testing
- 성능 최적화
- 저사양 기기 테스트
- 버그 수정
- 베타 빌드
```

### Phase 2: Enhanced Features
```
Duration: 4-6 weeks

- TTS 통합 (네이티브 브릿지)
- 콘텐츠 다운로드 기능
- 추가 언어 지원
- 클라우드 백업 (선택적)
```

### Phase 3: Expansion
```
Duration: Ongoing

- 추가 콘텐츠/언어
- 오프라인 공유 기능
- 커뮤니티 기능
- 전문 오디오북
```

---

## 10. Success Metrics

### 10.1 Core Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| 앱 설치 | - | Store analytics |
| MAU | - | Analytics |
| 읽기 완독률 | > 30% | 앱 내 측정 |
| 앱 크래시율 | < 0.5% | Crashlytics |
| 앱 평점 | > 4.5 | Store rating |

### 10.2 Mission Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| 지원 언어 수 | 10+ (1년 내) | 내부 |
| 미전도 지역 다운로드 | 측정 | Store analytics by region |
| 콘텐츠 공유 횟수 | 측정 | 앱 내 측정 |

---

## 11. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| EPUB 파싱 복잡성 | High | 검증된 라이브러리 사용, 커스텀 fallback |
| TTS 언어 미지원 | Medium | Graceful degradation, 안내 메시지 |
| 저사양 기기 성능 | High | 철저한 테스트, lazy loading |
| 네트워크 불안정 | Medium | Offline-first, retry 로직 |
| 스토어 정책 변경 | Low | 정책 모니터링 |

---

## 12. Open Questions

1. **EPUB 렌더링 방식**: WebView vs 커스텀 렌더러?
   - WebView: 구현 쉬움, 메모리 사용 높음
   - 커스텀: 성능 좋음, 구현 복잡

2. **백엔드 필요성**: 콘텐츠 배포를 위한 간단한 API 서버 필요?
   - 옵션 A: 앱 업데이트로 콘텐츠 추가
   - 옵션 B: 간단한 콘텐츠 서버 (S3 + CloudFront)
   - 옵션 C: Firebase 활용

3. **TTS 대안**: OS TTS 품질이 낮은 언어에 대한 대안?
   - Google Cloud TTS (비용 발생)
   - 자원봉사 낭독 녹음

4. **오프라인 공유**: Bluetooth/WiFi Direct 공유 기능 우선순위?

---

## Appendix A: Reference Apps

| App | 참고할 점 |
|-----|----------|
| YouVersion Bible | 다국어, 오프라인, TTS |
| Kindle | 읽기 경험, 하이라이트 |
| Libby | EPUB 렌더링 |
| 교보문고 eBook | 한글 렌더링 |

---

---

*Last Updated: 2026-01-05*
*Version: 1.0.0*
*Status: Final Draft - Ready for Development*
