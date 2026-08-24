# ShebaBD Payment Gateway Integration Guide

## Providers
- **bKash**: Checkout API v1.2.0-beta with tokenized grant and payment query
- **Nagad**: Direct merchant API with public/private key signature verification
- **Bank Transfer**: Manual receipt upload with admin ledger reconciliation

## Flow
1. Client requests `POST /api/v1/donations/create`
2. Backend returns checkout URL or payment reference
3. Client completes transaction and submits verification
4. Backend confirms status and generates branded tax-exempt receipt
