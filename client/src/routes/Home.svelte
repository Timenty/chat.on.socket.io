<script lang="ts">
  import type { ChatMessage } from "../types/message.type";
  import { sendMessage } from '../storage/socketStore';
  import { user } from '../storage/userStore';
  import { chat } from '../storage/chatStore';

  let userName = $user.userName;
  $: messages = $chat.currentChat.messages;
  let msgText: string = "";

  function send(): void {
    sendMessage({ userName, message: msgText, time: Date.now() } as ChatMessage);
    msgText = "";
  }

  function handleKeydown({ keyCode }: { keyCode: number }): void {
    if (keyCode === 13) send();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="chatArea">
  <ul class="messages">
    {#each messages as { message, userName }}
      <li>[{userName}]: {message}</li>
    {/each}
  </ul>
</div>
<input
  bind:value={msgText}
  class="inputMessage"
  placeholder="Type here..."
/>
