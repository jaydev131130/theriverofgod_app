# The River of God - Development Guidelines

## Project Overview
React Native/Expo 기반의 다국어 EPUB 리더 앱입니다.
- Framework: Expo (React Native)
- State Management: Zustand
- Navigation: React Navigation
- i18n: i18next
- TTS: expo-speech

## Testing Rules (필수)

### 모든 코드 변경 시 테스트 작성
코드를 수정하거나 새로운 기능을 추가한 후에는 반드시 관련 테스트를 작성해야 합니다.

#### 1. 버그 수정 (Bug Fix)
```
1. 버그 재현 테스트 먼저 작성
2. 코드 수정으로 버그 해결
3. 테스트 통과 확인
4. 관련 엣지 케이스 테스트 추가
```

#### 2. 새 기능 구현 (New Feature)
```
1. 기능 요구사항 기반 테스트 작성
2. Happy path 테스트
3. Error path 테스트
4. 통합 테스트 포함
```

#### 3. 리팩토링 (Refactoring)
```
1. 기존 동작 보장 테스트 먼저 확인
2. 리팩토링 수행
3. 모든 기존 테스트 통과 확인
```

### 테스트 위치
```
__tests__/
├── unit/           # 단위 테스트 (함수, 유틸리티)
├── integration/    # 통합 테스트 (서비스, 스토어)
└── components/     # 컴포넌트 테스트

e2e/                # Detox E2E 테스트
```

### 테스트 커버리지 목표
- 핵심 비즈니스 로직: > 80%
- 유틸리티 함수: > 90%
- UI 컴포넌트: 주요 상호작용 테스트

### 테스트 명령어
```bash
# 단위/통합 테스트
npm test

# 특정 파일 테스트
npm test -- --testPathPattern="<pattern>"

# 커버리지 리포트
npm test -- --coverage

# E2E 테스트 (Detox)
npx detox test
```

## Code Style

### TypeScript
- 모든 파일은 TypeScript 사용
- `any` 타입 사용 지양
- Props와 State에 명시적 타입 정의

### Component Structure
```typescript
// 1. Imports
import React from 'react';
import { View, Text } from 'react-native';

// 2. Types
interface Props {
  // ...
}

// 3. Component
export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // hooks
  // handlers
  // render
  return (
    <View>
      {/* ... */}
    </View>
  );
};

// 4. Styles
const styles = StyleSheet.create({
  // ...
});
```

### File Naming
- Components: `PascalCase.tsx` (예: `ReaderScreen.tsx`)
- Utils/Services: `camelCase.ts` (예: `ttsService.ts`)
- Types: `types.ts`
- Constants: `constants.ts`

## Architecture

### Screens
`src/screens/` - 각 화면별 폴더 구조
- Library/ - 서재 화면
- Reader/ - 읽기 화면
- Settings/ - 설정 화면

### Shared
`src/shared/` - 공유 모듈
- components/ - 재사용 UI 컴포넌트
- services/ - API, TTS 등 서비스
- stores/ - Zustand 스토어
- hooks/ - 커스텀 훅

### Navigation
`src/navigation/` - 네비게이션 설정
- MainTabNavigator.tsx
- types.ts

## Key Principles

### 적정기술 (Appropriate Technology)
- 저사양 기기 지원 우선
- 오프라인 우선 설계
- 경량화 (앱 크기 < 30MB)

### 접근성
- 큰 터치 타겟 (48x48dp 이상)
- 충분한 색상 대비
- 다양한 폰트 크기 지원

### 다국어 지원
- i18next 사용
- RTL 언어 지원
- UI 텍스트와 콘텐츠 분리

## Common Patterns

### Zustand Store
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoreState {
  value: string;
  setValue: (value: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      value: '',
      setValue: (value) => set({ value }),
    }),
    {
      name: 'store-key',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Service Pattern
```typescript
// services/someService.ts
export const doSomething = async (param: string): Promise<Result> => {
  // implementation
};

export const doAnotherThing = async (): Promise<void> => {
  // implementation
};
```
