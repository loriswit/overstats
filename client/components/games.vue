<template lang="pug">
  .games
    .title(v-if="!games.length") There are no games
    template(v-else)
      header(v-if="roleQueue")
        .roles(v-if="roleQueue")
          .role(v-for="role in roles")
            icon(:name="role")
            span {{ role }}
      .day(v-for="day in games")
        .title
          h3 {{ dayOf(day.find(role => role.length)[0]) }}
        .roles
          .role(v-for="role in day")
            table(:class="{ editable }")
              tr(v-for="game in role" @click="editGame(game.id)"
                :class="{ unbalanced: game.balance !== 'Balanced', rank: game.rank }"
                :title="game.balance !== 'Balanced' ? game.balance + ' advantage' : false")

                td.time {{ timeOf(game) }}

                template(v-if="game.rank")
                  td.rank-title(:class="roles[game.role]")
                    icon(v-if="roleQueue" :name="roles[game.role]")
                    span Placement
                  td.rank-sr(colspan=2) {{ game.sr }}

                template(v-else)
                  td.map
                    span.name {{ game.map }}
                    i.balance.fas.fa-smile(v-if="game.balance === 'Allied'")
                    i.balance.fas.fa-frown(v-if="game.balance === 'Enemy'")

                  td.outcome(v-if="game.placement" colspan=2
                    :class="{ victory: game.outcome === 'Victory', defeat: game.outcome === 'Defeat' }")
                    | {{ game.outcome }}

                  template(v-else)
                    td.sr {{ game.sr }}
                    td.no-diff(v-if="game.diff === undefined") —
                    td.diff(v-else :class="{ victory: game.diff > 0, defeat: game.diff < 0 }")
                      | {{ (game.diff > 0 ? "+" : "") + game.diff }}
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue"
import Icon from "~/components/icon.vue"

interface Game {
  id: string
  date: Date
  day: number
  map: string
  sr: number
  diff: number
  balance: string
  role: Role
  rank: boolean
  placement: boolean
  outcome: string
}

interface GameData {
  id: string
  map: string
  date: string
  balance: string
  role: string
  sr: number
  outcome: string
}

enum Role {
  Tank, Damage, Support, Global
}

