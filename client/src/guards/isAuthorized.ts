import { user as userStore } from "../storage/userStore";

let user; userStore.subscribe(u => user = u);

export default () => {
    console.log('userStore.authorized', user.authorized);
    return user.authorized;
};