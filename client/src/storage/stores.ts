import { writable } from 'svelte/store'
import { localStore } from './localStore'

export const alert = writable('Welcome to the To-Do list app!')

export const todos = localStore('mdn-svelte-todo', [])