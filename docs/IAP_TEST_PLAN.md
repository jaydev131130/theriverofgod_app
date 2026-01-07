# In-App Purchase (IAP) 테스트 계획서

## 1. 기능 개요

### 1.1 비즈니스 모델
- **무료 콘텐츠**: Chapter 1 (Introduction) + Chapter 2
- **유료 콘텐츠**: Chapter 3 이후 모든 챕터
- **결제 유형**: 일회성 구매 (Full Access)
- **가격**: $4.99 (예정)

### 1.2 주요 기능
| 기능 | 설명 |
|------|------|
| 챕터 잠금 | Chapter 3+는 잠금 아이콘 표시 |
| 페이월 모달 | 잠긴 챕터 탭 시 구매 안내 |
| 구매 플로우 | 앱스토어/플레이스토어 IAP 연동 |
| 구매 복원 | 이전 구매 복원 기능 |
| 구매 지속성 | 앱 재시작 후에도 구매 상태 유지 |

---

## 2. 테스트 환경

### 2.1 유닛 테스트 (Jest)
```bash
npm test
```

### 2.2 E2E 테스트 (Playwright - Web)
```bash
# Expo 웹 서버 시작
npx expo start --web

# 다른 터미널에서 테스트 실행
npm run test:e2e

# UI 모드로 실행
npm run test:e2e:ui
```

### 2.3 E2E 테스트 (Detox - Mobile)
```bash
# iOS
npx detox test -c ios.sim.debug

# Android
npx detox test -c android.emu.debug
```

---

## 3. 테스트 커버리지

### 3.1 유닛 테스트 (97 tests passed)

#### purchaseStore.test.ts (30+ tests)
| 테스트 그룹 | 테스트 항목 |
|------------|------------|
| Initial State | isPurchased, purchaseDate, transactionId 초기값 |
| FREE_CHAPTER_LIMIT | 상수 정의 및 값 검증 |
| PRODUCT_IDS | 제품 ID 형식 검증 |
| Chapter Lock Logic | 챕터별 잠금/해제 로직 |
| Locked Chapter Count | 잠긴 챕터 수 계산 |
| Purchase Flow | 구매 성공/실패 플로우 |
| Restore Flow | 구매 복원 플로우 |
| Load Products | 제품 정보 로드 |
| Edge Cases | 경계 조건 처리 |

### 3.2 E2E 테스트 시나리오

#### 시나리오 1: 신규 사용자 - 무료 챕터 접근
```
Given: 앱 최초 설치
When: Chapter 1 탭
Then: 리더 화면으로 이동, 콘텐츠 정상 표시
```

#### 시나리오 2: 잠긴 챕터 상호작용
```
Given: 미구매 상태
When: Chapter 2 탭
Then: 페이월 모달 표시
      - 제품 가격 표시
      - 구매 버튼 활성화
      - 복원 버튼 표시
```

#### 시나리오 3: 언락 배너
```
Given: 챕터 목록 화면
When: 언락 배너 탭
Then: 페이월 모달 표시
```

#### 시나리오 4: 구매 성공
```
Given: 페이월 모달 열림
When: 구매 버튼 탭 → 결제 완료
Then: 성공 메시지 표시
      모든 챕터 잠금 해제
      잠금 아이콘 제거
      언락 배너 숨김
```

#### 시나리오 5: 구매 복원
```
Given: 이전 구매 존재
When: 복원 버튼 탭
Then: 구매 복원 성공
      모든 챕터 잠금 해제
```

#### 시나리오 6: 구매 상태 지속성
```
Given: 구매 완료 상태
When: 앱 종료 후 재시작
Then: 구매 상태 유지
      모든 챕터 접근 가능
```

#### 시나리오 7: 다국어 지원
```
Given: 앱 언어 = 한국어
When: 페이월 열기
Then: 한국어 UI 표시
      - "전체 책 잠금 해제"
      - "모든 장 잠금 해제"
```

#### 시나리오 8: 테마 지원
```
Given: 다크 테마 설정
When: 페이월 열기
Then: 다크 테마 색상 적용
```

#### 시나리오 9: 접근성
```
Given: VoiceOver/TalkBack 활성화
When: 페이월 탐색
Then: 모든 버튼에 접근성 라벨 존재
      스크린 리더로 탐색 가능
```

#### 시나리오 10: 에러 처리
```
Given: 네트워크 오류 상황
When: 구매 시도
Then: 에러 메시지 표시
      재시도 옵션 제공
```

---

