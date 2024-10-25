<script lang="ts">
  import type { ChatMessage, SystemMessage } from "../types/message.type";
  import "../styles/components/ChatMessage.scss";

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
