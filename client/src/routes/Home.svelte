<script lang="ts">
    import type { ChatMessage } from "../types/message.type";
    import { socket, setUserName, sendMessage } from '../storage/socketStore';
    import { user } from '../storage/userStore';
    import { chat } from '../storage/chatStore';

    let loginPage: boolean = true;
    $: userName = $user.userName;
    $: messages = $chat.getCurrentChat().messages;
    let msgText: string = "";

    function submitUserName(): void {
        loginPage = false;
        setUserName(userName);
    }

    function send(): void {
        const msg = { username: userName, message: msgText } as ChatMessage;
        msgText = "";
        sendMessage(msg);
    }

    function handleKeydown({ keyCode }: { keyCode: number }): void {
        if (keyCode === 13 && !loginPage) send();
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<ul class="pages">
    {#if !loginPage}
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
    {:else}
        <li class="login page">
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
        </li>
    {/if}
</ul>
