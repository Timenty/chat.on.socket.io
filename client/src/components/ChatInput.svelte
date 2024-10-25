<script lang="ts">
  import { nanoid } from 'nanoid';
  import type { ChatMessage as ChatMessageType } from "../types/message.type";
  import { sendMessage } from '../storage/socketStore';
  import { contacts } from '../storage/contactsStore';
  import { user } from '../storage/userStore';
  import { chat } from '../storage/chatStore';

  export let contactTag: string;

  $: currentContact = $contacts.contacts.find(contact => 
    contact.tag === $chat.currentContactTag
  );

  console.log('$contacts.contacts', $contacts.contacts);
  console.log('currentContact', currentContact);
  let msgText: string = "";
  let userName = $user.userName;

  function send(): void {
    if (!msgText.trim()) return;
    
    sendMessage({
      id: nanoid(),
      userName,
      text: msgText,
      time: new Date(),
      isPrivate: true,
      to: currentContact?.tag || "no recipient",
      senderTag: $user.tag
    } as ChatMessageType);
    
    msgText = "";
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }
</script>

<div class="input-area">
  <textarea
    bind:value={msgText}
    class="inputMessage"
    placeholder="Type here..."
    on:keydown={handleKeydown}
    rows="3"
  />
  <button 
    class="send-button" 
    on:click={send}
  >
    Send
  </button>
</div>

<style lang="scss">
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
