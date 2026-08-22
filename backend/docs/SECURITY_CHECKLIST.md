# ShebaBD Security Audit & Hardening Checklist

- [x] **CORS Configuration**: Restrict allowed origins to trusted frontends
- [x] **Password Hashing**: bcrypt with minimum work factor of 12
- [x] **JWT Expiration**: 7-day token rotation with signature verification
- [x] **SQL Injection Prevention**: 100% parameterized queries via SQLAlchemy 2.0
- [x] **Input Validation**: Strict Pydantic models for all request bodies
- [x] **Non-blocking Email**: BackgroundTasks used for SMTP to prevent request locking
