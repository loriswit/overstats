<template lang="pug">
  player(:player="$route.params.user", :season="season")
</template>

<script lang="ts">
import Vue from "vue"
import Player from "~/components/player.vue"

export default Vue.extend({
  components: {
    Player
  },
  computed: {
    season () {
      const season = this.$route.params.season
      if (season.startsWith("season-")) {
        return "Season " + season.slice(7)
      } else if (season === "role-queue-beta") {
        return "Role Queue Beta"
      }
      return season
    }
  },
  beforeCreate () {
    if (this.$route.params.season === "season-22") {
      this.$router.replace("/" + this.$route.params.user)
    }
  }
})
</script>
