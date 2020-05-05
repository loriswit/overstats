<template lang="pug">
  player(:player="$route.params.user", :season="$route.params.season")
</template>

<script lang="ts">
import Vue from "vue"
import Player from "~/components/player.vue"

export default Vue.extend({
  components: {
    Player
  },
  beforeCreate () {
    if (this.$route.params.season === "S21") {
      this.$router.replace("/" + this.$route.params.user)
    }
  }
})
</script>
