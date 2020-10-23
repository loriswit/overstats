<template lang="pug">
  main
    header
      nuxt-link.nav(to="/")
        h1 Overstats
      nav
        template(v-if="user.logged")
          nuxt-link.nav(:to="'/' + user.name.toLowerCase()") Profile
          button.nav(@click="user.logout()") Logout

        template(v-else)
          nuxt-link.nav(to="/login") Register
          nuxt-link.nav(to="/login") Login

    nuxt

    modal.error(v-model="error.dialog" background="#ffbbd2")
      h2
        i.fas.fa-exclamation-triangle
        span Error
      p {{ error.message }}
      button.red(@click="error.dialog = false") Cancel
</template>

<script lang="ts">
import Vue from "vue"
import { userStore } from "~/store"
import Modal from "~/components/util/modal.vue"
import { HttpError } from "~/plugins/axios-init"

export default Vue.extend({
  components: {
    Modal
  },
  data: () => ({
    user: userStore,
    error: {
      dialog: false,
      message: ""
    }
  }),
  errorCaptured (err: Error) {
    if (err instanceof HttpError) {
      if (this.$nuxt.isOffline) {
        this.error.message = "Not connected to Internet"
      } else {
        this.error.message = err.message
      }
      this.error.dialog = true
      return false
    }
  }
})
</script>

<style lang="sass">
@import url("https://fonts.googleapis.com/css2?family=Raleway:wght@700&display=swap")
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@600&display=swap")
@import url("https://use.fontawesome.com/releases/v5.12.1/css/all.css")

@font-face
  font-family: BigNoodleTooOblique
  src: url("https://us.battle.net/forums/static/fonts/bignoodletoo/bignoodletoo.woff") format("woff")

html
  font-family: Raleway, sans-serif
  font-size: 16px
  word-spacing: 1px
  -ms-text-size-adjust: 100%
  -webkit-text-size-adjust: 100%
  -moz-osx-font-smoothing: grayscale
  -webkit-font-smoothing: antialiased
  box-sizing: border-box

*, *:before, *:after
  box-sizing: border-box
  margin: 0

h1, h2, h3, h4, h5, h6
  font-weight: normal

body
  background: linear-gradient(#2e4079, #1d2742) fixed
  height: 100%

main
  display: flex
  height: 100vh
  flex-direction: column

  > header
    background-color: black
    display: flex
    justify-content: space-between
    align-items: center
    padding: 3px 10px
    border-bottom: 1px solid rgba(0, 0, 0, 0.75)

    h1
      font-size: 1.2em
      letter-spacing: 4px

    .nav
      font-family: Raleway, sans-serif
      font-size: 16px
      text-transform: uppercase
      letter-spacing: 1px
      color: white
      background: none
      text-decoration: none
      white-space: nowrap
      cursor: pointer
      border: none
      padding: 12px

      &:hover
        color: #ffea7e

button:not(.nav)
  font-family: Raleway, sans-serif
  font-size: 16px
  text-transform: uppercase
  letter-spacing: 1px
  white-space: nowrap
  cursor: pointer

  color: white
  background-color: #507dd2
  border: none
  border-radius: 4px
  padding: 12px 16px

  &:hover
    background-color: #6d9af1

  &:focus
    outline: 0

  &.grey
    background-color: grey

    &:hover
      background-color: #999

  &.red
    background-color: #870000

    &:hover
      background-color: #b60000

form
  h2
    color: $bluish
    font-family: BigNoodleTooOblique, sans-serif
    letter-spacing: 1px
    text-align: center
    font-size: 2em
    padding-bottom: 10px

  .field
    margin: 12px
    position: relative
    display: flex
    align-items: center

    &.required::after
      content: "*"
      font-size: 2em
      color: #f37070
      position: absolute
      right: 12px
      top: 9px

    &.submit
      display: flex
      align-items: baseline
      justify-content: space-between

input
  padding: 11px 14px

select
  cursor: pointer
  padding: 10px 14px

input, select
  width: 100%
  font-size: 16px
  border-radius: 4px
  border: 1px solid darkgrey

  &:not(.credential)
    font-family: Raleway, sans-serif
    text-transform: uppercase

  &::placeholder
    color: darkgrey

  &:focus
    outline: 0
    border-color: cornflowerblue

label.hidden
  display: none

label:not(.hidden)
  font-family: Raleway, sans-serif
  text-transform: uppercase
  min-width: 120px

.error
  text-align: center

  h2
    font-family: BigNoodleTooOblique, sans-serif
    letter-spacing: 1px
    color: #c90000
    font-size: 2.5em
    display: flex
    align-items: center
    justify-content: center

    i
      font-size: 0.75em
      margin-right: 10px

  p
    margin: 30px 0
    font-family: Raleway, sans-serif
    text-transform: uppercase

</style>
