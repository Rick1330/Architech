# Testing Documentation

This document covers the testing strategy, setup, and best practices for the Architech frontend application.

## Testing Setup

### Framework
- **Vitest**: Modern, fast testing framework built for Vite
- **React Testing Library**: Component testing utilities
- **Jest DOM**: Additional DOM matchers for assertions
- **User Event**: Realistic user interaction simulation

### Configuration

The testing setup is configured in `vite.config.ts`:

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
}
```

### Available Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### File Organization

Tests are co-located with their respective modules:

```
src/
├── components/
│   ├── ComponentCard.tsx
│   └── __tests__/
│       └── ComponentCard.test.tsx
├── hooks/
│   ├── useSimulation.ts
│   └── __tests__/
│       └── useSimulation.test.tsx
├── stores/
│   ├── useArchitectStore.ts
│   └── __tests__/
│       └── useArchitectStore.test.tsx
└── lib/
    └── api/
        ├── client.ts
        └── __tests__/
            └── client.test.ts
```

### Naming Conventions

- Test files: `*.test.tsx` or `*.test.ts`
- Test directories: `__tests__/`
- Test descriptions: Clear, descriptive English

## Test Categories

### 1. Component Tests

Testing React components with user interactions:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentCard } from '../ComponentCard';

describe('ComponentCard', () => {
  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const component = { id: '1', name: 'API Gateway' };

    render(<ComponentCard component={component} onSelect={onSelect} />);
    
    await user.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

### 2. Hook Tests

Testing custom React hooks:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useArchitectStore } from '../useArchitectStore';

describe('useArchitectStore', () => {
  it('adds nodes correctly', () => {
    const { result } = renderHook(() => useArchitectStore());
    
    act(() => {
      result.current.addNode(mockNode);
    });
    
    expect(result.current.nodes).toContain(mockNode);
  });
});
```

### 3. API Tests

Testing API client with mocked fetch:

```typescript
import { apiClient } from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiClient', () => {
  it('sends correct login request', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { token: 'test' } })
    });

    await apiClient.login('user@test.com', 'password');
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'user@test.com',
          password: 'password'
        })
      })
    );
  });
});
```

### 4. Integration Tests

Testing feature workflows:

```typescript
describe('Authentication Flow', () => {
  it('logs in user and redirects to dashboard', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Click login button
    await user.click(screen.getByText('Sign In'));
    
    // Fill form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Verify redirect
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
```

## Mocking Strategies

### 1. Module Mocking

Mock external dependencies:

```typescript
// Mock the API client
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    login: vi.fn(),
    getProjects: vi.fn(),
  },
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
}));
```

### 2. Component Mocking

Mock complex child components:

```typescript
// Mock the canvas component
vi.mock('@/components/ArchitectCanvas', () => ({
  ArchitectCanvas: () => <div data-testid="canvas">Canvas</div>,
}));
```

### 3. Hook Mocking

Mock custom hooks:

```typescript
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User' },
    isAuthenticated: true,
    login: vi.fn(),
  }),
}));
```

### 4. Store Mocking

Mock Zustand stores:

```typescript
vi.mock('@/stores/useArchitectStore', () => ({
  useArchitectStore: vi.fn(() => ({
    nodes: [],
    addNode: vi.fn(),
    selectedNodeId: null,
  })),
}));
```

## Testing Patterns

### 1. Arrange-Act-Assert

Structure tests clearly:

```typescript
it('updates node position', () => {
  // Arrange
  const initialNode = { id: '1', position: { x: 0, y: 0 } };
  const newPosition = { x: 100, y: 100 };
  
  // Act
  const result = updateNodePosition(initialNode, newPosition);
  
  // Assert
  expect(result.position).toEqual(newPosition);
});
```

### 2. Test Data Factories

Create reusable test data:

```typescript
const createMockNode = (overrides = {}) => ({
  id: 'node-1',
  type: 'service',
  position: { x: 0, y: 0 },
  data: { label: 'Test Service' },
  ...overrides,
});

const createMockComponent = (overrides = {}) => ({
  id: 'api-gateway',
  name: 'API Gateway',
  type: 'infrastructure',
  ...overrides,
});
```

### 3. Custom Render Functions

Create test utilities:

```typescript
const renderWithProviders = (ui: ReactElement, options = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClient>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClient>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};
```

## Accessibility Testing

### Screen Reader Testing

```typescript
it('has proper accessibility attributes', () => {
  render(<ComponentCard component={mockComponent} />);
  
  const card = screen.getByRole('button');
  expect(card).toHaveAttribute('aria-label');
  expect(card).toHaveAttribute('tabIndex', '0');
});
```

### Keyboard Navigation

```typescript
it('supports keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<ComponentPalette />);
  
  // Tab to first component
  await user.tab();
  expect(screen.getByRole('button', { name: /api gateway/i })).toHaveFocus();
  
  // Press Enter to select
  await user.keyboard('{Enter}');
  expect(mockOnSelect).toHaveBeenCalled();
});
```

## Performance Testing

### Render Performance

```typescript
import { Profiler } from 'react';

it('renders efficiently', () => {
  let renderTime = 0;
  
  const onRender = (id: string, phase: string, actualDuration: number) => {
    renderTime = actualDuration;
  };
  
  render(
    <Profiler id="ComponentCard" onRender={onRender}>
      <ComponentCard component={mockComponent} />
    </Profiler>
  );
  
  expect(renderTime).toBeLessThan(16); // 60fps threshold
});
```

## Coverage Requirements

### Target Coverage
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/index.html
```

### Critical Paths
Ensure 100% coverage for:
- Authentication flows
- Data persistence operations
- Error handling paths
- Security-sensitive code

## Continuous Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad: Testing implementation details
expect(component.state.isLoading).toBe(true);

// ✅ Good: Testing user-visible behavior
expect(screen.getByText('Loading...')).toBeInTheDocument();
```

### 2. Use Semantic Queries

```typescript
// ❌ Bad: Brittle selectors
screen.getByTestId('submit-button');

// ✅ Good: Semantic queries
screen.getByRole('button', { name: /submit/i });
```

### 3. Avoid Testing Third-Party Code

```typescript
// ❌ Bad: Testing React Router
expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

// ✅ Good: Testing your app's behavior
expect(screen.getByText('Dashboard')).toBeInTheDocument();
```

### 4. Test Edge Cases

```typescript
describe('ComponentCard', () => {
  it('handles missing component data gracefully', () => {
    render(<ComponentCard component={null} />);
    expect(screen.getByText('Unknown Component')).toBeInTheDocument();
  });
  
  it('handles very long component names', () => {
    const longName = 'A'.repeat(100);
    render(<ComponentCard component={{ name: longName }} />);
    expect(screen.getByText(longName)).toBeInTheDocument();
  });
});
```

### 5. Clean Up After Tests

```typescript
afterEach(() => {
  vi.clearAllMocks();
  cleanup(); // React Testing Library cleanup
});

afterAll(() => {
  vi.restoreAllMocks();
});
```

## Debugging Tests

### Debug Output

```typescript
import { screen } from '@testing-library/react';

// Debug what's rendered
screen.debug();

// Debug specific element
screen.debug(screen.getByRole('button'));
```

### VS Code Configuration

```json
{
  "configurations": [
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--reporter=verbose"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

This testing strategy ensures reliable, maintainable tests that provide confidence in the application's functionality while supporting rapid development cycles.