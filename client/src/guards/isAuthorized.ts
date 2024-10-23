import { user as userStore } from "../storage/userStore";

let user: { authorized: any; userName?: string; }; userStore.subscribe(u => user = u);

export default () => {
    console.log('userStore.authorized', user.authorized);
    return user.authorized;
};