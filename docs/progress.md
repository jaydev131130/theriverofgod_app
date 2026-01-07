# The River of God - Implementation Progress

*Last Updated: 2026-01-06*

---

## Summary

| Phase | Progress | Status |
|-------|----------|--------|
| **Phase 1 (MVP)** | **75%** | In Progress |
| **Phase 2** | **40%** | Partial |
| **Phase 3** | **0%** | Not Started |
| **Testing** | **50%** | Jest only |

---

## Phase 1: MVP Features (75%)

### F1. EPUB Reader (Core) - 90%
| Requirement | Status | Notes |
|-------------|--------|-------|
| EPUB 파싱 및 렌더링 | ✅ | epub.js + WebView |
| EPUB 2.0/3.0 지원 | ✅ | epub.js 자동 지원 |
| 챕터 단위 lazy loading | ✅ | rendition.display() |
| 페이지 모드 | ✅ | 좌우 스와이프 |
| 스크롤 모드 | ✅ | flow: "scrolled" |
| 오프라인 동작 | ✅ | 로컬 EPUB 파일 |
| 성능 (3초 내 로딩) | ⚠️ | 테스트 필요 |

### F2. Reading Experience - 80%
| Requirement | Status | Notes |
|-------------|--------|-------|
| 폰트 크기 조절 (12-32pt) | ✅ | 14-32pt (Small/Medium/Large/XLarge) |
| 테마 (밝음/어두움/세피아) | ✅ | Light/Dark/Sepia |
| 줄간격/여백 조절 | ❌ | 미구현 |
| 야간 모드 | ✅ | Dark theme |
| 가로/세로 회전 | ✅ | 자동 지원 |

### F3. Bookmark & Highlight - 30%
| Requirement | Status | Notes |
|-------------|--------|-------|
| 북마크 저장 | ⚠️ | Store 존재, UI 미구현 |
| 하이라이트 (4색) | ⚠️ | Store 존재, UI 미구현 |
| 메모 추가 | ❌ | 미구현 |
| 내보내기 | ❌ | 미구현 |

### F4. Offline Storage - 100%
| Requirement | Status | Notes |
|-------------|--------|-------|
| 기기 내부 저장소 | ✅ | FileSystem.documentDirectory |
| 용량 관리 (삭제 가능) | ✅ | 책 삭제 기능 |
| SQLite 데이터 | ✅ | database.ts |

### F5. Multi-Language Support - 60%
| Requirement | Status | Notes |
|-------------|--------|-------|
| UI 언어 (영어/한국어) | ✅ | i18next + JSON files |
| 콘텐츠 다국어 관리 | ✅ | 언어별 EPUB |
| 언어 전환 | ✅ | Settings에서 전환 |
| RTL 지원 | ❌ | 미구현 |

---

## Phase 2: Enhanced Features (40%)

### F6. Text-to-Speech (TTS) - 90%
| Requirement | Status | Notes |
|-------------|--------|-------|
| 네이티브 TTS (expo-speech) | ✅ | ttsService.ts |
| OS 설치 음성 활용 | ✅ | getBestVoiceForLanguage() |
| 재생/일시정지/속도조절 | ✅ | play/pause, SPEED_PRESETS |
| 현재 페이지만 읽기 | ✅ | speakPageText 메시지 |
| 읽는 위치 하이라이트 | ❌ | 미구현 |
| Fallback (graceful degradation) | ✅ | 에러 핸들링 |

### F7. Analytics - 0%
| Requirement | Status | Notes |
|-------------|--------|-------|
| Firebase Analytics | ❌ | 미구현 |
| 앱 실행/세션/크래시 | ❌ | 미구현 |
| 커스텀 이벤트 | ❌ | 미구현 |

### F8. Content Download & Sync - 60%
| Requirement | Status | Notes |
|-------------|--------|-------|
| 콘텐츠 다운로드 | ✅ | contentService.ts |
| 백그라운드 다운로드 | ⚠️ | 기본 다운로드만 |
| Resume (이어받기) | ❌ | 미구현 |
| gzip 압축 | ❌ | 미구현 |
| 증분 업데이트 | ❌ | 미구현 |

