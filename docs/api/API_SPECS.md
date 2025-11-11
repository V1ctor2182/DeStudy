# API Specifications v0.1

**Date**: 2025-11-10
**Status**: Draft
**Framework**: Next.js API Routes (App Router)

---

## 1. Overview

DeStudy's backend API is minimal, leveraging blockchain and IPFS for most functionality. API routes are implemented as Next.js API routes (App Router) for:

1. **IPFS Upload Proxy** (optional): Server-side upload to protect API keys
2. **Metadata Generation**: Generate NFT metadata JSON
3. **Telemetry**: Log client events for analytics
4. **Health Check**: Service status endpoint

---

## 2. API Endpoints

### 2.1 IPFS Upload Proxy

**Endpoint**: `POST /api/upload`

**Description**: Proxies file uploads to IPFS (Web3.storage or Pinata), protecting API keys from client exposure.

**Request**:
```http
POST /api/upload
Content-Type: multipart/form-data

file: <File>
```

**Request Body**:
- `file` (required): File to upload (PDF, MD, PNG, JPG)

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "cid": "QmXxxx...",
    "size": 1234567,
    "url": "https://w3s.link/ipfs/QmXxxx...",
    "uploadedAt": "2025-11-10T12:00:00Z"
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_FAILED",
    "message": "Failed to upload file to IPFS",
    "details": "Connection timeout"
  }
}
```

**Status Codes**:
- `200`: Upload successful
- `400`: Invalid request (file missing, wrong type, too large)
- `413`: File too large (>50MB)
- `415`: Unsupported file type
- `429`: Rate limit exceeded
- `500`: Server error
- `503`: IPFS service unavailable

**Rate Limiting**:
- **Limit**: 10 uploads per minute per IP
- **Response Header**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

#### Implementation

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Web3Storage } from 'web3.storage';
import { rateLimit } from '@/lib/rate-limit';

const client = new Web3Storage({
  token: process.env.WEB3_STORAGE_TOKEN!,
});

const ALLOWED_TYPES = ['application/pdf', 'text/markdown', 'image/png', 'image/jpeg'];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip ?? 'anonymous';
    const { success, remaining, reset } = await rateLimit(identifier);
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many uploads. Please try again later.',
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_MISSING',
            message: 'No file provided',
          },
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'File type not supported',
            details: `Allowed types: ${ALLOWED_TYPES.join(', ')}`,
          },
        },
        { status: 415 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File exceeds maximum size of 50MB',
          },
        },
        { status: 413 }
      );
    }

    // Upload to IPFS
    const cid = await client.put([file], {
      name: file.name,
      maxRetries: 3,
    });

    // Generate IPFS URL
    const url = `https://w3s.link/ipfs/${cid}`;

    // Log telemetry
    await logEvent('ipfs_upload_success', {
      cid,
      fileType: file.type,
      fileSize: file.size,
      ip: identifier,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          cid,
          size: file.size,
          url,
          uploadedAt: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Upload error:', error);

    // Log telemetry
    await logEvent('ipfs_upload_fail', {
      error: error.message,
      ip: request.ip ?? 'anonymous',
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: 'Failed to upload file to IPFS',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
```

---

### 2.2 Generate NFT Metadata

**Endpoint**: `POST /api/metadata`

**Description**: Generates NFT metadata JSON conforming to ERC-721 metadata standard.

**Request**:
```json
{
  "tokenId": "1",
  "title": "IKNS-5300 Notes - v1.0",
  "description": "Study notes for Knowledge Structures",
  "cid": "QmXxxx...",
  "previewCid": "QmYyyy...",
  "courseId": "IKNS-5300",
  "version": "v1.0",
  "author": "0x1234...",
  "createdAt": 1699999999
}
```

**Response**:
```json
{
  "name": "IKNS-5300 Notes - v1.0",
  "description": "Study notes for Knowledge Structures by 0x1234...",
  "image": "ipfs://QmYyyy...",
  "external_url": "https://app.destudy.xyz/note/1",
  "attributes": [
    {
      "trait_type": "courseId",
      "value": "IKNS-5300"
    },
    {
      "trait_type": "version",
      "value": "v1.0"
    },
    {
      "trait_type": "cid",
      "value": "QmXxxx..."
    },
    {
      "trait_type": "createdAt",
      "display_type": "date",
      "value": 1699999999
    }
  ]
}
```

**Status Codes**:
- `200`: Metadata generated successfully
- `400`: Invalid request (missing required fields)

---

#### Implementation

```typescript
// app/api/metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface MetadataRequest {
  tokenId: string;
  title: string;
  description?: string;
  cid: string;
  previewCid?: string;
  courseId: string;
  version: string;
  author: string;
  createdAt: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: MetadataRequest = await request.json();

    // Validate required fields
    const required = ['tokenId', 'title', 'cid', 'courseId', 'version', 'author', 'createdAt'];
    for (const field of required) {
      if (!body[field as keyof MetadataRequest]) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_FIELD',
              message: `Missing required field: ${field}`,
            },
          },
          { status: 400 }
        );
      }
    }

    // Generate metadata
    const metadata = {
      name: body.title,
      description:
        body.description ||
        `Study notes for ${body.courseId} by ${body.author.slice(0, 6)}...${body.author.slice(-4)}`,
      image: body.previewCid ? `ipfs://${body.previewCid}` : '',
      external_url: `${process.env.NEXT_PUBLIC_APP_URL}/note/${body.tokenId}`,
      attributes: [
        {
          trait_type: 'courseId',
          value: body.courseId,
        },
        {
          trait_type: 'version',
          value: body.version,
        },
        {
          trait_type: 'cid',
          value: body.cid,
        },
        {
          trait_type: 'createdAt',
          display_type: 'date',
          value: body.createdAt,
        },
      ],
    };

    return NextResponse.json(metadata, { status: 200 });
  } catch (error: any) {
    console.error('Metadata generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'METADATA_GENERATION_FAILED',
          message: 'Failed to generate metadata',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
```

---

### 2.3 Telemetry

**Endpoint**: `POST /api/telemetry`

**Description**: Logs client events for analytics and monitoring.

**Request**:
```json
{
  "event": "wallet_connected",
  "properties": {
    "address": "0x1234...",
    "connector": "metamask",
    "chainId": 84532
  },
  "timestamp": 1699999999000
}
```

**Response**:
```json
{
  "success": true
}
```

**Status Codes**:
- `200`: Event logged successfully
- `400`: Invalid request
- `429`: Rate limit exceeded

**Events List** (from PRD §10.3):
- `wallet_connected`
- `wallet_disconnected`
- `ipfs_upload_start`
- `ipfs_upload_success`
- `ipfs_upload_fail`
- `mint_submit`
- `mint_success`
- `mint_fail`
- `tip_click`
- `tip_success`
- `tip_fail`
- `note_view`
- `explore_filter_change`
- `subgraph_latency`

---

#### Implementation

```typescript
// app/api/telemetry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

interface TelemetryEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (higher limit for telemetry)
    const identifier = request.ip ?? 'anonymous';
    const { success } = await rateLimit(identifier, { limit: 100, window: 60 });
    if (!success) {
      return NextResponse.json({ success: false }, { status: 429 });
    }

    const body: TelemetryEvent = await request.json();

    // Validate event name
    if (!body.event || typeof body.event !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EVENT',
            message: 'Event name is required',
          },
        },
        { status: 400 }
      );
    }

    // Log to analytics service (e.g., Mixpanel, Amplitude, PostHog)
    // For MVP, just log to console or file
    console.log('[Telemetry]', {
      event: body.event,
      properties: body.properties,
      timestamp: body.timestamp || Date.now(),
      ip: identifier,
      userAgent: request.headers.get('user-agent'),
    });

    // TODO: Send to analytics service
    // await analytics.track({
    //   event: body.event,
    //   properties: body.properties,
    //   timestamp: body.timestamp,
    // });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Telemetry error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

