<script lang="ts">
  import type { ChatMessage, SystemMessage } from "../types/message.type";

  export let message: ChatMessage | SystemMessage;

  function formatTime(time: Date): string {
    return new Date(time).toLocaleTimeString();
  }

  function isSystemMessage(message: ChatMessage | SystemMessage): message is SystemMessage {
    return 'type' in message;
  }

  function isChatMessage(message: ChatMessage | SystemMessage): message is ChatMessage {
    return 'userName' in message;
  }

  function extractNameAndTag(userName: string): { name: string; tag: string } {
    const parts = userName.split('#');
    return {
      name: parts[0],
      tag: parts.length > 1 ? parts[1] : ''
    };
  }
</script>

{#if isSystemMessage(message)}
  <li class="system-message {message.type}">
    {message.text}
    <span class="time">{formatTime(message.time)}</span>
  </li>
{:else if isChatMessage(message)}
  {@const { name, tag } = extractNameAndTag(message.userName)}
  <li class="chat-message" class:private={message.isPrivate} class:sent={message.isSender} class:received={message.isRecipient}>
    <div class="message-header">
      <span class="username">{name}</span>
      {#if tag}
        <span class="tag">#{tag}</span>
      {/if}
      {#if message.isPrivate}
        <span class="private-indicator">
          {message.isSender ? `to ${message.to}` : `from ${message.from}`}
        </span>
      {/if}
      <span class="time">{formatTime(message.time)}</span>
    </div>
    <div class="message-text">{message.text}</div>
  </li>
{/if}

<style lang="scss">
  .system-message {
    text-align: center;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.9em;
    color: #666;

    &.error {
      background: #ffebee;
      color: #c62828;
    }

    &.success {
      background: #e8f5e9;
      color: #2e7d32;
    }

    &.info {
      background: #e3f2fd;
      color: #1565c0;
    }

    .time {
      margin-left: 0.5rem;
      font-size: 0.8em;
      opacity: 0.7;
    }
  }

  .chat-message {
    padding: 0.75rem;
    background: #f5f5f5;
    border-radius: 4px;
    max-width: 80%;

    &.sent {
      margin-left: auto;
      background: #e3f2fd;
    }

    &.received {
      margin-right: auto;
      background: #f5f5f5;
    }

    &.private {
      background: #fff3e0;
      
      &.sent {
        background: #ffe0b2;
      }
    }

    .message-header {
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9em;

      .username {
        font-weight: 500;
      }

      .tag {
        color: #666;
      }

      .private-indicator {
        color: #e65100;
        font-style: italic;
      }

      .time {
        color: #666;
        margin-left: auto;
      }
    }

    .message-text {
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
</style>
