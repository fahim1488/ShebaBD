# ShebaBD Standardized API Error Codes

## HTTP Status Conventions
- `200 OK`: Successful retrieval or update
- `201 Created`: Resource successfully created
- `400 Bad Request`: Validation failure or business rule violation
- `401 Unauthorized`: Missing or invalid Bearer JWT token
- `403 Forbidden`: Insufficient user role permissions
- `404 Not Found`: Target resource does not exist
- `409 Conflict`: Duplicate entry (e.g. duplicate event registration)
- `422 Unprocessable Entity`: Request body schema validation error
- `500 Internal Server Error`: Unhandled server exception
