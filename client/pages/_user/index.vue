<template lang="pug">
  player(:player="$route.params.user")
</template>

<script lang="ts">
import Vue from "vue"
import Player from "~/components/player/player.vue"

export default Vue.extend({
  components: {
    Player
  }
})
</script>
