# Webhook CORS Configuration

## Problem
The n8n webhook at `https://starkauto.app.n8n.cloud/webhook-test/bc653edd-68ff-4264-8ad2-cd5e5032303b` is blocking requests from your frontend (`https://hackbarna.anlak.es`) due to missing CORS headers.

Error:
```
Access to fetch at 'https://starkauto.app.n8n.cloud/webhook-test/...' from origin 'https://hackbarna.anlak.es'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

You need to configure the n8n webhook to add CORS headers. Here's how:

### Option 1: Configure CORS in n8n Workflow (Recommended)

1. Open your n8n workflow that contains the webhook
2. Find the **Webhook** node (the one that receives the POST request)
3. Add a **Respond to Webhook** node or **Set** node to add CORS headers to the response
4. Add the following headers:

```json
{
  "Access-Control-Allow-Origin": "https://hackbarna.anlak.es",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
}
```

### Option 2: Handle OPTIONS Preflight Request

Modern browsers send an OPTIONS request before the actual POST request (CORS preflight). You need to handle this:

1. In your n8n webhook node, enable **Respond** mode
2. Add an **IF** node to check the request method:
   - If `{{ $node["Webhook"].json["method"] }}` equals `OPTIONS`
   - Respond with status `204` and the CORS headers above
   - Otherwise, proceed with normal processing

### Option 3: Allow All Origins (Quick Fix - Not Recommended for Production)

If you want to quickly test, you can allow all origins:

```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

⚠️ **Warning**: This is less secure and should only be used for testing.

### Example n8n Workflow Configuration

```
[Webhook Trigger] → [IF Node: Check if OPTIONS]
                    ├─ TRUE → [Respond: 204 + CORS headers]
                    └─ FALSE → [Process Request] → [Respond: 200 + CORS headers + data]
```

## Alternative: Use Server-Side Proxy

If you cannot modify the n8n webhook, you can create a server-side proxy in your Next.js app:

1. Create `/app/api/webhook/route.ts`:

```typescript
export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(process.env.WEBHOOK_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.WEBHOOK_USER && {
        'Authorization': `Basic ${btoa(process.env.WEBHOOK_USER + ':' + process.env.WEBHOOK_PASSWORD)}`
      })
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  return Response.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
```

2. Update `NEXT_PUBLIC_WEBHOOK` in your `.env` to point to `/api/webhook` instead of the n8n URL directly.

## Testing

After applying the fix, test by:
1. Opening the browser console at `https://hackbarna.anlak.es/inspiration`
2. Enter a query and submit
3. Check the Network tab - the webhook request should succeed
4. You should see: `✅ Webhook response received` in the console

## Current Behavior

The app gracefully falls back to Firebase when the webhook fails, so the app still works. However, the webhook would provide better, personalized recommendations based on user preferences.
