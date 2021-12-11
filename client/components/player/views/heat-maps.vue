<template lang="pug">
  .container
    template(v-for="heatMap in [hourlyPlayed, dailyPlayed]")
      .title
        h3 {{ heatMap.title }}
      .heat-map
        table
          tr
            th
            th(v-for="label in heatMap.labels[1]") {{ label }}
          template(v-for="(row, i) in heatMap.matrix")
            tr(v-if="row.some(val => val > 0)")
              th {{ heatMap.labels[0][i] }}
              td(v-for="val in row" :style="{ opacity: val / heatMap.max + 0.1 }") {{ val > 0 ? val : "" }}
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
  computed: {
    hourlyPlayed (this: any) {
      return this.generateHeatMap(
        "Hourly games played",
        [
          ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          Array.from({ length: 24 }, (_, i) => (i + 7) % 24).map(h => h + ":00")
        ],
        date => (date.getDay() + (date.getHours() < 7 ? 5 : 6)) % 7,
        date => (date.getHours() + 17) % 24
      )
    },
    dailyPlayed (this: any) {
      return this.generateHeatMap(
        "Daily games played",
        [
          [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ],
          Array.from({ length: 31 }, (_, i) => i + 1)
        ],
        date => date.getMonth(),
        date => date.getDate() - 1
      )
    }
  },
  methods: {
    generateHeatMap (title, labels: [Array<any>, Array<any>], x: (d: Date) => number, y: (d: Date) => number) {
      const height = labels[0].length
      const width = labels[1].length
      const matrix = new Array(height).fill(0).map(() => new Array(width).fill(0))

      for (const game of this.games) {
        const date = new Date(game.date)
        ++matrix[x(date)][y(date)]
      }

      return { title, labels, matrix, max: Math.max(...matrix.flat()) }
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
    background-color: rgba(255, 255, 255, 0.1)
    text-shadow: 0 0 20px white

</style>
