# API Configuration

## Development (Local Testing)
When testing locally with XAMPP/WAMP, use:
```javascript
export const API_BASE_URL = 'http://localhost/WorkFlow_backend/api'
```

## Production (Hostinger)
When deploying to Hostinger, update to:
```javascript
export const API_BASE_URL = 'https://yourdomain.com/api'
```

Update this in: `src/services/api.js`
