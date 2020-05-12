<template lang="pug">
  modal(v-model="dialog" background="#464f65" width="350px")
    form(@submit.prevent="submit")
      h2 {{ update ? "Edit " + update.role : role }} Placement
      .field
        label(for="sr") Skill rating
        input#sr(v-model="sr" ref="input" type="number" step="1" max="5000" min="0" required)

      .field.submit
        button(type="submit") Save
</template>

<script lang="ts">
import Vue from "vue"
import Modal from "~/components/modal.vue"

export default Vue.extend({
  name: "PlacementDialog",
  components: {
    Modal
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    role: {
      type: String,
      required: false,
      default: undefined
    },
    update: {
      type: Object,
      required: false,
      default: null
    }
  },
  data: () => ({
    sr: null
  }),
  computed: {
    dialog: {
      get (): boolean {
        return this.value
      },
      set (value: boolean) {
        this.$emit("input", value)
      }
    }
  },
  watch: {
    value (val) {
      if (val) {
        if (this.update) {
          this.sr = this.update.sr
        }
        setTimeout(() => (this.$refs.input as HTMLElement).focus())
      }
    }
  },
  methods: {
    submit () {
      const payload = {
        sr: this.sr,
        role: this.role
      }
      this.dialog = false
      this.$emit("submit", payload)
    }
  }
})
</script>

<style lang="sass" scoped>
.submit
  margin-top: 24px
  flex-direction: row-reverse

h2, label
  color: white

</style>
