# 🎨 Complete UI Integration Guide
### Panduan Lengkap Membuat UI yang Terintegrasi Sempurna

## 📚 Table of Contents
1. [Architecture & Structure](#1-architecture--structure)
2. [Design System](#2-design-system)
3. [State Management](#3-state-management)
4. [API Integration](#4-api-integration)
5. [Type Safety](#5-type-safety)
6. [Error Handling](#6-error-handling)
7. [Loading States](#7-loading-states)
8. [Real-time Updates](#8-real-time-updates)
9. [Responsive Design](#9-responsive-design)
10. [Performance Optimization](#10-performance-optimization)
11. [Testing Strategy](#11-testing-strategy)
12. [Documentation](#12-documentation)

---

## 1. Architecture & Structure

### 1.1 Folder Structure
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── trading-dashboard.tsx
│   │   ├── wallet-deposit.tsx
│   │   ├── positions-list.tsx
│   │   └── ...
│   ├── providers/           # Context providers
│   │   ├── auth-provider.tsx
│   │   ├── toast-provider.tsx
│   │   └── theme-provider.tsx
│   ├── services/            # API services
│   │   ├── trading.service.ts
│   │   ├── wallet.service.ts
│   │   ├── portfolio.service.ts
│   │   └── faucet.service.ts
│   ├── lib/                 # Utilities & helpers
│   │   ├── api-client.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── types/               # TypeScript types
│   │   ├── trading.types.ts
│   │   ├── wallet.types.ts
│   │   └── user.types.ts
│   └── hooks/               # Custom React hooks
│       ├── useAuth.ts
│       ├── usePortfolio.ts
│       └── usePrices.ts
```

### 1.2 Component Architecture

**Atomic Design Pattern:**
```
Atoms → Molecules → Organisms → Templates → Pages
```

Example dari project ini:
```typescript
// Atom
function Button({ children, variant, onClick }) { ... }

// Molecule
function StatCard({ label, value, icon }) { ... }

// Organism
function TradingPanel({ onTrade, balance }) { ... }

// Template
function DashboardLayout({ children }) { ... }

// Page
function TradingDashboard() { ... }
```

---

## 2. Design System

### 2.1 Theme Configuration

**Centralized Theme System:**
```typescript
// theme.config.ts
export const theme = {
  colors: {
    // Brand colors
    primary: {
      50: '#f5f3ff',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
    },
    // Semantic colors
    success: { ... },
    error: { ... },
    warning: { ... },
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
    },
  },
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
  },
};
```

### 2.2 Dark/Light Mode

**Dynamic Theme System:**
```typescript
const themeConfig = darkMode ? {
  bg: 'bg-gradient-to-br from-[#0a0b0f] via-[#0d0e13] to-[#0a0b0f]',
  bgCard: 'bg-gradient-to-br from-[#16171e]/90 to-[#1a1b23]/80',
  text: 'text-gray-50',
  border: 'border-[#1f2029]/80',
  glow: 'shadow-lg shadow-purple-500/5',
} : {
  bg: 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
  bgCard: 'bg-gradient-to-br from-white/90 to-gray-50/80',
  text: 'text-gray-900',
  border: 'border-gray-200/80',
  glow: 'shadow-md shadow-purple-100/20',
};
```

### 2.3 Component Variants

**Reusable Button System:**
```typescript
// components/Button.tsx
type ButtonVariant = 'primary' | 'success' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  onClick
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600',
    ghost: 'bg-transparent border border-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl font-bold transition-all duration-300
        disabled:opacity-40 disabled:cursor-not-allowed
        relative overflow-hidden group
      `}
    >
      {loading && (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
      )}
      {!loading && children}
    </button>
  );
}
```

---

## 3. State Management

### 3.1 Local State (useState)

**For component-specific state:**
```typescript
const [orderSize, setOrderSize] = useState('');
const [leverage, setLeverage] = useState(50);
const [loading, setLoading] = useState(false);
```

### 3.2 Global State (Context API)

**AuthProvider Example:**
```typescript
// providers/auth-provider.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.verify(token);
        setUser(userData);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: Credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    localStorage.setItem('token', response.token);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### 3.3 Server State (React Query - Optional but Recommended)

```typescript
// hooks/usePortfolio.ts
import { useQuery } from '@tanstack/react-query';

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: () => portfolioService.getPortfolio(),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    staleTime: 1000,
  });
}

// Usage in component
function TradingDashboard() {
  const { data: portfolio, isLoading, error } = usePortfolio();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <div>Balance: ${portfolio.wallet.balance}</div>;
}
```

---

## 4. API Integration

### 4.1 Centralized API Client

```typescript
// lib/api-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, params?: any) {
    return this.client.get<T>(url, { params });
  }

  post<T>(url: string, data?: any) {
    return this.client.post<T>(url, data);
  }

  put<T>(url: string, data?: any) {
    return this.client.put<T>(url, data);
  }

  delete<T>(url: string) {
    return this.client.delete<T>(url);
  }
}

export const apiClient = new APIClient();
```

### 4.2 Service Layer Pattern

```typescript
// services/trading.service.ts
import { apiClient } from '@/lib/api-client';

export interface CreateOrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  size: number;
  leverage: number;
  price?: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  margin: number;
  unrealizedPnl: number;
  roe: number;
  liquidationPrice: number;
}

class TradingService {
  /**
   * Create a new order
   */
  async createOrder(request: CreateOrderRequest) {
    const response = await apiClient.post('/api/trading/order', request);
    return response.data;
  }

  /**
   * Get all active positions
   */
  async getPositions(): Promise<Position[]> {
    const response = await apiClient.get<Position[]>('/api/trading/positions');
    return response.data;
  }

  /**
   * Close a position
   */
  async closePosition(positionId: string) {
    const response = await apiClient.post(`/api/trading/positions/${positionId}/close`);
    return response.data;
  }

  /**
   * Get current market prices
   */
  async getAllPrices() {
    const response = await apiClient.get('/api/trading/prices');
    return response.data;
  }
}

export const tradingService = new TradingService();
```

---

## 5. Type Safety

### 5.1 Define All Types

```typescript
// types/trading.types.ts
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type PositionStatus = 'open' | 'closed' | 'liquidated';

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  size: number;
  leverage: number;
  price?: number;
  status: string;
  createdAt: string;
}

export interface Position {
  id: string;
  symbol: string;
  side: OrderSide;
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  margin: number;
  unrealizedPnl: number;
  roe: number;
  liquidationPrice: number;
  status: PositionStatus;
}

// types/wallet.types.ts
export interface WalletBalance {
  balance: number;
  locked: number;
  available: number;
  equity: number;
  unrealizedPnl: number;
  depositAddress?: string;
}
```

### 5.2 Use TypeScript Strictly

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## 6. Error Handling

### 6.1 Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Log to error reporting service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
            <p className="text-gray-600 mt-2">Please refresh the page</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 6.2 Try-Catch Patterns

```typescript
// Good error handling pattern
async function handleOpenPosition() {
  try {
    setLoading(true);

    // Validate inputs
    if (!orderSize || parseFloat(orderSize) <= 0) {
      toast.error('Please enter a valid position size');
      return;
    }

    // Call API
    const result = await tradingService.createOrder({
      symbol: selectedSymbol,
      side: orderType === 'Long' ? 'BUY' : 'SELL',
      type: 'MARKET',
      size: parseFloat(orderSize),
      leverage: leverage,
    });

    // Success feedback
    toast.success('Position opened successfully!');

    // Reset form
    setOrderSize('');

    // Refresh data
    await fetchPortfolio();

  } catch (error: any) {
    // Specific error handling
    if (error.response?.status === 400) {
      toast.error(error.response.data.error || 'Invalid order');
    } else if (error.response?.status === 403) {
      toast.error('Insufficient balance');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again');
    } else {
      toast.error('Failed to open position. Please try again');
    }

    // Log for debugging
    console.error('[TradingPanel] Error opening position:', error);

  } finally {
    setLoading(false);
  }
}
```

### 6.3 Toast Notifications

```typescript
// providers/toast-provider.tsx
import { createContext, useContext, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider
      value={{
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        warning: (msg) => addToast(msg, 'warning'),
        info: (msg) => addToast(msg, 'info'),
      }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-600' :
              toast.type === 'error' ? 'bg-red-600' :
              toast.type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            } text-white animate-slide-in`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
```

---

## 7. Loading States

### 7.1 Skeleton Screens

```typescript
// components/PositionSkeleton.tsx
export function PositionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-4 p-4">
        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

// Usage
{loading ? (
  <>
    <PositionSkeleton />
    <PositionSkeleton />
    <PositionSkeleton />
  </>
) : (
  positions.map(pos => <PositionCard key={pos.id} position={pos} />)
)}
```

### 7.2 Loading Spinners

```typescript
// components/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-purple-500 border-t-transparent`} />
    </div>
  );
}
```

### 7.3 Progressive Loading

```typescript
function Dashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [prices, setPrices] = useState(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    // Load critical data first
    fetchPortfolio().then(setPortfolio);

    // Then load secondary data
    fetchPrices().then(setPrices);
    fetchPositions().then(setPositions);
  }, []);

  // Show partial UI as data loads
  return (
    <div>
      {portfolio ? (
        <BalanceCard balance={portfolio.wallet.balance} />
      ) : (
        <BalanceSkeleton />
      )}

      {prices ? (
        <PriceChart prices={prices} />
      ) : (
        <ChartSkeleton />
      )}

      {positions ? (
        <PositionsList positions={positions} />
      ) : (
        <PositionsListSkeleton />
      )}
    </div>
  );
}
```

---

## 8. Real-time Updates

### 8.1 Polling Pattern

```typescript
useEffect(() => {
  // Initial fetch
  fetchData();

  // Poll every 5 seconds
  const interval = setInterval(() => {
    fetchData();
  }, 5000);

  // Cleanup
  return () => clearInterval(interval);
}, []);
```

### 8.2 WebSocket Pattern (More efficient)

```typescript
// hooks/useWebSocket.ts
export function useWebSocket(url: string) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return { data, connected };
}

