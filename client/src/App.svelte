<script lang="ts">
  import Router, { replace } from 'svelte-spa-router';
  import { socketStore } from './storage/socketStore';
  import { user } from './storage/userStore';
  import { contacts } from './storage/contactsStore';
  import { chat } from './storage/chatStore';
  import routes from './routes';

  $: {
    // Log user information
    console.group('User Information:');
    console.log('User:', $user.user ? {
      id: $user.user.id,
      userName: $user.user.userName,
      displayName: $user.user.displayName,
      tag: $user.user.tag,
      contacts: $user.user.contacts
    } : 'Not logged in');
    console.log('Authorized:', $user.authorized);
    console.groupEnd();

    // Log contacts information
    console.group('Contacts Store:');
    console.log('Contacts List:', $contacts.contacts);
    console.log('Pending Requests:', $contacts.pendingRequests);
    console.groupEnd();

    // Log chat information
    console.group('Chat Store:');
    console.log('Current Contact:', chat.getCurrentChat()?.contactUserName || 'None');
    const chatsInfo = Array.from($chat.chats.entries()).map(([contactName, chat]) => ({
      contactName,
      messageCount: chat.messages.length,
      lastMessage: chat.messages[chat.messages.length - 1]
    }));
    console.log('Chats:', chatsInfo);
    console.groupEnd();

    // Log socket status
    console.group('Socket Status:');
    console.log('Connected:', $socketStore.connected);
    console.groupEnd();
  }

  $: socketConnectedStatus = $socketStore.connected;

  function conditionsFailed() {
    replace('/login');
  }
</script>

<Router {routes} on:conditionsFailed={conditionsFailed}/>

<style global>
  @import './styles/main.scss';
</style>
