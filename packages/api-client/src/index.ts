export interface ApiClientOptions {
  baseUrl: string;
  fetchImplementation?: typeof fetch;
}

/**
 * Future REST client boundary. OpenAPI generation may replace this minimal
 * transport wrapper after the API contract work item is approved.
 */
export const createApiClient = ({ baseUrl, fetchImplementation = fetch }: ApiClientOptions) => ({
  async health(): Promise<{ status: string }> {
    const response = await fetchImplementation(`${baseUrl}/api/v1/health`);

    if (!response.ok) {
      throw new Error(`API health request failed with ${response.status}`);
    }

    return response.json() as Promise<{ status: string }>;
  },
});
