<script lang="ts">
  import type { ChatMessage as ChatMessageType, SystemMessage } from "../types/message.type";
  import { chat } from '../storage/chatStore';
  import { contacts } from '../storage/contactsStore';
  import ChatMessage from './ChatMessage.svelte';
  import ChatInput from './ChatInput.svelte';

  // Get current chat messages
  $: currentChat = $chat.currentContactTag ? 
    $chat.chats.get($chat.currentContactTag) : null;
  $: messages = currentChat?.messages || [];

  // Get current contact info
  $: currentContact = $contacts.contacts.find(contact => 
    contact.tag === $chat.currentContactTag
  );
</script>

<div class="chat-main">
  {#if currentContact}
    <div class="chat-header">
      <h3>{currentContact.userName}</h3>
      <span class="contact-tag">#{currentContact.tag}</span>
      <span 
        class="status-indicator" 
        class:online={currentContact.status === 'online'}
        class:offline={currentContact.status === 'offline'}
        title={currentContact.status === 'online' ? 'Online' : 'Offline'}
      ></span>
    </div>
  {/if}
  
  <div class="chatArea">
    {#if currentChat}
      <ul class="messages">
        {#each messages as message}
          <ChatMessage {message} />
        {/each}
      </ul>
    {:else}
      <div class="no-chat-selected">
        <p>Select a contact to start chatting</p>
      </div>
    {/if}
  </div>

  {#if currentContact}
    <ChatInput contactTag={currentContact.tag} />
  {/if}
</div>

<style lang="scss">
  .chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .chat-header {
    padding: 1rem;
    border-bottom: 1px solid #ccc;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f8f9fa;

    h3 {
      margin: 0;
      font-size: 1.2rem;
    }

    .contact-tag {
      color: #666;
      font-size: 0.9rem;
    }

    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ccc;
      margin-left: auto;
      transition: background-color 0.3s ease;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);

      &.online {
        background: #4CAF50;
        box-shadow: 0 0 4px rgba(76, 175, 80, 0.5);
      }

      &.offline {
        background: #9e9e9e;
      }
    }
  }

  .chatArea {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .no-chat-selected {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #666;
    font-style: italic;
  }

  .messages {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