---

### 2.4 Health Check

**Endpoint**: `GET /api/health`

**Description**: Returns the health status of the API and its dependencies.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T12:00:00Z",
  "services": {
    "ipfs": {
      "status": "up",
      "latency": 123
    },
    "subgraph": {
      "status": "up",
      "latency": 45,
      "syncBlock": 12345678
    },
    "rpc": {
      "status": "up",
      "latency": 67,
      "blockNumber": 12345678
    }
  }
}
```

**Status Codes**:
- `200`: All services healthy
- `503`: One or more services unhealthy

---

#### Implementation

```typescript
// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Web3Storage } from 'web3.storage';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { request, gql } from 'graphql-request';

const ipfsClient = new Web3Storage({
  token: process.env.WEB3_STORAGE_TOKEN!,
});

const rpcClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

export async function GET(request: NextRequest) {
  const services: Record<string, any> = {};
  let overallStatus = 'healthy';

  // Check IPFS
  try {
    const start = Date.now();
    // Simple check: list uploads (should be fast)
    await ipfsClient.list({ maxResults: 1 });
    services.ipfs = {
      status: 'up',
      latency: Date.now() - start,
    };
  } catch (error) {
    services.ipfs = {
      status: 'down',
      error: (error as Error).message,
    };
    overallStatus = 'unhealthy';
  }

  // Check Subgraph
  try {
    const start = Date.now();
    const query = gql`
      query {
        _meta {
          block {
            number
          }
        }
      }
    `;
    const result: any = await request(process.env.NEXT_PUBLIC_SUBGRAPH_URL!, query);
    services.subgraph = {
      status: 'up',
      latency: Date.now() - start,
      syncBlock: result._meta.block.number,
    };
  } catch (error) {
    services.subgraph = {
      status: 'down',
      error: (error as Error).message,
    };
    overallStatus = 'unhealthy';
  }

  // Check RPC
  try {
    const start = Date.now();
    const blockNumber = await rpcClient.getBlockNumber();
    services.rpc = {
      status: 'up',
      latency: Date.now() - start,
      blockNumber: Number(blockNumber),
    };
  } catch (error) {
    services.rpc = {
      status: 'down',
      error: (error as Error).message,
    };
    overallStatus = 'unhealthy';
  }

  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
    },
    { status: statusCode }
  );
}
```

---

## 3. Rate Limiting

### 3.1 Implementation

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  limit: number; // Max requests per window
  window: number; // Window in seconds
}

const defaultOptions: RateLimitOptions = {
  limit: 10,
  window: 60, // 1 minute
};

const tokenCache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 60000, // 1 minute
});

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = defaultOptions
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { limit, window } = options;
  const now = Date.now();
  const windowStart = now - window * 1000;

  // Get existing timestamps
  const timestamps = tokenCache.get(identifier) || [];

  // Filter out timestamps outside the window
  const recentTimestamps = timestamps.filter((ts) => ts > windowStart);

  // Check if limit exceeded
  if (recentTimestamps.length >= limit) {
    const oldestTimestamp = recentTimestamps[0];
    const reset = oldestTimestamp + window * 1000;
    return {
      success: false,
      remaining: 0,
      reset: Math.ceil(reset / 1000),
    };
  }

  // Add current timestamp
  recentTimestamps.push(now);
  tokenCache.set(identifier, recentTimestamps);

  return {
    success: true,
    remaining: limit - recentTimestamps.length,
    reset: Math.ceil((now + window * 1000) / 1000),
  };
}
```

