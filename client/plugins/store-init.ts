import { Plugin } from "@nuxt/types"
import { userStore } from "~/store"

const init: Plugin = () => {
    const username = localStorage.getItem("user")
    const token = localStorage.getItem("jwt")
    if (!username || !token) {
        userStore.logout()
    } else {
        userStore.login({ username, token })
    }
}

export default init
