import { Module, Mutation, VuexModule } from "vuex-module-decorators"
import { $axios } from "~/utils/axios-accessor"
import { userStore } from "~/store"

let timeoutId: number

@Module({
    name: "user",
    stateFactory: true,
    namespaced: true
})
export default class User extends VuexModule {
    name = ""
    token = ""
    logged = false
    expiredOn = NaN
    refreshOn = NaN

    @Mutation
    login ({ username, token, expires }) {
        this.logged = true
        this.name = username
        this.token = token
        this.expiredOn = new Date(expires).getTime()
        const now = new Date().getTime()

        $axios.setToken(token, "Bearer")

        // logout when token has expired
        const logoutDelay = this.expiredOn - now
        if (logoutDelay <= 0) {
            userStore.logout()
            return
        }
        window.clearTimeout(timeoutId)
        timeoutId = window.setTimeout(userStore.logout, logoutDelay)

        // refresh token after half expiration time
        const refreshOn = localStorage.getItem("ref")
        if (refreshOn) {
            this.refreshOn = Number.parseInt(refreshOn)
        } else {
            this.refreshOn = Math.floor(now + (this.expiredOn - now) / 2)
        }
        $axios.onRequest(async (config) => {
            if (config.method !== "get" && this.refreshOn < new Date().getTime()) {
                const data = { ...await $axios.$get("/token"), username: this.name }
                userStore.logout()
                userStore.login(data)
            }
            return config
        })

        localStorage.setItem("user", username)
        localStorage.setItem("jwt", token)
        localStorage.setItem("exp", expires)
        localStorage.setItem("ref", this.refreshOn.toString())
    }

    @Mutation
    logout () {
        this.logged = false
        this.name = ""
        this.token = ""
        this.expiredOn = NaN
        this.refreshOn = NaN
        localStorage.removeItem("user")
        localStorage.removeItem("jwt")
        localStorage.removeItem("exp")
        localStorage.removeItem("ref")
        $axios.setToken(false)
        $axios.onRequest(() => {})
        window.clearTimeout(timeoutId)
    }
}
