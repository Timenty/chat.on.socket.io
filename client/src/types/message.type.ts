export interface BaseMessage {
    id: string;
    time: Date;
}

export interface ChatMessage extends BaseMessage {
    userName: string;
    text: string;
    isPrivate?: boolean;
    senderTag?: string;
    to?: string;
    from?: string;
    isSender?: boolean;
    isRecipient?: boolean;
}

export interface SystemMessage extends BaseMessage {
    type: 'info' | 'error' | 'success';
    text: string;
}

export type Message = ChatMessage | SystemMessage;