### F9. Typography System - 10%
| Requirement | Status | Notes |
|-------------|--------|-------|
| Google Noto Font Family | ❌ | 미구현 |
| 계층적 폰트 로딩 | ❌ | 미구현 |
| 시스템 폰트 Fallback | ✅ | 현재 사용 중 |
| CJK 폰트 서브셋 | ❌ | 미구현 |

---

## Phase 3: Expansion (0%)

| Feature | Status |
|---------|--------|
| 스플래시 화면 (언어별 환영) | ❌ |
| 읽기 통계/목표 | ❌ |
| 커뮤니티 (나눔, 기도제목) | ❌ |
| 전문 오디오북 | ❌ |
| 오프라인 공유 (BT/WiFi Direct) | ❌ |
| Screen Reader 지원 강화 | ❌ |

---

## Testing Progress (50%)

### 10.1 테스트 도구 현황
| Tool | Status | Notes |
|------|--------|-------|
| Jest (Unit Test) | ✅ | 97 tests 통과 |
| RNTL (Component Test) | ✅ | Jest와 함께 사용 |
| **Detox (E2E Test)** | ❌ | **설치 안됨** |
| Manual Test | ⚠️ | 진행 중 |

### 10.2 Detox E2E 테스트 시나리오 (PRD Section 10.3)
| Scenario | Implemented |
|----------|-------------|
| 1. 앱 실행 및 언어 선택 | ❌ |
| 2. EPUB 다운로드 | ❌ |
| 3. 책 열기 및 읽기 | ❌ |
| 4. 페이지/스크롤 모드 전환 | ❌ |
| 5. 북마크 추가/삭제 | ❌ |
| 6. 하이라이트 생성 | ❌ |
| 7. TTS 재생/정지 | ❌ |
| 8. 설정 변경 (폰트, 테마) | ❌ |
| 9. RTL 언어 전환 및 레이아웃 확인 | ❌ |

**Detox 설치 필요:**
```bash
npm install detox --save-dev
npx detox init
```

---

## In-App Purchase (추가 구현)

| Feature | Status | Notes |
|---------|--------|-------|
| Freemium 모델 | ✅ | FREE_CHAPTER_LIMIT = 2 |
| purchaseStore | ✅ | Zustand store |
| PaywallModal | ✅ | 잠금 안내 UI |
| ChapterList 잠금 | ✅ | 잠금 아이콘 표시 |
| 실제 IAP 연동 | ❌ | expo-in-app-purchases 설정 필요 |

---

## Current Sprint Focus

### Reader Screen Improvements (진행 중)
- [x] EPUB 콘텐츠 로딩
- [x] 페이지/스크롤 모드 전환
- [x] TTS 현재 페이지 읽기
- [x] 스와이프로 페이지 이동
- [x] 탭으로 컨트롤 표시/숨기기
- [ ] 테스트 검증 (Swipe, Scroll, TTS, Controls)

---

## Files Structure

```
src/
├── screens/
│   ├── Library/           ✅
│   ├── Reader/            ✅ (개선 중)
│   ├── Settings/          ✅
│   ├── BookDetail/        ✅
│   ├── ChapterList/       ✅
│   └── LanguageDownload/  ✅
├── shared/
│   ├── stores/
│   │   ├── booksStore.ts      ✅
│   │   ├── settingsStore.ts   ✅
│   │   ├── purchaseStore.ts   ✅
│   │   └── bookmarksStore.ts  ⚠️ (UI 미연결)
│   ├── services/
│   │   ├── database.ts        ✅
│   │   ├── epubService.ts     ✅
│   │   ├── ttsService.ts      ✅
│   │   └── contentService.ts  ✅
│   └── components/
│       └── PaywallModal.tsx   ✅
├── i18n/
│   ├── locales/
│   │   ├── en.json           ✅
│   │   └── ko.json           ✅
│   └── index.ts              ✅
└── __tests__/
    ├── stores/               ✅ (3 files)
    └── services/             ✅ (2 files)
```

---

## Next Steps (Priority Order)

1. **테스트 검증** - Swipe, Scroll, TTS, Controls 기능 확인
2. **Bookmark/Highlight UI** - Reader 화면에 북마크/하이라이트 기능 추가
3. **RTL 지원** - 아랍어 등 RTL 언어 레이아웃
4. **Detox 설치** - E2E 테스트 환경 구축
5. **Typography System** - Noto Font 추가
6. **Analytics** - Firebase Analytics 연동
