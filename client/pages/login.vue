<template lang="pug">
  .container
    form(@submit.prevent="login")
      h2 Login
      .field.required
        label.hidden(for="user-log") Username
        input.credential#user-log(v-model="log.user" placeholder="Username" required)
      .field.required
        label.hidden(for="pass-log") Password
        input.credential#pass-log(v-model="log.pass" placeholder="Password" type="password" required)
      .field.submit
        p.error {{ log.error }}
        button(type="submit") Login

    form(@submit.prevent="register")
      h2 New account
      .field.required
        label.hidden(for="user-reg") Username
        input.credential#user-reg(v-model="reg.user" placeholder="Username" required)
      .field.required
        label.hidden(for="pass-reg") Password
        input.credential#pass-reg(v-model="reg.pass" placeholder="Password" type="password" minlength="6" required)
      .field
        label.hidden(for="tag") BattleTag
        input.credential#tag(v-model="reg.tag" placeholder="BattleTag™" pattern="[^#\s]+#[0-9]{4,}")
      .field.submit
        p.error {{ reg.error }}
        button(type="submit") Register
</template>

<script lang="ts">
import Vue from "vue"
import { userStore } from "~/store"

export default Vue.extend({
  data: () => ({
    log: {
      user: "",
      pass: "",
      error: ""
    },
    reg: {
      user: "",
      pass: "",
      tag: "",
      error: ""
    }
  }),
  beforeCreate () {
    if (userStore.logged) {
      this.$router.replace("/" + userStore.name)
    }
  },
  methods: {
    async login () {
      try {
        this.log.error = ""
        await this.logUser(this.log.user, this.log.pass)
        this.$router.push("/" + userStore.name)
      } catch (err) {
        if (err.status === 401) {
          this.log.error = "Wrong credentials"
        } else {
          this.log.error = err.response.data
        }
      }
    },
    async register () {
      try {
        this.reg.error = ""
        const payload = {
          name: this.reg.user,
          pass: this.reg.pass,
          battleTag: this.reg.tag ? this.reg.tag : undefined
        }
        await this.$axios.$post("/users", payload)
        await this.logUser(this.reg.user, this.reg.pass)
        this.$router.push("/" + userStore.name)
      } catch (err) {
        if (err.status === 409) {
          this.reg.error = "Username not available"
        } else {
          throw err
        }
      }
    },
    async logUser (username: string, password: string) {
      const data = await this.$axios.$get("/login",
        {
          auth: {
            username,
            password
          }
        })
      userStore.login(data)
    }
  },
  head: () => ({
    title: "Login"
  })
})
</script>

<style lang="sass" scoped>
.container
  width: 100%
  max-width: 1000px
  margin: auto
  height: 100vh
  display: flex
  align-items: center
  justify-content: space-evenly

form
  width: 330px
  max-width: 100%
  margin: 20px
  background-color: $glass
  border-radius: 4px
  padding: 16px

  .error
    color: #e33f3f

@media (max-width: 768px)
  .container
    flex-direction: column

</style>
