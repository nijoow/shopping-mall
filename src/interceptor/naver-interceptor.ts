export const naverFetchInterceptor =
  (originalFetch: typeof fetch) =>
  async (
    url: Parameters<typeof fetch>[0],
    options: Parameters<typeof fetch>[1] = {},
  ) => {
    if (
      url === 'https://nid.naver.com/oauth2.0/token' &&
      options.method === 'POST'
    ) {
      const response = await originalFetch(url, options);
      const clonedResponse = response.clone();
      const body = await clonedResponse.json();

      body.expires_in = Number(body.expires_in); // 문자열로 되어 있는, expires_in을 숫자로 변환

      const modifiedResponse = new Response(JSON.stringify(body), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      return Object.defineProperty(modifiedResponse, 'url', {
        value: url,
      });
    }

    return originalFetch(url, options);
  };