// Usage
function PriceDisplay() {
  const { data: prices, connected } = useWebSocket('ws://localhost:3001/prices');

  return (
    <div>
      <span className={connected ? 'text-green-500' : 'text-red-500'}>
        {connected ? '● Live' : '○ Disconnected'}
      </span>
      <span>BTC: ${prices?.BTCUSDT}</span>
    </div>
  );
}
```

---

## 9. Responsive Design

### 9.1 Mobile-First Approach

```typescript
// Mobile first, then desktop
<div className="
  px-4           // Mobile: 16px padding
  md:px-8        // Tablet: 32px padding
  lg:px-12       // Desktop: 48px padding

  grid
  grid-cols-1    // Mobile: 1 column
  md:grid-cols-2 // Tablet: 2 columns
  lg:grid-cols-3 // Desktop: 3 columns

  gap-4          // 16px gap
  lg:gap-8       // 32px gap on large screens
">
  {/* Content */}
</div>
```

### 9.2 Responsive Hooks

```typescript
// hooks/useMediaQuery.ts
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Usage
function Dashboard() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div>
      {isMobile ? (
        <MobileTradingPanel />
      ) : (
        <DesktopTradingPanel />
      )}
    </div>
  );
}
```

---

## 10. Performance Optimization

### 10.1 Code Splitting

```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const TradingDashboard = lazy(() => import('./components/trading-dashboard'));
const ChartComponent = lazy(() => import('./components/chart'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TradingDashboard />
    </Suspense>
  );
}
```

### 10.2 Memoization

```typescript
import { useMemo, useCallback, memo } from 'react';

