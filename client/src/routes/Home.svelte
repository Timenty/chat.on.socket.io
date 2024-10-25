<script lang="ts">
  import ChatWindow from '../components/ChatWindow.svelte';
  import Contacts from '../components/Contacts.svelte';
</script>

<div class="chat-container">
  <ChatWindow />
  <Contacts />
</div>

<style lang="scss">
  .chat-container {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }
</style>
