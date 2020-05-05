<template lang="pug">
  modal(v-model="dialog")
    form(@submit.prevent="submit")
      h2(v-if="update") Edit game
      h2(v-else) Add a new game
      .field
        label(for="role") Role
        select#role(v-model="role" @change="ranked = rankedRoles[role]" required)
          option(v-for="r in roles" :value="r") {{ r }}

      .field(v-if="ranked")
        label(for="sr") Skill rating
        input#sr(v-model="sr" ref="input" type="number" step="1" max="5000" min="0" required)

      .field(v-else)
        label(for="outcome") Outcome
        select#outcome(v-model="outcome" required)
          option(v-for="o in outcomes" :value="o") {{ o }}

      .field
        label(for="map") Map
        select#map(v-model="map" required)
          option(v-for="m in maps" :value="m") {{ m }}

      .field
        label(for="balance") Balance
        select#balance(v-model="balance" required)
          option(v-for="b in balances" :value="b") {{ b }}

      .field
        label(for="date") Date
        input#date(v-model="date" type="datetime-local" step="1" required)

      .field.submit
        .buttons
          button.grey(type="button" @click="dialog = false") Close
          button.red(v-if="update" type="button" @click="remove") Delete
          button(type="submit") Save

        template(v-if="update == null")
          label.hidden(for="date") Date
          select#type(v-model="type")
            option(v-for="t in types" :value="t") {{ t }}
</template>

<script lang="ts">
import Vue from "vue"
import Modal from "~/components/modal.vue"

export default Vue.extend({
  name: "GameDialog",
  components: {
    Modal
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    update: {
      type: Object,
      required: false,
      default: null
    },
    rankedRoles: {
      type: Object,
      required: false,
      default: () => ({
        Tank: false,
        Damage: false,
        Support: false
      })
    }
  },
  data: () => ({
    sr: "",

    types: ["Placement", "Ranked"],
    type: "",

    outcomes: ["Victory", "Defeat", "Draw"],
    outcome: "",

    roles: ["Tank", "Damage", "Support"],
    role: "Tank",

    maps: [
      "Blizzard World",
      "Busan",
      "Dorado",
      "Eichenwalde",
      "Hanamura",
      "Havana",
      "Hollywood",
      "Horizon Lunar Colony",
      "Ilios",
      "Junkertown",
      "King's Row",
      "Lijiang Tower",
      "Nepal",
      "Numbani",
      "Oasis",
      "Paris",
      "Rialto",
      "Route 66",
      "Temple of Anubis",
      "Volskaya Industries",
      "Watchpoint: Gibraltar"
    ],
    map: "",

    balances: [
      "Balanced",
      "Enemy Advantage",
      "Allied Advantage"
    ],
    balance: "Balanced",

    date: ""
  }),
  computed: {
    dialog: {
      get (): boolean {
        return this.value
      },
      set (value: boolean) {
        this.$emit("input", value)
      }
    },
    ranked: {
      get (): boolean {
        return this.type === "Ranked"
      },
      set (value: boolean) {
        this.type = value ? "Ranked" : "Placement"
      }
    }
  },
  watch: {
    dialog (val) {
      if (val) {
        let date: Date
        if (this.update) {
          date = new Date(this.update.date)
          this.role = this.update.role
          this.balance = this.update.balance
          this.map = this.update.map
          this.outcome = this.update.outcome
          this.sr = this.update.sr
          this.ranked = this.sr !== undefined
        } else {
          date = new Date()
          this.map = ""
          this.outcome = ""
          this.sr = ""
          this.ranked = this.rankedRoles[this.role]
        }

        const offset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.valueOf() - offset)
        this.date = localDate.toISOString().slice(0, 19)

        if (this.ranked) {
          setTimeout(() => (this.$refs.input as HTMLElement).focus())
        }
      }
    }
  },
  methods: {
    submit () {
      const payload = {
        sr: this.ranked ? +this.sr : undefined,
        outcome: this.ranked ? undefined : this.outcome,
        role: this.role,
        map: this.map,
        balance: this.balance,
        date: new Date(this.date)
      }
      this.dialog = false
      this.$emit("submit", {
        ranked: this.ranked,
        payload
      })
    },
    remove () {
      this.dialog = false
      this.$emit("delete", this.ranked)
    }
  }
})
</script>

<style lang="sass" scoped>
#type
  width: auto
  background: none
  border: none
  border-radius: 0
  padding: 5px 0
  color: darkgrey

  &:hover
    border-bottom: 1px solid darkgrey
    border-top: 1px solid transparent

.submit
  flex-direction: row-reverse

.buttons
  margin-top: 24px

  button:not(:last-child)
    margin-right: 12px

</style>
