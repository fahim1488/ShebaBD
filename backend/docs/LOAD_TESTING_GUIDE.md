# ShebaBD Backend Load Testing & Benchmarking Guide

## Tools
- **Locust**: Distributed load testing framework
- **Vegeta**: HTTP load testing tool for constant rate requests

## Target Thresholds
- P95 Response Time: < 250ms for read endpoints
- P95 Response Time: < 500ms for event registrations
- Concurrency Target: 500 simultaneous active users
