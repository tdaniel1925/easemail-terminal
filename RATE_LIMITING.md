# Rate Limiting Implementation

## Overview
Rate limiting has been implemented to protect the API from abuse, prevent DoS attacks, and control costs for expensive operations like AI calls.

## Rate Limit Tiers

### AI Endpoints (Strictest)
- **Limit**: 10 requests per minute
- **Endpoints**:
  - `/api/ai/remix` - Email rewriting with AI
  - `/api/ai/dictate` - Voice-to-text transcription
  - `/api/ai/extract-event` - Calendar event extraction
- **Reason**: OpenAI API calls are expensive and should be rate-limited

### Authentication (Anti-Brute Force)
- **Limit**: 5 requests per minute
- **Endpoints**:
  - `/api/auth/2fa/verify` - 2FA token verification
- **Reason**: Prevent brute force attacks on authentication

### Email Sending
- **Limit**: 30 requests per minute
- **Endpoints**:
  - `/api/messages/send` - Send new email
  - `/api/messages/reply` - Reply to email
- **Reason**: Prevent spam, protect against email abuse

### General API (Default)
- **Limit**: 100 requests per minute
- **Endpoints**: Most other API endpoints
- **Reason**: Reasonable limit for typical user behavior

### Read Operations (Relaxed)
- **Limit**: 300 requests per minute
- **Endpoints**: GET requests for messages, folders, etc.
- **Reason**: Allow fast browsing and searching

### Webhooks (Most Relaxed)
- **Limit**: 1000 requests per minute
- **Endpoints**: Webhook receivers
- **Reason**: High-volume external systems may need more throughput

## Technical Implementation

### Redis Backend
Rate limiting uses Upstash Redis (configured in `.env.local`):
```
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token
```

If Redis is not configured, rate limiting is **disabled** (falls back to allowing all requests with a warning).

### Algorithm
- **Sliding Window**: Tracks requests in a time window, removing old entries
- **Per-IP Tracking**: Rate limits are applied per IP address
- **Headers**: Returns standard rate limit headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

### Response Format
When rate limit is exceeded:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 45 seconds.",
  "retryAfter": 1707001234567
}
```
HTTP Status: `429 Too Many Requests`

## Adding Rate Limiting to New Endpoints

1. Import the rate limit utilities:
```typescript
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
```

2. Add rate limiting at the start of your handler:
```typescript
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, RateLimitPresets.API);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)}s.`
        },
        {
          status: 429,
          headers: { 'X-RateLimit-Reset': rateLimitResult.reset.toString() }
        }
      );
    }

    // Your endpoint logic here...
  } catch (error) {
    // Error handling
  }
}
```

3. Choose appropriate preset:
- `RateLimitPresets.AI` - For expensive AI operations
- `RateLimitPresets.AUTH` - For authentication endpoints
- `RateLimitPresets.EMAIL_SEND` - For email sending
- `RateLimitPresets.API` - For general API endpoints
- `RateLimitPresets.READ` - For read-only operations
- `RateLimitPresets.WEBHOOK` - For webhook receivers

## Custom Rate Limits

For custom rate limits:
```typescript
const rateLimitResult = await rateLimit(request, {
  maxRequests: 50,
  windowSeconds: 300, // 5 minutes
});
```

## Monitoring

Rate limit information is available in response headers on every request. Monitor these headers to understand usage patterns:

```bash
curl -I https://your-domain.com/api/messages
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 87
# X-RateLimit-Reset: 1707001234567
```

## Production Considerations

1. **Redis Required**: Ensure Upstash Redis is configured in production
2. **IP Forwarding**: Ensure `x-forwarded-for` header is properly set by your proxy (Vercel handles this automatically)
3. **User-Specific Limits**: Consider implementing per-user rate limits for authenticated endpoints using `getUserIdentifier()` helper
4. **Monitoring**: Set up alerts for high rate limit violations
5. **Adjustments**: Monitor usage patterns and adjust limits as needed

## Fallback Behavior

If Redis is unavailable:
- Rate limiting is **disabled**
- Warning is logged to console
- All requests are allowed
- Should be treated as a degraded state and fixed immediately

## Future Enhancements

- [ ] Per-user rate limits (currently per-IP)
- [ ] Different limits based on subscription tier
- [ ] Rate limit bypass for trusted IPs
- [ ] Dashboard for rate limit analytics
- [ ] Dynamic rate limit adjustment based on server load
