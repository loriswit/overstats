<template lang="pug">
  .profile(:class="{vertical}")
    img.icon(v-if="icon" :src="icon")
    .name
      h1 {{ profile.name }}
      .battle-tag(v-if="profile.battleTag")
        span {{ profile.battleTag.split("#")[0] }}
        span.tag {{ "#" + profile.battleTag.split("#")[1] }}
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  props: {
    player: {
      type: String,
      required: true
    },
    vertical: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    profile: {} as any,
    icon: null as string | null
  }),
  head () {
    return {
      title: this.profile.name
    }
  },
  async created () {
    this.profile = await this.$axios.$get(`/users/${this.player}`)

    // fetch player icon from 3rd party API
    if (this.profile.battleTag) {
      const tag = this.profile.battleTag.replace("#", "-")
      try {
        const owApi = this.$axios.create({ baseURL: "https://ow-api.com/v1" })
        owApi.setToken(false)

        const owProfile = await owApi.$get(`/stats/pc/us/${tag}/profile`)
        this.icon = owProfile.icon
      } catch (error) {
        // ignore errors
      }
    }
  }
})
</script>

<style lang="sass" scoped>
.profile
  display: flex
  align-items: baseline
  justify-content: center

  &.vertical
    align-items: center

.icon
  width: 96px
  margin-right: 16px

*:not(.vertical) > .icon
  width: 48px

h1
  font-family: BigNoodleTooOblique, sans-serif
  letter-spacing: 1px
  font-size: 4em
  color: white

.name
  display: flex
  align-items: baseline

.vertical > .name
  flex-direction: column

.battle-tag
  font-family: BigNoodleTooOblique, sans-serif
  letter-spacing: 1px
  font-size: 2.5em
  color: lightblue

  .tag
    font-size: 0.7em
    color: rgba(173, 216, 230, 0.6)

*:not(.vertical) > .name .battle-tag
  margin-left: 20px
</style>
