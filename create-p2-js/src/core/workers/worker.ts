import { expose } from 'comlink';

// Worker API
const api = {
  // Task handlers
  async processData(data: any) {
    // Implement data processing logic
    return data;
  },

  async computeHash(data: string): Promise<string> {
    // Example hash computation
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  async compress(data: any) {
    // Implement compression logic
    return data;
  },

  async encrypt(data: any) {
    // Implement encryption logic
    return data;
  }
};

// Expose the API to the main thread
expose(api);