export default Vue.extend({
  name: "Games",
  components: {
    Icon
  },
  props: {
    data: {
      type: Array,
      required: true
    } as PropOptions<GameData[]>,
    roleQueue: {
      type: Boolean,
      required: true
    },
    editable: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: () => ({
    roles: ["tank", "damage", "support"],
    dayShift: -21600000, // day starts at 6:00

    addDialog: false
  }),
  computed: {
    games () {
      if (!this.data.length) {
        return []
      }

      const gameList = [] as Game[]
      for (const item of this.data) {
        const game = {} as Game
        if (item.sr) {
          game.sr = item.sr
        }

        game.id = item.id
        game.map = item.map
        game.date = new Date(item.date)
        game.day = Math.floor((game.date.getTime() + this.dayShift) / 86400000)

        game.role = this.roleQueue ? Role[item.role as keyof typeof Role] : Role.Global

        if (!game.rank && item.outcome) {
          game.placement = true
          game.outcome = item.outcome
        }

        if (item.balance) {
          game.balance = item.balance.split(" ")[0]
        } else {
          game.balance = "Balanced"
          game.rank = true
        }

        gameList.push(game)
      }

      // sort games by date
      gameList.sort((a: Game, b: Game) => b.date.getTime() - a.date.getTime())

      // split games by roles and days, and compute diffs
      const previous = [] as Game[]
      const days = gameList.reduce((days: Game[][][], game: Game) => {
        if (!days[game.day]) {
          days[game.day] = [[], [], [], []]
        }
        if (previous[game.role] && game.sr) {
          previous[game.role].diff = previous[game.role].sr - game.sr
        }
        days[game.day][game.role].push(game)
        previous[game.role] = game
        return days
      }, []).filter(() => true)

      // remove unused roles
      for (const day of days) {
        if (this.roleQueue) {
          day.splice(3, 1)
        } else {
          day.splice(0, 3)
        }
      }

      return days.reverse()
    }
  },
  methods: {
    dayOf (game: Game) {
      const options = {
        // timeZone: "UTC",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }
      const date = new Date(game.date.getTime() + this.dayShift)
      return date.toLocaleDateString("en-UK", options)
    },
    timeOf (game: Game) {
      const options = {
        // timeZone: "UTC",
        hourCycle: "h23",
        hour: "numeric",
        minute: "numeric"
      }
      return game.date.toLocaleTimeString("en-GB", options)
    },
    editGame (id: string) {
      if (this.editable) {
        this.$emit("click-game", id)
      }
    }
  }
})
</script>

<style lang="sass">
.games
  .title
    text-transform: uppercase
    color: $glass
    background: rgba(0, 0, 0, 0.3)
    font-size: 1.1em
    text-align: center
    padding: 12px
    margin-bottom: 10px

  header
    background: rgba(0, 0, 0, 0.5)

    .roles
      height: 80px
      display: flex
      justify-content: space-around
      align-items: center
      max-width: 1400px
      margin: auto

      .role
        font-family: BigNoodleTooOblique, sans-serif
        font-size: 2.6em
        letter-spacing: 1px
        color: white
        width: 100%
        text-align: center

        &:not(:last-child)
          border-right: 1px solid rgba(100, 100, 100, 0.7)

        .icon
          width: 30px
          margin-right: 15px
          filter: invert(100%)

  .day .roles
    display: flex
    justify-content: center
    max-width: 1400px
    margin: auto

    .role
      margin: 10px 10px 30px
      max-width: 500px

  table
    border-collapse: collapse
    table-layout: fixed
    width: 100%

  tr
    background: $glass

    &:not(:last-child)
      border-bottom: 1px solid #a8bcd4

    &.unbalanced
      background: rgba(255, 255, 255, 0.65)

      .map .name
        color: grey

  .editable tr
    cursor: pointer

    &:hover
      background: rgba(255, 255, 255, 0.9)

      .diff, .outcome
        background: #ffed98

      .victory
        background: #b3ffb3

      .defeat
        background: #ffc5c5

    &:hover.rank
      background: #7a808d

      .rank-sr
        background: #5f6878

  td
    padding: 8px

  .time
    font-family: Manrope, sans-serif
    color: grey
    text-align: right
    width: 65px

  .map
    display: flex
    align-items: center

    .name
      color: $bluish
      font-family: BigNoodleTooOblique, sans-serif
      font-size: 1.6em
      width: 100%
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis

    .balance
      margin-left: 10px
      font-size: 1.1em

      &.fa-smile
        color: #90ff90

      &.fa-frown
        color: #ffa4a4

  .sr
    color: grey
    font-family: BigNoodleTooOblique, sans-serif
    font-size: 1.3em
    padding-right: 15px
    width: 52px

  .diff, .no-diff
    width: 48px
    text-align: center
    font-size: 1.1em

  .diff
    font-family: Manrope, sans-serif
    color: #ba7200
    background: #ffe361

  .no-diff
    text-align: center
    background: rgba(0, 0, 0, 0.1)
    color: grey

  .outcome
    font-family: BigNoodleTooOblique, sans-serif
    color: #ba7200
    background: #ffe361
    font-size: 1.6em
    text-align: center
    width: 100px

  .victory
    color: #006800
    background: #90ff90

  .defeat
    color: #a50000
    background: #ffa4a4

  .rank
    background: #5b626d

    .time
      color: lightgrey

    .rank-title
      font-family: BigNoodleTooOblique, sans-serif
      font-size: 1.6em
      color: white
      width: 100%
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis

      .icon
        filter: invert(100%)
        width: 20px
        margin-right: 8px

    .rank-sr
      font-family: BigNoodleTooOblique, sans-serif
      letter-spacing: 1px
      font-size: 1.6em
      background: #444d5a
      color: #c9ecff
      text-align: center
      width: 100px

</style>
