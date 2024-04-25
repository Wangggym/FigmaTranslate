export enum MessageType {
  APIkey = "APIkey",
  translate = "translate",
}

type Payload = { value: string; data?: Record<string, unknown> };

export class MessageData {
  type: MessageType | null = null;
  payload: Payload = { value: "" };

  constructor(type: MessageType, payload: Payload) {
    this.type = type;
    this.payload = payload;
  }
}

export interface Message {
  async(msg: MessageData): Promise<void>;
}
