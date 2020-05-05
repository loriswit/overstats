<template lang="pug">
  .bg(v-if="value" @click="close")
    .modal(@click.stop :style="`background-color: ${background}; max-width: ${width}`")
      slot
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  name: "Modal",
  props: {
    value: {
      type: Boolean,
      required: true
    },
    background: {
      type: String,
      default: "#ddd",
      required: false
    },
    width: {
      type: String,
      default: "500px",
      required: false
    }
  },
  methods: {
    close () {
      this.$emit("input", false)
    }
  }
})
</script>

<style lang="sass" scoped>
.bg
  position: fixed
  z-index: 1
  left: 0
  top: 0
  width: 100%
  height: 100%
  display: flex
  align-items: center
  overflow: auto
  background-color: rgba(0, 0, 0, 0.7)

.modal
  border-radius: 4px
  padding: 24px
  margin: auto
  width: 95%
  /*max-width: 500px*/
</style>
