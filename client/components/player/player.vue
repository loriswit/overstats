<template lang="pug">
  .container
    header
      .player
        img.icon(v-if="icon" :src="icon")
        h1 {{ profile.name }}
        .battle-tag(v-if="profile.battleTag")
          span {{ profile.battleTag.split("#")[0] }}
          span.tag {{ "#" + profile.battleTag.split("#")[1] }}
        .count(v-if="!loading") {{ games.length }} game{{ games.length === 1 ? "" : "s" }}
      .actions
        button(v-if="editable && season" @click="addGameDialog = true") Add game
        select(v-model="season" @change="fetchGames")
          option(value="") All seasons
          option(v-for="s in seasons" :value="s") {{ s }}
        select(v-if="seasonNumber > 22 && view === View.History" v-model="queueMode")
          option(value="rq") Role Queue
          option(value="oq") Open Queue
        select(v-model="view")
          option(:value="View.History") History
          option(:value="View.Chart") Progression
          option(:value="View.Stats") Statistics

    loading(v-if="loading")
    template(v-if="pageReady")
      history(v-if="view === View.History" :events="events" :role-queue="roleQueue" :editable="editable" @click-game="onGameClicked")
      stats(v-else-if="view === View.Stats" :games="games")
      .chart(v-else-if="view === View.Chart")
        sr-chart(:events="events" :editable="editable" @click-game="onGameClicked")

    template(v-if="editable")
      game-dialog(v-model="addGameDialog" :ranked-roles="rankedRoles" :role-queue="roleQueue" @submit="addGame")
      placement-dialog(v-model="placementRequired.dialog" :role="placementRequired.role" @submit="addPlacement")
      game-dialog(v-model="updateGameDialog" :update="targetGame" :role-queue="roleQueue" @submit="updateGame" @delete="deleteGame")
      placement-dialog(v-model="updatePlacementDialog" :update="targetPlacement" @submit="updatePlacement")
</template>

<script lang="ts">
import Vue from "vue"
import Loading from "~/components/util/loading.vue"

import GameDialog from "~/components/player/dialogs/game-dialog.vue"
import PlacementDialog from "~/components/player/dialogs/placement-dialog.vue"

import History from "~/components/player/views/history.vue"
import SrChart from "~/components/player/views/sr-chart.vue"
import Stats from "~/components/player/views/stats.vue"

import { userStore } from "~/store"

enum View {
  History = "history",
  Chart = "chart",
  Stats = "stats"
}

