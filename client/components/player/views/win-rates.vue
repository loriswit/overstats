<template lang="pug">
  .container
    .balance
      input(id="balance" type="checkbox" v-model="balanced")
      label(for="balance") Exclude unbalanced games
    template(v-for="stat in stats")
      .title
        h3 {{ stat.title }}
      .stat
        table
          tr
            th
            th Games
            th Victories
            th Defeats
            th Draws
            th Win rate
          tr(v-for="row in stat.rows")
            td {{ row.title }}
            td {{ row.count }}
            td {{ row.victories }}
            td {{ row.defeats }}
            td {{ row.draws }}
            td(v-if="isNaN(row.winRate)") —
            td(v-else) {{ Math.round(row.winRate * 100) }} %
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue"

export default Vue.extend({
  name: "WinRate",
  props: {
    games: {
      type: Array,
      required: true
    } as PropOptions<any[]>
  },
  data: () => ({
    balanced: false,
    structure: [{
      title: "Roles",
      field: "role",
      values: ["Tank", "Damage", "Support", "Any"]
    }, {
      title: "Assault maps",
      field: "map",
      values: ["Hanamura", "Horizon Lunar Colony", "Paris", "Temple of Anubis", "Volskaya Industries"]
    }, {
      title: "Control maps",
      field: "map",
      values: ["Busan", "Ilios", "Lijiang Tower", "Nepal", "Oasis"]
    }, {
      title: "Escort maps",
      field: "map",
      values: ["Dorado", "Havana", "Junkertown", "Rialto", "Route 66", "Watchpoint: Gibraltar"]
    }, {
      title: "Hybrid maps",
      field: "map",
      values: ["Blizzard World", "Eichenwalde", "Hollywood", "King's Row", "Numbani"]
    }]
  }),
  computed: {
    filteredGames () {
      return this.balanced ? this.games.filter(({ balance }) => balance === "Balanced") : this.games
    },
    stats (this: any) {
      return this.structure.map(({ title, field, values }) => {
        const stat = {
          title,
          rows: values.map((value) => {
            const filtered = this.filteredGames.filter(game => game[field] === value)
            const row = {
              title: value === "Any" ? "Open Queue" : value,
              count: filtered.length,
              victories: filtered.filter(game => game.outcome === "Victory").length,
              defeats: filtered.filter(game => game.outcome === "Defeat").length,
              draws: 0,
              winRate: 0
            }
            // compute draws and win rate from existing properties
            row.draws = row.count - row.victories - row.defeats
            row.winRate = row.victories / (row.victories + row.defeats)
            return row
          }).filter(stat => stat.count).sort((a, b) => b.winRate - a.winRate)
        }
        const total = { title: "Total", count: 0, victories: 0, defeats: 0, draws: 0, winRate: 0 }
        ;["count", "victories", "defeats", "draws"].map((field) => {
          total[field] = stat.rows.reduce((acc, row) => acc + row[field], 0)
        })
        total.winRate = total.victories / (total.victories + total.defeats)
        stat.rows.push(total)
        return stat
      })
    }
  }
})
</script>

<style lang="sass" scoped>
.stat
  max-width: 900px
  margin: 10px auto 40px

.balance
  background-color: rgba(0, 0, 0, 0.5)
  text-align: center
  color: white
  padding: 10px 0 20px

  > *
    width: initial
    padding: 10px 15px
    cursor: pointer

    &:hover
      color: #ffea7e

table
  border-collapse: collapse
  table-layout: fixed
  width: 100%

  tr:last-child
    background-color: rgba(255, 255, 255, 0.05)

  th, td
    width: calc(100% / 14 * 2)
    color: white
    padding: 8px 0

  th:first-child, td:first-child
    width: calc(100% / 14 * 4)

  th
    text-transform: uppercase
    font-weight: normal
    background-color: rgba(0, 0, 0, 0.1)

  td
    background-color: rgba(255, 255, 255, 0.05)
    font-size: 1.1em

    &:first-child
      font-family: BigNoodleTooOblique, sans-serif
      font-size: 1.6em
      padding-left: 10px

    &:not(:first-child)
      font-family: Manrope, sans-serif
      text-align: center
</style>