// Memoize expensive calculations
const calculatedPnL = useMemo(() => {
  return positions.reduce((total, pos) => total + pos.unrealizedPnl, 0);
}, [positions]);

// Memoize callbacks
const handleTrade = useCallback((size: number) => {
  tradingService.createOrder({ size, ... });
}, [/* dependencies */]);

// Memoize components
const PositionRow = memo(({ position }: { position: Position }) => {
  return <tr>...</tr>;
});
```

### 10.3 Debouncing & Throttling

```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      // API call only happens 500ms after user stops typing
      searchAPI(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
```

---

## 11. Testing Strategy

### 11.1 Unit Tests (Jest + React Testing Library)

```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 11.2 Integration Tests

```typescript
// __tests__/TradingFlow.test.tsx
describe('Trading Flow', () => {
  it('should open a position successfully', async () => {
    // Mock API
    jest.spyOn(tradingService, 'createOrder').mockResolvedValue({
      id: '123',
      status: 'filled',
    });

    // Render component
    render(<TradingDashboard />);

    // Fill in form
    fireEvent.change(screen.getByLabelText('Size'), { target: { value: '100' } });
    fireEvent.click(screen.getByText('Long'));

    // Submit
    fireEvent.click(screen.getByText('Buy / Long'));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Position opened successfully!')).toBeInTheDocument();
    });
  });
});
```

---

## 12. Documentation

### 12.1 Component Documentation

```typescript
/**
 * Button component with multiple variants and states
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 *
 * @param variant - Visual style of button (primary | success | danger | ghost)
 * @param size - Size of button (sm | md | lg)
 * @param loading - Shows loading spinner and disables button
 * @param disabled - Disables button interaction
 * @param children - Button content
 * @param onClick - Click handler function
 */
export function Button({ ... }: ButtonProps) { ... }
```

### 12.2 README Files

Create documentation for each major feature:
- `docs/TRADING_GUIDE.md`
- `docs/WALLET_INTEGRATION.md`
- `docs/API_INTEGRATION.md`

---

## 📝 Checklist Lengkap

Gunakan checklist ini setiap kali membuat UI baru:

### Architecture ✅
- [ ] Component structure mengikuti atomic design
- [ ] Folder organization yang jelas
- [ ] Separation of concerns (UI / Logic / Data)

### Design System ✅
- [ ] Consistent color scheme
- [ ] Defined spacing system
- [ ] Typography hierarchy
- [ ] Dark/Light mode support
- [ ] Reusable component variants

### Type Safety ✅
- [ ] All types defined
- [ ] No `any` types
- [ ] Proper interfaces for API responses
- [ ] TypeScript strict mode enabled

### API Integration ✅
- [ ] Centralized API client
- [ ] Service layer pattern
- [ ] Error handling
- [ ] Loading states
- [ ] Success feedback

### State Management ✅
- [ ] Proper state location (local vs global)
- [ ] Context providers for shared state
- [ ] No prop drilling
- [ ] State updates are immutable

### Error Handling ✅
- [ ] Error boundaries implemented
- [ ] Try-catch in async functions
- [ ] User-friendly error messages
- [ ] Error logging

### Performance ✅
- [ ] Code splitting for heavy components
- [ ] Memoization where needed
- [ ] Debouncing for expensive operations
- [ ] Lazy loading images

### UX ✅
- [ ] Loading states for all async operations
- [ ] Success/error feedback
- [ ] Disabled states on forms
- [ ] Validation feedback
- [ ] Responsive design

### Testing ✅
- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] Integration tests for flows
- [ ] E2E tests for critical paths

