import { writable } from 'svelte/store';

export const localStore = (key: string, initial: any) => {
    // receives the key of the local storage and an initial value

  const toString = (value: any) => JSON.stringify(value, null)  // helper function

  if (localStorage.getItem(key) === null) {                    // item not present in local storage
    localStorage.setItem(key, toString(initial))               // initialize local storage with initial value
  }

  const saved: any = JSON.parse(localStorage.getItem(key))     // convert to object

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