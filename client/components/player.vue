<template lang="pug">
  .container
    header
      .player
        img.icon(v-if="icon" :src="icon")
        h1 {{ profile.name }}
        .battle-tag(v-if="profile.battleTag")
          span {{ profile.battleTag.split("#")[0] }}
          span.tag {{ "#" + profile.battleTag.split("#")[1] }}
        .count(v-if="!loading") {{ gamesCount }} game{{ gamesCount === 1 ? "" : "s" }}
      .actions
        button(v-if="editable && !loading && roleQueue" @click="addGameDialog = true") add game
        select(v-if="seasons.length > 1" @change="selectSeason")
          option(hidden disabled selected) Season
          option(v-for="s in seasons" :value="s.toLowerCase().replace(/ /g, '-')" :selected="season === s") {{ s }}

    loading(v-if="loading")
    games(v-else :events="events", :role-queue="roleQueue" :editable="editable" @click-game="onGameClicked")

    template(v-if="editable")
      game-dialog(v-model="addGameDialog" :rankedRoles="rankedRoles" @submit="addGame")
      placement-dialog(v-model="placementRequired.dialog" :role="placementRequired.role" @submit="addPlacement")
      game-dialog(v-model="updateGameDialog" :update="targetGame" @submit="updateGame" @delete="deleteGame")
      placement-dialog(v-model="updatePlacementDialog" :update="targetPlacement" @submit="updatePlacement")
</template>

<script lang="ts">
import Vue from "vue"
import Games from "~/components/games.vue"
import GameDialog from "~/components/game-dialog.vue"
import PlacementDialog from "~/components/placement-dialog.vue"
import Loading from "~/components/loading.vue"
import { userStore } from "~/store"

export default Vue.extend({
  name: "Player",
  components: {
    Games,
    GameDialog,
    Loading,
    PlacementDialog
  },
  props: {
    player: {
      type: String,
      required: true
    },
    season: {
      type: String,
      required: true
    }
  },
  data: () => ({
    seasons: [],

    profile: {} as any,
    icon: null,

    games: [] as any[],
    placements: [] as any[],

    user: userStore,
    loading: true,

    addGameDialog: false,

    updateGameDialog: false,
    targetGame: { id: 0 },

    updatePlacementDialog: false,
    targetPlacement: { id: 0 }
  }),
  computed: {
    roleQueue () {
      // no role-queue for season 1-17
      return !this.season.match(/(^Season \d$)|(^Season 1[0-7]$)/)
    },
    editable (): boolean {
      return this.user.name === this.player
    },
    events (): any[] {
      return this.games.concat(this.placements)
    },
    gamesCount (): number {
      return this.placements.length + this.games.length
    },
    rankedRoles () {
      // determine which roles are done with their placement games
      const roles = { Tank: false, Damage: false, Support: false } as { [index: string]: boolean }

      for (const role in roles) {
        if (this.games.filter(g => g.ranked).concat(this.placements).find(e => e.role === role)) {
          roles[role] = true
        }
      }
      return roles
    },
    placementRequired () {
      // open placement dialog when at least 5 placement games found
      for (const role of ["Tank", "Damage", "Support"]) {
        if (!this.placements.find(p => p.role === role)) {
          if (this.games.filter(g => g.role === role && !g.ranked).length >= 5) {
            return { dialog: true, role }
          }
        }
      }
      return { dialog: false, role: "" }
    }
  },
  async created () {
    await Promise.all([
      (this as any).fetchSeasons(),
      (this as any).fetchGames(),
      (this as any).fetchProfile(),
      (this as any).fetchIcon()])
  },
  methods: {
    async fetchGames () {
      [this.games, this.placements] = await Promise.all([
        this.$axios.$get(`/users/${this.player}/games?season=${this.season}`),
        this.$axios.$get(`/users/${this.player}/placements?season=${this.season}`)])

      this.loading = false
    },
    async fetchProfile () {
      this.profile = await this.$axios.$get(`/users/${this.player}`)
    },
    async fetchIcon () {
      this.icon = (await this.$axios.$get(`/users/${this.player}/icon`)).icon
    },
    async fetchSeasons () {
      this.seasons = (await this.$axios.$get("seasons")).reverse()
    },

    async addGame (payload: any) {
      payload.season = this.season
      const game = await this.$axios.$post(`/users/${this.player}/games`, payload)
      await (this as any).reloadNextGame(game)

      this.games.push(game)

      // if placement game, reload placement events
      if (!payload.sr) {
        this.placements = await this.$axios.$get(`/users/${this.player}/placements`)
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
        // console.log("NEXT IS " + next.map)
        const game = await this.$axios.$get(`/users/${this.player}/games/${next.id}`)
        Object.assign(next, game)
      }
    },

    selectSeason (event: Event) {
      const target = (event.target as HTMLSelectElement).value
      this.$router.push("/" + this.player + "/" + target)
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
</style>
