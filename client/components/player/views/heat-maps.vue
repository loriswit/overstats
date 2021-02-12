<template lang="pug">
  .container
    .title
      h3 Hourly games played
    .heat-map
      table
        tr
          td.day
          th(v-for="hour in 24") {{ (hour + 6) % 24 }}:00
        tr(v-for="(day, i) in hourlyPlayed.matrix")
          th.day {{ days[i] }}
          td(v-for="amount in day" :style="{ opacity: amount / hourlyPlayed.max + 0.1 }") {{ amount > 0 ? amount : "" }}
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue"

export default Vue.extend({
  name: "HeatMaps",
  props: {
    games: {
      type: Array,
      required: true
    } as PropOptions<any[]>
  },
  data: () => ({
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  }),
  computed: {
    hourlyPlayed () {
      const matrix = new Array(7).fill(0).map(() => new Array(24).fill(0))
      for (const game of this.games) {
        const date = new Date(game.date)
        ++matrix[(date.getDay() + 6) % 7][(date.getHours() + 17) % 24]
      }

      return { matrix, max: Math.max(...matrix.flat()) }
    }
  }
})
</script>

<style lang="sass" scoped>
.heat-map
  max-width: 1100px
  margin: 10px auto 40px

table
  border-collapse: collapse
  table-layout: fixed
  width: 100%

  th, td
    font-family: BigNoodleTooOblique, sans-serif
    color: white
    padding: 8px 0
    text-align: center
    font-weight: normal

    &:first-child
      width: 110px
      text-align: left
      font-size: 1.6em
      padding-left: 10px

  th
    background-color: rgba(0, 0, 0, 0.1)

  td
    font-family: Manrope, sans-serif
</style>
