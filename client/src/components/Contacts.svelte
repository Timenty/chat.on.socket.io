<script lang="ts">
  import { contacts } from '../storage/contactsStore';
  import { user } from '../storage/userStore';
  import type { Contact } from '../types/user.type';
  import { sendMessage } from '../storage/socketStore';
  import { nanoid } from 'nanoid';

  let newContactTag = '';
  let selectedContact: Contact | null = null;
  let privateMessage = '';

  function addContact() {
    if (newContactTag.trim()) {
      contacts.addContact(newContactTag.trim());
      newContactTag = '';
    }
  }

  function sendPrivateMessage() {
    if (privateMessage.trim() && selectedContact) {
      sendMessage({
        id: nanoid(),
        userName: $user.userName || '',
        text: privateMessage.trim(),
        time: new Date(),
        isPrivate: true,
        to: selectedContact.tag,
        senderTag: $user.tag
      });
      privateMessage = '';
    }
  }

  function selectContact(contact: Contact) {
    selectedContact = contact;
  }

  // Get initial contacts list
  $: if ($user.authorized) {
    contacts.getContacts();
  }
</script>

<div class="contacts-panel">
  <div class="contacts-header">
    <h3>Contacts</h3>
    {#if $user.tag}
      <div class="user-tag">Your tag: {$user.tag}</div>
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
        <div
          class="contact-item"
          class:selected={selectedContact?.tag === contact.tag}
          class:online={contact.status === 'online'}
          on:click={() => selectContact(contact)}
        >
          <div class="contact-info">
            <span class="contact-name">{contact.userName}</span>
            <span class="contact-tag">{contact.tag}</span>
          </div>
          <span class="status-indicator" title={contact.status}></span>
        </div>
      {/each}
    {/if}
  </div>

  {#if selectedContact}
    <div class="private-chat">
      <h4>Chat with {selectedContact.userName}</h4>
      <div class="message-input">
        <input
          type="text"
          bind:value={privateMessage}
          placeholder="Type private message..."
          on:keydown={(e) => e.key === 'Enter' && sendPrivateMessage()}
        />
        <button on:click={sendPrivateMessage}>Send</button>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .contacts-panel {
    width: 300px;
    border-left: 1px solid #ccc;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .contacts-header {
    h3 {
      margin: 0 0 0.5rem 0;
    }

    .user-tag {
      font-size: 0.9em;
      color: #666;
    }
  }

  .add-contact {
    display: flex;
    gap: 0.5rem;

    input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    button {
      padding: 0.5rem 1rem;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background: #45a049;
      }
    }
  }

  .contacts-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .contact-item {
    padding: 0.75rem;
    border-radius: 4px;
    background: #f5f5f5;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
      background: #eee;
    }

    &.selected {
      background: #e3f2fd;
    }

    &.online .status-indicator {
      background: #4CAF50;
    }
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .contact-name {
    font-weight: 500;
  }

  .contact-tag {
    font-size: 0.8em;
    color: #666;
  }

  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ccc;
  }

  .private-chat {
    border-top: 1px solid #ccc;
    padding-top: 1rem;

    h4 {
      margin: 0 0 0.5rem 0;
    }

    .message-input {
      display: flex;
      gap: 0.5rem;

      input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      button {
        padding: 0.5rem 1rem;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: #1976D2;
        }
      }
    }
  }

  .no-contacts {
    text-align: center;
    color: #666;
    font-style: italic;
  }
</style>
