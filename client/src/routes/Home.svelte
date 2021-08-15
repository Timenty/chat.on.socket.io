<script lang="ts">
  import type { ChatMessage } from "../types/message.type";
  import { sendMessage } from '../storage/socketStore';
  import { user } from '../storage/userStore';
  import { chat } from '../storage/chatStore';

  let username = $user.userName;
  $: messages = $chat.getCurrentChat().messages;
  let msgText: string = "";

  function send(): void {
    sendMessage({ username, message: msgText } as ChatMessage);
    msgText = "";
  }

  function handleKeydown({ keyCode }: { keyCode: number }): void {
    if (keyCode === 13) send();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<ul class="pages">
  <li class="chat page">
    <div class="chatArea">
      <ul class="messages">
        {#each messages as { message, username }}
          <li>{username}:{message}</li>
        {/each}
      </ul>
    </div>
    <input
      bind:value={msgText}
      class="inputMessage"
      placeholder="Type here..."
    />
  </li>
</ul>
