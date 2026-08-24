# ShebaBD Relational Database Schema

## Core Tables

### 1. `users`
- `id`: VARCHAR(36) PK
- `name`: VARCHAR(100)
- `email`: VARCHAR(255) UNIQUE
- `password_hash`: VARCHAR(255)
- `role`: VARCHAR(20) (member, volunteer, ngo, admin)

### 2. `events`
- `id`: INTEGER PK
- `title`: VARCHAR(200)
- `category`: VARCHAR(50)
- `datetime_start`: TIMESTAMP
- `registration_deadline`: TIMESTAMP
- `capacity`: INTEGER
- `registered_count`: INTEGER

### 3. `event_registrations`
- `id`: INTEGER PK
- `event_id`: INTEGER FK -> events.id
- `user_id`: VARCHAR(36) FK -> users.id
- `status`: VARCHAR(20) (confirmed, cancelled)
- `confirmation_sent`: BOOLEAN
- `reminder_sent`: BOOLEAN
