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
                :class="{ unbalanced: game.balance && game.balance !== 'Balanced', placement: game.placement }"
                :title="game.balance && game.balance !== 'Balanced' ? game.balance + ' advantage' : false")

                td.time {{ timeOf(game) }}

                template(v-if="game.placement")
                  td.placement-title(:class="roles[game.role]")
                    icon(v-if="roleQueue" :name="roles[game.role]")
                    span Placement
                  td.placement-sr(colspan=2) {{ game.sr }}

                template(v-else)
                  td.map
                    span.name {{ game.map }}
                    i.balance.fas.fa-smile(v-if="game.balance === 'Allied'")
                    i.balance.fas.fa-frown(v-if="game.balance === 'Enemy'")

                  td.outcome(v-if="!game.ranked" colspan=2
                    :class="game.outcome.toLowerCase()")
                    | {{ game.outcome }}

                  template(v-else)
                    td.sr {{ game.sr }}
                    td.diff(:class="game.outcome.toLowerCase()")
                      template(v-if="game.diff === undefined") —
                      template(v-else) {{ (game.diff > 0 ? "+" : "") + game.diff }}
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue"
import Icon from "~/components/util/icon.vue"
import { Event, Role } from "~/types/event"

export default Vue.extend({
  name: "History",
  components: {
    Icon
  },
  props: {
    events: {
      type: Array,
      required: true
    } as PropOptions<any[]>,
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
      if (!this.events.length) {
        return []
      }

      // parse games
      const events = [] as Event[]
      for (const event of this.events) {
        const game = {} as Event
        Object.assign(game, event)
        game.date = new Date(event.date)
        game.day = Math.floor((game.date.getTime() + this.dayShift) / 86400000)
        game.role = Role[event.role as keyof typeof Role]
        game.placement = event.outcome === undefined

        if (event.balance) {
          game.balance = event.balance.split(" ")[0]
        }

        events.push(game)
      }

      // filter games according to queue type
      const filtered = events.filter(game => this.roleQueue ? game.role !== Role.Any : game.role === Role.Any)

      // sort games by date
      filtered.sort((a: Event, b: Event) => b.date.getTime() - a.date.getTime())

      // split games by roles and days
      const previous = [] as Event[]
      const days = filtered.reduce((days: Event[][][], game: Event) => {
        if (!days[game.day]) {
          days[game.day] = [[], [], [], []]
        }
        // compute SR difference
        if (previous[game.role]) {
          const prev = previous[game.role]
          if (game.sr && prev.sr) {
            previous[game.role].diff = prev.sr - game.sr
          }
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
    dayOf (game: Event) {
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      const date = new Date(game.date.getTime() + this.dayShift)
      return date.toLocaleDateString("en-GB", options)
    },
    timeOf (game: Event) {
      const options = { hourCycle: "h23", hour: "numeric", minute: "numeric" }
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

<style lang="sass" scoped>
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

    &:hover.placement
      background: #7a808d

      .placement-sr
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

  .diff
    font-family: Manrope, sans-serif
    width: 48px
    text-align: center
    font-size: 1.1em

  .outcome
    font-family: BigNoodleTooOblique, sans-serif
    font-size: 1.6em
    text-align: center
    width: 100px

  .victory
    color: #006800
    background: #90ff90

  .defeat
    color: #a50000
    background: #ffa4a4

  .draw
    color: #ba7200
    background: #ffe883

  .placement
    background: #5b626d

    .time
      color: lightgrey

    .placement-title
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

    .placement-sr
      font-family: BigNoodleTooOblique, sans-serif
      letter-spacing: 1px
      font-size: 1.6em
      background: #444d5a
      color: #c9ecff
      text-align: center
      width: 100px

</style>