## 4. 테스트 데이터

### 4.1 Mock IAP 제품
```typescript
{
  id: 'com.theriverofgod.fullaccess',
  title: 'Full Access',
  description: 'Unlock all chapters',
  price: '$4.99',
  priceAmount: 4.99,
  currency: 'USD'
}
```

### 4.2 테스트 챕터 목록
| Index | Title | Status |
|-------|-------|--------|
| 0 | Introduction | FREE |
| 1 | Chapter 1: The River Flows | FREE |
| 2 | Chapter 2: Living Water | LOCKED |
| 3 | Chapter 3: The Source | LOCKED |
| 4 | Chapter 4: The Journey | LOCKED |
| 5 | Chapter 5: The Destination | LOCKED |
| 6 | Conclusion | LOCKED |

---

## 5. 테스트 실행 결과

### 5.1 유닛 테스트
```
Test Suites: 5 passed, 5 total
Tests:       97 passed, 97 total
Snapshots:   0 total
Time:        ~7s
```

### 5.2 테스트 파일 구조
```
theriverofgod/
├── src/__tests__/
│   ├── stores/
│   │   ├── purchaseStore.test.ts   ← IAP 로직 테스트 (신규)
│   │   ├── booksStore.test.ts
│   │   └── settingsStore.test.ts
│   └── services/
│       ├── epubService.test.ts
│       └── ttsService.test.ts
├── e2e/
│   ├── iap-scenarios.test.ts       ← E2E 시나리오 (Detox용)
│   ├── iap.pw.test.ts              ← Playwright 테스트 (Web)
│   └── scenarios.test.ts           ← 기존 E2E 시나리오
└── playwright.config.ts             ← Playwright 설정
```

---

## 6. 구현된 코드 구조

### 6.1 Store
```
src/shared/stores/
└── purchaseStore.ts
    ├── PurchaseState interface
    ├── FREE_CHAPTER_LIMIT = 2
    ├── PRODUCT_IDS
    ├── isChapterLocked(index)
    ├── getLockedChapterCount(total)
    ├── purchaseFullAccess()
    ├── restorePurchases()
    └── loadProducts()
```

### 6.2 Components
```
src/shared/components/
└── PaywallModal.tsx
    ├── 잠금 아이콘
    ├── 기능 목록
    ├── 구매 버튼 + 가격
    ├── 복원 버튼
    └── 무료 계속하기 버튼
```

### 6.3 Screen Updates
```
src/screens/ChapterList/
└── ChapterListScreen.tsx
    ├── 잠금 아이콘 표시
    ├── FREE 배지 표시
    ├── 언락 배너
    └── PaywallModal 연동
```

---

## 7. 수동 테스트 체크리스트

### 7.1 iOS TestFlight
- [ ] 앱 설치 후 Chapter 1 접근 가능
- [ ] Chapter 2 탭 시 페이월 표시
- [ ] 구매 플로우 완료
- [ ] 구매 후 모든 챕터 접근 가능
- [ ] 앱 삭제 후 재설치 → 복원 기능 테스트

### 7.2 Android 내부 테스트
- [ ] 앱 설치 후 Chapter 1 접근 가능
- [ ] Chapter 2 탭 시 페이월 표시
- [ ] 구매 플로우 완료
- [ ] 구매 후 모든 챕터 접근 가능
- [ ] 앱 삭제 후 재설치 → 복원 기능 테스트

### 7.3 다국어 테스트
- [ ] 영어 UI 검증
- [ ] 한국어 UI 검증

### 7.4 테마 테스트
- [ ] Light 테마 페이월 UI
- [ ] Dark 테마 페이월 UI
- [ ] Sepia 테마 페이월 UI

---

## 8. 알려진 제한사항

1. **현재 Mock 구현**: 실제 IAP는 아직 연동되지 않음 (expo-in-app-purchases 필요)
2. **웹 버전**: 웹에서는 실제 IAP 불가, 테스트용 Mock만 작동
3. **영수증 검증**: 서버사이드 영수증 검증 미구현 (선택 사항)

---

## 9. 다음 단계

1. [ ] expo-in-app-purchases 패키지 설치 및 연동
2. [ ] App Store Connect에 IAP 제품 등록
3. [ ] Google Play Console에 IAP 제품 등록
4. [ ] TestFlight/Internal Testing으로 실제 구매 테스트
5. [ ] 서버사이드 영수증 검증 구현 (선택)

---

*Last Updated: 2026-01-06*
*Author: Claude Code*