export default Vue.extend({
  name: "Player",
  components: {
    History,
    SrChart,
    Stats,
    GameDialog,
    PlacementDialog,
    Loading
  },
  props: {
    player: {
      type: String,
      required: true
    }
  },
  data: () => ({
    season: "",
    seasons: [],
    queueMode: "rq",

    profile: {} as any,
    icon: null,

    View,
    view: View.History,

    games: [] as any[],
    placements: [] as any[],

    user: userStore,
    loading: true,
    pageReady: false,

    addGameDialog: false,

    updateGameDialog: false,
    targetGame: { id: 0 },

    updatePlacementDialog: false,
    targetPlacement: { id: 0 }
  }),
  computed: {
    seasonNumber (): number {
      if (this.season === "") {
        return Number.MAX_VALUE
      }
      if (this.season === "Role Queue Beta") {
        return 17.5
      }
      return parseInt(this.season.slice(7))
    },
    roleQueue (this: any): boolean {
      if (this.seasonNumber > 22) {
        return this.queueMode === "rq"
      }

      return this.seasonNumber > 17
    },
    editable (): boolean {
      return this.user.name.toUpperCase() === this.player.toUpperCase()
    },
    events (): any[] {
      return this.games.concat(this.placements)
    },
    rankedRoles () {
      // determine which roles are done with their placement games
      const roles = { Tank: false, Damage: false, Support: false, Any: false } as { [index: string]: boolean }

      for (const role in roles) {
        if (this.games.filter(g => g.ranked).concat(this.placements).find(e => e.role === role)) {
          roles[role] = true
        }
      }
      return roles
    },
    placementRequired () {
      // open placement dialog when enough placement games found
      for (const [role, required] of [["Tank", 5], ["Damage", 5], ["Support", 5], ["Any", 10]]) {
        if (!this.placements.find(p => p.role === role)) {
          if (this.games.filter(g => g.role === role && !g.ranked).length >= required) {
            return { dialog: true, role }
          }
        }
      }
      return { dialog: false, role: "" }
    }
  },
  async created (this: any) {
    this.fetchProfile()

    await this.fetchSeasons()
    this.season = this.seasons[0]
    await this.fetchGames()

    this.pageReady = true
  },
  methods: {
    async fetchGames () {
      this.loading = true
      try {
        [this.games, this.placements] = await Promise.all([
          this.$axios.$get(`/users/${this.player}/games?season=${this.season}`),
          this.$axios.$get(`/users/${this.player}/placements?season=${this.season}`)])

        // set queue mode according to most recent game
        if (this.games.length) {
          const latestGame = this.games.reduce((game, latest) => game.date > latest.date ? game : latest)
          this.queueMode = latestGame.role === "Any" ? "oq" : "rq"
        }
      } finally {
        this.loading = false
      }
    },
    async fetchSeasons () {
      this.loading = true
      try {
        this.seasons = (await this.$axios.$get("seasons")).reverse()
      } finally {
        this.loading = false
      }
    },
    async fetchProfile () {
      this.profile = await this.$axios.$get(`/users/${this.player}`)
      if (this.profile.battleTag) {
        const tag = this.profile.battleTag.replace("#", "-")
        this.icon = (await this.$axios.$get(`https://ow-api.com/v1/stats/pc/us/${tag}/profile`)).icon
      }
    },

    async addGame (payload: any) {
      payload.season = this.season
      const game = await this.$axios.$post(`/users/${this.player}/games`, payload)
      await (this as any).reloadNextGame(game)

      this.games.push(game)

      // if placement game, reload placement events
      if (!payload.sr) {
        this.placements = await this.$axios.$get(`/users/${this.player}/placements?season=${this.season}`)
      }
    },
    async updateGame (payload: any) {
      const game = await this.$axios.$patch(`/users/${this.player}/games/${this.targetGame.id}`, payload)
      await (this as any).reloadNextGame(this.targetGame)

      Object.assign(this.targetGame, game)
    },
    async deleteGame () {
      await this.$axios.$delete(`/users/${this.player}/games/${this.targetGame.id}`)
      await (this as any).reloadNextGame(this.targetGame)

      const index = this.games.findIndex(item => item.id === this.targetGame.id)
      this.games.splice(index, 1)
    },

    async addPlacement (payload: any) {
      payload.season = this.season
      const placement = await this.$axios.$post(`/users/${this.player}/placements`, payload)
      await (this as any).reloadNextGame(placement)

      this.placements.push(placement)
    },
    async updatePlacement (payload: any) {
      const placement = await this.$axios.$patch(`/users/${this.player}/placements/${this.targetPlacement.id}`, payload)
      await (this as any).reloadNextGame(this.targetPlacement)

      Object.assign(this.targetPlacement, placement)
    },

    async reloadNextGame (event: any) {
      const next = this.games.filter(g => g.role === event.role && g.date > event.date)
        .sort((a, b) => a.date.localeCompare(b.date))[0]

      if (next) {
        const game = await this.$axios.$get(`/users/${this.player}/games/${next.id}`)
        Object.assign(next, game)
      }
    },

    onGameClicked (id: string) {
      const game = this.games.find(item => item.id === id)
      if (game) {
        this.targetGame = game
        this.updateGameDialog = true
      } else {
        const placement = this.placements.find(item => item.id === id)
        if (placement) {
          this.targetPlacement = placement
          this.updatePlacementDialog = true
        }
      }
    }
  },
  head () {
    return {
      title: this.profile.name
    }
  }
})
</script>

<style lang="sass" scoped>
.container
  flex: 1
  display: flex
  flex-direction: column

header
  display: flex
  justify-content: space-between
  align-items: center
  background: rgba(0, 0, 0, 0.5)
  padding: 15px

  .player
    display: flex
    align-items: baseline

    .icon
      width: 48px
      margin-right: 16px

    h1
      font-family: BigNoodleTooOblique, sans-serif
      letter-spacing: 1px
      font-size: 4em
      color: white

    .battle-tag
      font-family: BigNoodleTooOblique, sans-serif
      letter-spacing: 1px
      font-size: 2.5em
      color: lightblue
      margin-left: 20px

      .tag
        font-size: 0.7em
        color: rgba(173, 216, 230, 0.6)

    .count
      text-transform: uppercase
      font-size: 2em
      color: white
      margin-left: 40px

  .actions
    display: flex
    align-items: center
    margin-right: 8px

    select
      margin-left: 16px
      width: initial

.chart
  width: 100%
  padding: 40px
  flex: 1

  > *
    height: 100%
</style>
