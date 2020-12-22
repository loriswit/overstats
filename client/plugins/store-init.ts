import { Plugin } from "@nuxt/types"
import { userStore } from "~/store"

const init: Plugin = () => {
    const username = localStorage.getItem("user")
    const token = localStorage.getItem("jwt")
    const expires = localStorage.getItem("exp")
    if (!username || !token || !expires) {
        userStore.logout()
    } else {
        userStore.login({ username, token, expires })
    }
}

export default init
