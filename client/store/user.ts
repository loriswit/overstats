import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import { $axios } from "~/utils/axios-accessor"

@Module({
    name: "user",
    stateFactory: true,
    namespaced: true
})
export default class User extends VuexModule {
  name = ""
  token = ""
  logged = false

  @Mutation
  login ({ username, token }: { username: string, token: string }) {
      this.logged = true
      this.name = username
      this.token = token
      localStorage.setItem("user", username)
      localStorage.setItem("jwt", token)
      $axios.setToken(token, "Bearer", ["post", "put", "delete", "patch"])
  }

  @Mutation
  logout () {
      this.logged = false
      this.name = ""
      this.token = ""
      localStorage.removeItem("user")
      localStorage.removeItem("jwt")
      $axios.setToken(false)
  }
}
