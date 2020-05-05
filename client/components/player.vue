<template lang="pug">
  .container
    header
      .player
        img.icon(v-if="icon" :src="icon")
        h1 {{ profile.name }}
        .battle-tag(v-if="profile.tag")
          span {{ profile.tag.split("#")[0] }}
          span.tag {{ "#" + profile.tag.split("#")[1] }}
        .count(v-if="!loading") {{ gamesCount }} game{{ gamesCount === 1 ? "" : "s" }}
      .actions
        button(v-if="editable && !loading && roleQueue" @click="addGameDialog = true") add game
        select(v-if="seasons.length > 1" @change="selectSeason")
          option(hidden disabled selected) Season
          option(v-for="s in seasons" :value="s.key" :selected="season === s.key") {{ s.name }}

    loading(v-if="loading")
    games(v-else :data="data", :role-queue="roleQueue" :editable="editable" @click-game="onGameClicked")

    template(v-if="editable")
      game-dialog(v-model="addGameDialog" :rankedRoles="rankedRoles" @submit="addGame")
      rank-dialog(v-model="initRank.dialog" :role="initRank.role" @submit="addRank")
      game-dialog(v-model="updateGameDialog" :update="targetGame" @submit="updateGame" @delete="deleteGame")
      rank-dialog(v-model="updateRankDialog" :update="targetRank" @submit="updateRank")
</template>

<script lang="ts">
import Vue from "vue"
import Games from "~/components/games.vue"
import GameDialog from "~/components/game-dialog.vue"
import RankDialog from "~/components/rank-dialog.vue"
import Loading from "~/components/loading.vue"
import { userStore } from "~/store"

export default Vue.extend({
  name: "Player",
  components: {
    Games,
    GameDialog,
    Loading,
    RankDialog
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
    profile: {} as any,
    icon: null,

    ranked: [] as any[],
    ranks: [] as any[],
    placements: [] as any[],

    user: userStore,
    loading: true,

    addGameDialog: false,

    updateGameDialog: false,
    targetGame: { id: 0 },

    updateRankDialog: false,
    targetRank: { id: 0 }
  }),
  computed: {
    roleQueue () {
      // no role-queue for season 1-16
      return !this.season.match(/(^S\d$)|(^S1[0-7]$)/)
    },
    seasons () {
      if (this.profile.seasons) {
        return this.profile.seasons.filter((s: any) => s.games > 0).reverse()
      }
      return []
    },
    editable (): boolean {
      return this.user.name === this.player
    },
    data (): any[] {
      return this.placements.concat(this.ranks).concat(this.ranked)
    },
    gamesCount (): number {
      return this.placements.length + this.ranked.length
    },
    rankedRoles () {
      const roles = {
        Tank: false,
        Damage: false,
        Support: false
      } as { [index: string]: boolean }

      for (const r in roles) {
        if (this.ranked.concat(this.ranks).find(({ role }) => role === r)) {
          roles[r] = true
        }
      }
      return roles
    },
    initRank () {
      for (const r of ["Tank", "Damage", "Support"]) {
        if (!this.ranks.find(({ role }) => role === r)) {
          if (this.placements.filter(({ role }) => role === r).length >= 5) {
            return {
              dialog: true,
              role: r
            }
          }
        }
      }
      return {
        dialog: false,
        role: ""
      }
    }
  },
  async created () {
    await Promise.all([
      (this as any).fetchGames(),
      (this as any).fetchProfile(),
      (this as any).fetchIcon()])
  },
  methods: {
    async fetchGames () {
      [this.ranked, this.ranks, this.placements] = await Promise.all([
        this.$axios.$get(`/users/${this.player}/${this.season}/games`),
        this.$axios.$get(`/users/${this.player}/${this.season}/ranks`),
        this.$axios.$get(`/users/${this.player}/${this.season}/placements`)])

      this.loading = false
    },
    async fetchProfile () {
      this.profile = await this.$axios.$get(`/users/${this.player}`)
    },
    async fetchIcon () {
      this.icon = (await this.$axios.$get(`/users/${this.player}/icon`)).icon
    },

    async addGame ({ ranked, payload }: { ranked: boolean, payload: any }) {
      if (ranked) {
        const game = await this.$axios.$post(`/users/${this.player}/${this.season}/games`, payload)
        this.ranked.push(game)
      } else {
        const game = await this.$axios.$post(`/users/${this.player}/${this.season}/placements`, payload)
        this.placements.push(game)
        this.ranks = await this.$axios.$get(`/users/${this.player}/${this.season}/ranks`)
      }
    },
    async updateGame ({ ranked, payload }: { ranked: boolean, remove: boolean, payload: any }) {
      if (ranked) {
        const game =
          await this.$axios.$patch(`/users/${this.player}/${this.season}/games/${this.targetGame.id}`, payload)
        Object.assign(this.targetGame, game)
      } else {
        const game =
          await this.$axios.$patch(`/users/${this.player}/${this.season}/placements/${this.targetGame.id}`, payload)
        Object.assign(this.targetGame, game)
        this.ranks = await this.$axios.$get(`/users/${this.player}/${this.season}/ranks`)
      }
    },
    async deleteGame (ranked: boolean) {
      if (ranked) {
        await this.$axios.$delete(`/users/${this.player}/${this.season}/games/${this.targetGame.id}`)
        const index = this.ranked.findIndex(item => item.id === this.targetGame.id)
        this.ranked.splice(index, 1)
      } else {
        await this.$axios.$delete(`/users/${this.player}/${this.season}/placements/${this.targetGame.id}`)
        const index = this.placements.findIndex(item => item.id === this.targetGame.id)
        this.placements.splice(index, 1)
      }
    },
    async addRank (payload: any) {
      const rank = await this.$axios.$post(`/users/${this.player}/${this.season}/ranks`, payload)
      this.ranks.push(rank)
    },
    async updateRank (payload: any) {
      const rank =
        await this.$axios.$patch(`/users/${this.player}/${this.season}/ranks/${this.targetRank.id}`, payload)
      Object.assign(this.targetRank, rank)
    },
    selectSeason (event: Event) {
      const target = (event.target as HTMLSelectElement).value
      this.$router.push("/" + this.player + "/" + target)
    },
    onGameClicked (id: string) {
      const game = this.placements.concat(this.ranked).find(item => item.id === id)
      if (game) {
        this.targetGame = game
        this.updateGameDialog = true
      } else {
        const rank = this.ranks.find(item => item.id === id)
        if (rank) {
          this.targetRank = rank
          this.updateRankDialog = true
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
