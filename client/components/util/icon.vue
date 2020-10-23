<template lang="pug">
  img.icon(:src="require(`~/assets/icons/${name}.svg`)")
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  name: "Icon",
  props: {
    name: {
      type: String,
      required: true
    }
  }
})
</script>