---

## 4. Error Handling

### 4.1 Error Response Format

All error responses follow this structure:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string; // Machine-readable error code
    message: string; // Human-readable message
    details?: string; // Additional details (optional)
  };
}
```

### 4.2 Error Codes

| Code | Description |
|------|-------------|
| `FILE_MISSING` | No file provided in upload request |
| `INVALID_FILE_TYPE` | File type not supported |
| `FILE_TOO_LARGE` | File exceeds maximum size |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `UPLOAD_FAILED` | IPFS upload failed |
| `METADATA_GENERATION_FAILED` | Failed to generate metadata |
| `INVALID_EVENT` | Invalid telemetry event |
| `MISSING_FIELD` | Required field missing |
| `SERVICE_UNAVAILABLE` | Dependency service unavailable |

---

## 5. Authentication & Authorization

**MVP**: No authentication required for API routes.

**Future**:
- JWT-based auth for user-specific endpoints
- API key auth for third-party integrations
- Rate limiting by authenticated user (higher limits)

---

## 6. CORS Configuration

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow CORS from specific origins
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
  ];

  const response = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## 7. Monitoring & Logging

### 7.1 Logging Strategy

- **Info**: Successful operations (upload, metadata generation)
- **Warn**: Rate limit exceeded, validation errors
- **Error**: IPFS failures, service unavailability

### 7.2 Metrics

Track using middleware:
- Request count (by endpoint)
- Response time (p50, p95, p99)
- Error rate (by endpoint, error code)
- Rate limit hits

### 7.3 Alerting

- Error rate > 5% for 5 minutes
- Response time p95 > 3s
- Service health check failures

---

## 8. Security Considerations

### 8.1 Input Validation

- File type whitelist (no executable files)
- File size limits (50MB max)
- String length limits (prevent DoS)
- Sanitize user inputs

### 8.2 Rate Limiting

- Per IP for anonymous users
- Per user for authenticated users (future)
- Different limits per endpoint

### 8.3 API Key Protection

- Never expose API keys in client-side code
- Use environment variables
- Rotate keys regularly
- Monitor usage for anomalies

### 8.4 CORS

- Allow only trusted origins
- Restrict methods (GET, POST only)

---

## 9. Testing

### 9.1 Unit Tests

```typescript
// __tests__/api/upload.test.ts
import { POST } from '@/app/api/upload/route';
import { NextRequest } from 'next/server';

