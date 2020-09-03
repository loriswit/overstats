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
      return this.$route.params.season
        .toLowerCase()
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    }
  },
  beforeCreate () {
    if (this.$route.params.season === "season-24-role-queue") {
      this.$router.replace("/" + this.$route.params.user)
    }
  }
})
</script>
