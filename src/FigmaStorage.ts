export enum StorageKey {
  APIkey = "APIkey",
}

export class FigmaStorage {
  async set(key: StorageKey, value: string) {
    await figma.clientStorage.setAsync(key, value);
  }

  async get(key: StorageKey): Promise<string | undefined> {
    return await figma.clientStorage.getAsync(key);
  }
}