describe('/api/upload', () => {
  it('should upload file successfully', async () => {
    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.cid).toBeDefined();
  });

  it('should reject invalid file type', async () => {
    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.exe', { type: 'application/x-msdownload' }));

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_FILE_TYPE');
  });
});
```

### 9.2 Integration Tests

Test with actual IPFS and blockchain services:
- Upload file → verify CID
- Generate metadata → verify structure
- Health check → verify service status

---

## 10. API Documentation

**Tool**: Generate API docs with Swagger/OpenAPI

```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: DeStudy API
  version: 0.1.0
  description: API for DeStudy note-sharing platform
servers:
  - url: https://app.destudy.xyz/api
    description: Production
  - url: http://localhost:3000/api
    description: Development
paths:
  /upload:
    post:
      summary: Upload file to IPFS
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '200':
          description: Upload successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UploadResponse'
# ... more paths
```

---

## 11. Environment Variables

```bash
# .env.local

# IPFS (Web3.storage)
WEB3_STORAGE_TOKEN=eyJhbGc...

# RPC
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# Subgraph
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/...

# App URL
NEXT_PUBLIC_APP_URL=https://app.destudy.xyz

# Analytics (optional)
NEXT_PUBLIC_MIXPANEL_TOKEN=...
SENTRY_DSN=...
```

---

## 12. Future Enhancements

### 12.1 Batch Operations

- Batch upload multiple files
- Batch metadata generation

### 12.2 Webhooks

- Notify on mint/tip events
- Integrate with external services

### 12.3 Admin API

- Manage platform parameters
- View analytics
- Moderate content

### 12.4 Search API

- Full-text search (Meilisearch/Algolia)
- Autocomplete for course IDs
- Tag-based filtering

---

**Document Version**: 0.1
**Last Updated**: 2025-11-10
**Next Review**: After API implementation (D5)
