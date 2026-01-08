// api-runtime.js
class APIRuntime {
  constructor(backend) {
    this.backend = backend;
    this.endpoints = new Map();
    this.middleware = [];
    this.cache = new Map();
  }

  async initialize() {
    // Load API configurations from backend
    const apis = await this.backend.getAPIConfigs();

    apis.forEach((api) => {
      this.registerEndpoint(api.glyph, api.config);
    });

    console.log(`✅ API Runtime loaded: ${apis.length} endpoints`);
  }

  registerEndpoint(glyph, config) {
    const endpoint = {
      glyph,
      url: config.url,
      method: config.method || 'GET',
      headers: config.headers || {},
      auth: config.auth,
      cacheTTL: config.cacheTTL || 0,
      rateLimit: config.rateLimit || 1000,
    };

    this.endpoints.set(glyph, endpoint);

    // Generate SCXQ2 compression for URL
    const compressedGlyph = SCXQ2.urlToGlyph(config.url);
    if (compressedGlyph !== glyph) {
      this.endpoints.set(compressedGlyph, endpoint);
    }

    return glyph;
  }

  async callByGlyph(glyph, data = null, options = {}) {
    const endpoint = this.endpoints.get(glyph);

    if (!endpoint) {
      throw new Error(`No endpoint registered for glyph: ${glyph}`);
    }

    // Check cache
    if (endpoint.cacheTTL > 0) {
      const cacheKey = this.getCacheKey(glyph, data);
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < endpoint.cacheTTL) {
        return cached.data;
      }
    }

    // Get API key from backend (local, encrypted)
    let apiKey = null;
    if (endpoint.auth) {
      apiKey = await this.backend.getAPIKey(glyph);
    }

    // Make request
    const response = await this.makeRequest(endpoint, data, apiKey, options);

    // Cache response
    if (endpoint.cacheTTL > 0) {
      const cacheKey = this.getCacheKey(glyph, data);
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });
    }

    // Track usage
    await this.backend.trackGlyphUsage(glyph);

    return response;
  }

  async makeRequest(endpoint, data, apiKey, options) {
    const headers = {
      ...endpoint.headers,
      'Content-Type': 'application/json',
      'User-Agent': 'Nexus-Runtime/1.0',
    };

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const config = {
      method: endpoint.method,
      headers,
      timeout: options.timeout || 30000,
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(endpoint.url, config);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      if (contentType && contentType.includes('text/')) {
        return await response.text();
      }
      return await response.arrayBuffer();
    } catch (error) {
      console.error(`API call failed: ${error.message}`);
      throw error;
    }
  }

  async batchCall(glyphs, dataArray) {
    // Execute multiple API calls in parallel
    const promises = glyphs.map((glyph, index) =>
      this.callByGlyph(glyph, dataArray[index])
    );

    return Promise.all(promises);
  }

  async streamCall(glyph, data, onChunk) {
    // Streaming API call
    const endpoint = this.endpoints.get(glyph);

    if (!endpoint) {
      throw new Error(`No endpoint for glyph: ${glyph}`);
    }

    const apiKey = await this.backend.getAPIKey(glyph);

    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...endpoint.headers,
      },
      body: JSON.stringify(data),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);

      // Parse SSE format if applicable
      if (chunk.includes('data: ')) {
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.substring(6);

            if (payload === '[DONE]') break;

            try {
              const parsed = JSON.parse(payload);
              onChunk(parsed);
            } catch (error) {
              onChunk({ text: payload });
            }
          }
        }
      } else {
        onChunk({ chunk });
      }
    }
  }

  getCacheKey(glyph, data) {
    return `${glyph}:${JSON.stringify(data)}`;
  }

  // Middleware support
  use(middleware) {
    this.middleware.push(middleware);
  }

  async executeWithMiddleware(glyph, data) {
    // Apply middleware chain
    let currentIndex = 0;
    const context = { glyph, data };

    const next = async () => {
      if (currentIndex < this.middleware.length) {
        const middleware = this.middleware[currentIndex++];
        await middleware(context, next);
      } else {
        // Final execution
        return await this.callByGlyph(glyph, data);
      }
    };

    return await next();
  }

  // Mock responses for development
  mockEndpoint(glyph, mockData) {
    this.endpoints.set(glyph, {
      glyph,
      mock: true,
      data: mockData,
    });
  }

  // Generate OpenAPI/Swagger documentation
  generateOpenAPI() {
    const paths = {};

    for (const [glyph, endpoint] of this.endpoints) {
      if (endpoint.mock) continue;

      const path = endpoint.url.replace(/^https?:\/\/[^/]+/, '');

      paths[path] = {
        [endpoint.method.toLowerCase()]: {
          summary: `Endpoint: ${glyph}`,
          parameters: [
            {
              name: 'glyph',
              in: 'header',
              required: true,
              schema: { type: 'string', example: glyph },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
            },
          },
        },
      };
    }

    return {
      openapi: '3.0.0',
      info: {
        title: 'Nexus Runtime API',
        version: '1.0.0',
      },
      paths,
    };
  }
}

export { APIRuntime };
