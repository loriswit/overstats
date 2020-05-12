<template lang="pug">
  player(:player="$route.params.user", season="Season 22")
</template>

<script lang="ts">
import Vue from "vue"
import Player from "~/components/player.vue"

export default Vue.extend({
  components: {
    Player
  }
})
</script>
