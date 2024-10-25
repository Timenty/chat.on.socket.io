<script lang="ts">
  import type { ChatMessage as ChatMessageType, SystemMessage } from "../types/message.type";
  import { chat } from '../storage/chatStore';
  import { contacts } from '../storage/contactsStore';
  import ChatMessage from './ChatMessage.svelte';
  import ChatInput from './ChatInput.svelte';
  import "../styles/components/ChatWindow.scss";

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
