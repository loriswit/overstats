<template lang="pug">
  .container
    .stat(v-for="stat in outcomeStreaks.stats")
      .summary
        span.name {{ stat.name }}
        span.value {{ stat.max }}
      .occurrence(v-if="stat.max > 1")
        span Occurred on
        ul
          li.date(v-for="game in stat.games")
            span {{ formatDate(game.date) }}
            span.season(v-if="multipleSeasons") {{ game.season }}

    .stat(v-for="(stat, index) in gameStreaks.stats")
      .summary
        span.name {{ stat.name }}
        span.value {{ stat.max }}
      .occurrence(v-if="stat.max > 0")
        template(v-if="index === 0")
          span Occurred on
          .date
            span {{ formatDate(stat.games[0].date) }}
            span.season(v-if="multipleSeasons") {{ stat.games[0].season }}

        template(v-else)
          .from
            span From&nbsp;
            span.date
              span {{ formatDate(stat.games[0].date) }}
              span.season(v-if="multipleSeasons") {{ stat.games[0].season }}
          .to
            span to&nbsp;
            span.date
              span {{ formatDate(stat.games[stat.max - 1].date) }}
              span.season(v-if="multipleSeasons") {{ stat.games[stat.max - 1].season }}

    .stat(v-if="longestPause.max > 86400000")
      .summary
        span.name Longest time without playing
        span.value {{ formatDuration(longestPause.max) }}
      .occurrence
        .from
          span From&nbsp;
          span.date
            span {{ formatDate(longestPause.games[0].date) }}
            span.season(v-if="multipleSeasons") {{ longestPause.games[0].season }}
        .to
          span to&nbsp;
          span.date
            span {{ formatDate(longestPause.games[1].date) }}
            span.season(v-if="multipleSeasons") {{ longestPause.games[1].season }}
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue"

export default Vue.extend({
  name: "Streaks",
  props: {
    games: {
      type: Array,
      required: true
    } as PropOptions<any[]>,
    multipleSeasons: {
      type: Boolean,
      required: false
    } as PropOptions<boolean>
  },
  computed: {
    sortedGames () {
      return [...this.games]
        .map(game => ({ ...game, date: new Date(game.date) }))
        .sort((a, b) => a.date - b.date)
    },
    outcomeStreaks (this: any) {
      return this.sortedGames.reduce((acc, game) => {
        const outcome = game.outcome === "Victory" ? 0 : game.outcome === "Defeat" ? 1 : 2
        if (outcome === acc.outcome) {
          ++acc.stats[outcome].count
        } else {
          acc.stats[outcome].count = 1
          acc.outcome = outcome
        }
        if (acc.stats[outcome].count > acc.stats[outcome].max) {
          acc.stats[outcome].max = acc.stats[outcome].count
          acc.stats[outcome].games = [game]
        } else if (acc.stats[outcome].count === acc.stats[outcome].max) {
          acc.stats[outcome].games.push(game)
        }
        return acc
      },
      {
        outcome: null,
        stats: [
          { name: "Most victories in a row", count: 0, max: 0, games: [] },
          { name: "Most defeats in a row", count: 0, max: 0, games: [] },
          { name: "Most draws in a row", count: 0, max: 0, games: [] }
        ]
      })
    },
    gameStreaks (this: any) {
      return this.sortedGames.reduce((acc, game) => {
        for (const stat of acc.stats) {
          stat.queue.push(game)
          while (game.date - stat.queue[0].date > stat.range) {
            stat.queue.shift()
          }
          if (stat.queue.length > stat.max) {
            stat.max = stat.queue.length
            stat.games = [...stat.queue]
          }
        }
        return acc
      },
      {
        stats: [
          { name: "Most games during 24 hours", queue: [], range: 86400000, max: 0, games: [] },
          { name: "Most games during 7 days", queue: [], range: 604800000, max: 0, games: [] },
          { name: "Most games during 30 days", queue: [], range: 2592000000, max: 0, games: [] }
        ]
      })
    },
    longestPause (this: any) {
      return this.sortedGames.reduce((acc, game) => {
        if (acc.previous) {
          const diff = game.date - acc.previous.date
          if (diff > acc.max) {
            acc.max = diff
            acc.games = [acc.previous, game]
          }
        }
        acc.previous = game
        return acc
      },
      { previous: null, max: 0, games: [] })
    }
  },
  methods: {
    formatDate (date: Date) {
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" } as const
      return date.toLocaleDateString("en-GB", options)
    },
    formatDuration (duration: number) {
      duration /= 86400000
      const days = Math.floor(duration % 30)
      const months = Math.floor(duration / 30 % 12)
      if (months > 0) {
        return `${months} months & ${days} days`
      }
      return `${days} days`
    }
  }
})
</script>

<style lang="sass" scoped>
.container
  color: white
  text-align: center

.stat
  margin: 20px auto 0
  max-width: 600px
  width: 100%

  &:last-child
    margin-bottom: 40px

.summary
  display: flex
  align-items: center
  justify-content: space-between

.name
  background-color: rgba(0, 0, 0, 0.1)
  font-family: BigNoodleTooOblique, sans-serif
  font-size: 1.6em
  padding: 10px
  flex-grow: 1
  text-align: left

.value
  background-color: rgba(0, 0, 0, 0.3)
  font-family: Manrope, sans-serif
  font-size: 1.2em
  padding: 10px
  min-width: 40px

.occurrence
  background-color: rgba(255, 255, 255, 0.05)
  padding: 10px 10px 15px
  color: #bbccee

  ul
    list-style-type: none
    padding: 0

.date
  color: white
  padding-top: 8px

.to
  padding-top: 8px

.season
  color: rgba(210, 255, 210, 0.7)
  padding-left: 8px
  font-family: BigNoodleTooOblique, sans-serif
  font-size: 1.1em
</style>
