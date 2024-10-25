<script lang="ts">
  import { user } from '../storage/userStore';
  import { replace } from "svelte-spa-router";

  let userName = $user.user?.userName || "";

  async function submitUserName(): Promise<void> {
    const success = await user.setUserName(userName);
    if (success) {
      replace('/');
    }
  }

  async function handleKeydown({ keyCode }: { keyCode: number }): Promise<void> {
    if ((keyCode === 13) && (userName.length > 3)) await submitUserName();
  }

</script>

<svelte:window on:keydown={handleKeydown} />

<div class="login page">
  <div class="form">
    <h3 class="title">What's your nickname?</h3>
    <input
      bind:value={userName}
      class="usernameInput"
      type="text"
      maxlength="14"
    />
    <button on:click={submitUserName}>ok</button>
  </div>
</div>