### Documentation ✅
- [ ] Component props documented
- [ ] API integration documented
- [ ] README with setup instructions
- [ ] Code comments for complex logic

---

## 🎯 Example: Complete Feature Implementation

Berikut contoh lengkap implementasi fitur dari awal sampai akhir:

```typescript
// 1. Define Types
// types/faucet.types.ts
export interface FaucetInfo {
  canClaim: boolean;
  amount: number;
  cooldownMs: number;
  nextClaimAt?: string;
}

export interface FaucetClaimResponse {
  success: boolean;
  amount: number;
  newBalance: number;
  message: string;
}

// 2. Create Service
// services/faucet.service.ts
class FaucetService {
  async getInfo(): Promise<FaucetInfo> {
    const response = await apiClient.get<FaucetInfo>('/api/faucet/info');
    return response.data;
  }

  async claim(): Promise<FaucetClaimResponse> {
    const response = await apiClient.post<FaucetClaimResponse>('/api/faucet/claim');
    return response.data;
  }
}

export const faucetService = new FaucetService();

// 3. Create Custom Hook (Optional)
// hooks/useFaucet.ts
export function useFaucet() {
  const [info, setInfo] = useState<FaucetInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchInfo = async () => {
    try {
      const data = await faucetService.getInfo();
      setInfo(data);
    } catch (error) {
      console.error('Error fetching faucet info:', error);
    }
  };

  const claim = async () => {
    try {
      setLoading(true);
      const result = await faucetService.claim();
      toast.success(result.message);
      await fetchInfo(); // Refresh info
      return result;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to claim');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return { info, loading, claim, refresh: fetchInfo };
}

// 4. Create UI Component
// components/FaucetButton.tsx
export function FaucetButton() {
  const { info, loading, claim } = useFaucet();

  if (!info) return <LoadingSpinner />;

  const canClaim = info.canClaim && !loading;
  const cooldownSeconds = info.cooldownMs / 1000;

  return (
    <button
      onClick={claim}
      disabled={!canClaim}
      className={`
        px-6 py-3 rounded-xl font-bold
        transition-all duration-300
        ${canClaim
          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 text-white'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }
      `}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>Claiming...</span>
        </>
      ) : canClaim ? (
        `Claim $${info.amount} USDT`
      ) : (
        `Next claim in ${formatTime(cooldownSeconds)}`
      )}
    </button>
  );
}

// 5. Add Tests
// __tests__/FaucetButton.test.tsx
describe('FaucetButton', () => {
  it('allows claiming when available', async () => {
    jest.spyOn(faucetService, 'getInfo').mockResolvedValue({
      canClaim: true,
      amount: 1000,
      cooldownMs: 0,
    });

    render(<FaucetButton />);

    await waitFor(() => {
      expect(screen.getByText('Claim $1000 USDT')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Claim $1000 USDT'));

    await waitFor(() => {
      expect(screen.getByText('Claiming...')).toBeInTheDocument();
    });
  });
});
```

---

## 🚀 Summary

**Untuk membuat UI yang terintegrasi sempurna, Anda perlu:**

1. **Architecture** - Structure yang jelas dan scalable
2. **Design System** - Konsistensi visual di seluruh app
3. **Type Safety** - TypeScript untuk mencegah bugs
4. **API Integration** - Centralized client dengan error handling
5. **State Management** - Proper local & global state
6. **Error Handling** - User-friendly error messages
7. **Loading States** - Feedback untuk semua async operations
8. **Real-time Updates** - Polling atau WebSocket
9. **Responsive Design** - Mobile-first approach
10. **Performance** - Code splitting & memoization
11. **Testing** - Comprehensive test coverage
12. **Documentation** - Clear docs untuk maintenance

**Key Principles:**
- 🎯 **Single Responsibility** - Setiap component punya satu tugas
- 🔄 **DRY (Don't Repeat Yourself)** - Reusable components
- 📦 **Encapsulation** - Logic terpisah dari UI
- 🛡️ **Type Safety** - TypeScript everywhere
- ⚡ **Performance First** - Optimize dari awal
- 🧪 **Test Driven** - Write tests
- 📝 **Document Everything** - Future you akan berterima kasih

**Happy Coding! 🎉**
