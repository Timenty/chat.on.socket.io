<script lang="ts">
    import { io, Socket } from "socket.io-client";
    import type { ChatMessage } from "../types/message.type";

    const socket: Socket = io("localhost:3000");

    let loginPage: boolean = true;
    let userName: string = "";
    let messages: Array<ChatMessage> = [];
    let msgText: string = "";

    function submitUserName(): void {
        loginPage = false;
        socket.emit("add user", userName);
    }

    function sendMessage(): void {
        const msg = { username: userName, message: msgText } as ChatMessage;
        msgText = "";
        addChatMessage(msg);
        socket.emit("new message", msg);
    }

    function handleKeydown({ keyCode }: { keyCode: number }): void {
        if (keyCode === 13 && !loginPage) sendMessage();
    }

    function log(msg: ChatMessage): void {
        msg.username = "log";
        addChatMessage(msg);
    }

    const addParticipantsMessage = (data: any) => {
        let message = "";
        if (data.numUsers === 1) {
            message += `there's 1 participant`;
        } else {
            message += `there are ${data.numUsers} participants`;
        }
        log({ message } as ChatMessage);
    };

    function addChatMessage(msg: ChatMessage): void {
        messages = [...messages, msg];
    }

    socket.on("new message", ({message}: {message: ChatMessage}) => {
        console.log("new message", message);
        addChatMessage(message);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on("user joined", (data) => {
        log({ message: `${data.username} joined` } as ChatMessage);
        addParticipantsMessage(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on("user left", (data) => {
        log({ message: `${data.username} left` } as ChatMessage);
        addParticipantsMessage(data);
    });

    socket.on("disconnect", () => {
        log({ message: "you have been disconnected" } as ChatMessage);
    });

    socket.on("reconnect", () => {
        log({ message: "you have been reconnected" } as ChatMessage);
        if (userName) {
            socket.emit("add user", userName);
        }
    });

    socket.on("reconnect_error", () => {
        log({ message: "attempt to reconnect has failed" } as ChatMessage);
    });
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
