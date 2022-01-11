<script lang="ts">
  import { user } from '../storage/userStore';
  import { replace } from "svelte-spa-router";

  let userName = $user.userName;

  function submitUserName(): void {
    user.setUserName(userName);
    replace('/');
  }

  function handleKeydown({ keyCode }: { keyCode: number }): void {
    if ((keyCode === 13) && (userName.length > 3)) submitUserName();
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
