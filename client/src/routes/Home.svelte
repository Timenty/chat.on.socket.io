<script lang="ts">
  import { nanoid } from 'nanoid';
  import type { ChatMessage, SystemMessage } from "../types/message.type";
  import { sendMessage } from '../storage/socketStore';
  import { user } from '../storage/userStore';
  import { chat } from '../storage/chatStore';
  import Contacts from '../components/Contacts.svelte';

  let userName = $user.userName;
  $: messages = $chat.currentChat.messages;
  let msgText: string = "";

  function send(): void {
    if (!msgText.trim()) return;
    
    sendMessage({
      id: nanoid(),
      userName,
      text: msgText,
      time: new Date(),
      senderTag: $user.tag
    } as ChatMessage);
    
    msgText = "";
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  function formatTime(time: Date): string {
    return new Date(time).toLocaleTimeString();
  }

  function isSystemMessage(message: ChatMessage | SystemMessage): message is SystemMessage {
    return 'type' in message;
  }

  function isChatMessage(message: ChatMessage | SystemMessage): message is ChatMessage {
    return 'userName' in message;
  }
</script>

<div class="chat-container">
  <div class="chat-main">
    <div class="chatArea">
      <ul class="messages">
        {#each messages as message}
          {#if isSystemMessage(message)}
            <li class="system-message {message.type}">
              {message.text}
              <span class="time">{formatTime(message.time)}</span>
            </li>
          {:else if isChatMessage(message)}
            <li class="chat-message" class:private={message.isPrivate}>
              <div class="message-header">
                <span class="username">{message.userName}</span>
                {#if message.senderTag}
                  <span class="tag">{message.senderTag}</span>
                {/if}
                {#if message.isPrivate}
                  <span class="private-indicator">
                    {message.to ? `to ${message.to}` : `from ${message.from}`}
                  </span>
                {/if}
                <span class="time">{formatTime(message.time)}</span>
              </div>
              <div class="message-text">{message.text}</div>
            </li>
          {/if}
        {/each}
      </ul>
    </div>
    <div class="input-area">
      <textarea
        bind:value={msgText}
        class="inputMessage"
        placeholder="Type here..."
        on:keydown={handleKeydown}
        rows="3"
      />
      <button class="send-button" on:click={send}>Send</button>
    </div>
  </div>
  <Contacts />
</div>

<style lang="scss">
  .chat-container {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .chatArea {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .messages {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

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

    &.private {
      background: #fff3e0;
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

  .input-area {
    padding: 1rem;
    border-top: 1px solid #ccc;
    display: flex;
    gap: 0.5rem;
  }

  .inputMessage {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: none;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #2196F3;
    }
  }

  .send-button {
    padding: 0 1.5rem;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      background: #1976D2;
    }
  }
</style>
