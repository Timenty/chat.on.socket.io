<script lang="ts">
  import { nanoid } from 'nanoid';
  import type { ChatMessage as ChatMessageType } from "../types/message.type";
  import { sendMessage } from '../storage/socketStore';
  import { contacts } from '../storage/contactsStore';
  import { user } from '../storage/userStore';
  import { chat } from '../storage/chatStore';
  import "../styles/components/ChatInput.scss";

  export let contactTag: string;

  $: currentContact = $contacts.contacts.find(contact => 
    contact.tag === contactTag
  );

  console.log('$contacts.contacts', $contacts.contacts);
  console.log('currentContact', currentContact);
  let msgText: string = "";
  let userName = $user.user?.userName || "";

  function send(): void {
    if (!msgText.trim() || !$user.user) return;
    
    sendMessage({
      id: nanoid(),
      userName,
      text: msgText,
      time: new Date(),
      isPrivate: true,
      to: currentContact?.tag || "no recipient",
      senderTag: $user.user.tag
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
