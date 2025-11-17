# EvoLab Test Suite

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test tests/genetics/MutationEngine.test.ts
```

## Test Structure

```
tests/
├── setup.ts                      # Global test setup
├── core/                        # Core system tests
│   └── Config.test.ts
├── genetics/                    # Genetic system tests
│   └── MutationEngine.test.ts
└── utils/                       # Utility tests
    └── Logger.test.ts
```

## Writing Tests

### Example Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MyClass } from '../../src/MyClass';

describe('MyClass', () => {
  let instance: MyClass;

  beforeEach(() => {
    instance = new MyClass();
  });

  it('should do something', () => {
    expect(instance.method()).toBe(expectedValue);
  });
});
```

## Coverage Goals

- **Core Systems:** 60%+ coverage
- **Genetics:** 70%+ coverage
- **AI Systems:** 50%+ coverage
- **Utils:** 80%+ coverage

## TODO: Add More Tests

Priority areas needing tests:
1. `src/genetics/MatingSystem.ts` - Reproduction logic
2. `src/ai/AutoPilot.ts` - AI decision making
3. `src/entities/CombatSystem.ts` - Combat mechanics
4. `src/data/SaveSystem.ts` - Save/load functionality
5. `src/achievements/AchievementSystem.ts` - Achievement tracking
