export type MockResponse = {
  status: number;
  statusText: string;
  body: string;
  headers?: Record<string, string>;
};

export function createMockFetch(responses: Record<string, MockResponse>): typeof fetch {
  const mockFetch = async (input: string | URL): Promise<Response> => {
    const key = typeof input === 'string' ? input : input.href;
    const match = responses[key];

    if (!match) {
      return new Response(null, {
        status: 404,
        statusText: 'Not Found',
      });
    }

    return new Response(match.body, {
      status: match.status,
      statusText: match.statusText,
      headers: match.headers ?? { 'content-type': 'text/html' },
    });
  };

  return Object.assign(mockFetch, {
    preconnect: () => Promise.resolve(false),
  }) as typeof fetch;
}
