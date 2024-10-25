<script lang="ts">
  import { contacts } from '../storage/contactsStore';
  import { user } from '../storage/userStore';
  import { chat } from '../storage/chatStore';
  import { socketStore } from '../storage/socketStore';
  import type { Contact } from '../types/user.type';
  import "../styles/components/Contacts.scss";

  let newContactTag = '';
  let selectedContact: Contact | null = null;
  let copyFeedback = false;

  function addContact() {
    if (newContactTag.trim()) {
      contacts.addContact(newContactTag.trim());
      newContactTag = '';
    }
  }

  function selectContact(contact: Contact) {
    selectedContact = contact;
    console.log("Selected contact:", selectedContact);
    chat.switchToChat(contact.tag);
    socketStore.getSocket().emit('getChatHistory', { contactTag: contact.tag });
  }

  function handleKeyDown(e: KeyboardEvent, contact: Contact) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectContact(contact);
    }
  }

  async function copyUserTag() {
    if ($user.user) {
      const fullTag = `${$user.user.userName}#${$user.user.tag}`;
      await navigator.clipboard.writeText(fullTag);
      copyFeedback = true;
      setTimeout(() => {
        copyFeedback = false;
      }, 2000);
    }
  }

  socketStore.getSocket().on('privateChatHistory', ({ contactTag, messages }) => {
    chat.handleChatHistory(contactTag, messages);
  });

  $: if ($user.authorized) {
    contacts.getContacts();
  }
</script>

<div class="contacts-panel">
  <div class="contacts-header">
    <h3>Contacts</h3>
    {#if $user.user}
      <button 
        class="user-tag" 
        on:click={copyUserTag}
        title="Click to copy"
      >
        {$user.user.userName}#{$user.user.tag}
        {#if copyFeedback}
          <span class="copy-feedback">Copied!</span>
        {/if}
      </button>
    {/if}
  </div>

  <div class="add-contact">
    <input
      type="text"
      bind:value={newContactTag}
      placeholder="Enter contact tag (e.g. User#1234)"
      on:keydown={(e) => e.key === 'Enter' && addContact()}
    />
    <button on:click={addContact}>Add Contact</button>
  </div>

  <div class="contacts-list">
    {#if $contacts.contacts.length === 0}
      <p class="no-contacts">No contacts yet</p>
    {:else}
      {#each $contacts.contacts as contact}
        <button
          type="button"
          class="contact-item"
          class:selected={selectedContact?.tag === contact.tag}
          on:click={() => selectContact(contact)}
          on:keydown={(e) => handleKeyDown(e, contact)}
          aria-pressed={selectedContact?.tag === contact.tag}
        >
          <div class="contact-info">
            <span class="contact-name">{contact.userName}</span>
            <span class="contact-tag">{contact.tag}</span>
          </div>
          <span 
            class="status-indicator" 
            class:online={contact.status === 'online'}
            class:offline={contact.status === 'offline'}
            title={contact.status === 'online' ? 'Online' : 'Offline'}
          ></span>
        </button>
      {/each}
    {/if}
  </div>
</div>
