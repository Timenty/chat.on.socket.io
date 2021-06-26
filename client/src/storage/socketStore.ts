import { io } from "socket.io-client";
import { writable } from 'svelte/store';

const socket = io();

export const socketStore = () => {
  const { subscribe, set, update } = writable(saved)           // create the underlying writable store

  return {
    subscribe,
    set: (value: any) => {
      localStorage.setItem(key, toString(value))              // save also to local storage as a string
      return set(value)
    },
    update
  }
}