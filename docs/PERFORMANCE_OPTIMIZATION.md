# ShebaBD Frontend Performance & Optimization Guide

## Best Practices
1. **Route-based Code Splitting**: Dynamic imports using `React.lazy()`
2. **Asset Compression**: Modern WebP image formats with responsive source sets
3. **Memoization**: `useMemo` and `useCallback` on heavy list filters
4. **Bundle Analyzer**: Rollup chunk optimizations to keep chunks < 500kb
