<template lang="pug">
  modal(v-model="dialog")
    form(@submit.prevent="submit")
      h2(v-if="update") Edit game
      h2(v-else) Add a new game
      .field(v-if="!update && roleQueue")
        label(for="role") Role
        select#role(v-model="role" @change="ranked = rankedRoles[role]" required)
          option(v-for="r in roles" :value="r") {{ r }}

      .field(v-if="ranked")
        label(for="sr") Skill rating
        input#sr(v-model="sr" ref="input" type="number" step="1" max="5000" min="0" required)

      .field(v-if="needOutcome")
        label(for="outcome") Outcome
        select#outcome(v-model="outcome" required)
          option(v-for="o in outcomes" :value="o") {{ o }}

      .field
        label(for="map") Map
        select#map(v-model="map" required)
          option(v-for="m in availableMaps" :value="m") {{ m }}

      .field
        label(for="balance") Balance
        select#balance(v-model="balance" required)
          option(v-for="b in balances" :value="b") {{ b }}

      .field(v-if="!update")
        label(for="date") Date
        input#date(v-model="date" type="datetime-local" step="1" required)

      .field.submit
        .buttons
          button.grey(type="button" @click="dialog = false") Cancel
          button.red(v-if="update" type="button" @click="remove") Delete
          button(type="submit") Save

        template(v-if="update == null")
          label.hidden(for="date") Date
          select#type(v-model="type")
            option(v-for="t in types" :value="t") {{ t }}
</template>

<script lang="ts">
import Vue from "vue"
import Modal from "~/components/util/modal.vue"

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
        Support: false,
        Any: false
      })
    },
    roleQueue: {
      type: Boolean,
      required: false,
      default: true
    },
    version: {
      type: Number,
      required: true
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

    maps: {
      common: [
        "Blizzard World",
        "Busan",
        "Dorado",
        "Eichenwalde",
        "Havana",
        "Hollywood",
        "Ilios",
        "Junkertown",
        "King's Row",
        "Lijiang Tower",
        "Nepal",
        "Numbani",
        "Oasis",
        "Rialto",
        "Route 66",
        "Watchpoint: Gibraltar"
      ],
      ow1: [
        "Hanamura",
        "Horizon Lunar Colony",
        "Paris",
        "Temple of Anubis",
        "Volskaya Industries"
      ],
      ow2: [
        "Circuit Royal",
        "Colosseo",
        "Esperança",
        "Midtown",
        "New Queen Street",
        "Paraíso"
      ]
    },
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
    },
    needOutcome (): boolean {
      return !this.ranked || !this.rankedRoles[this.role]
    },
    availableMaps (): string[] {
      return this.maps.common.concat(this.version === 1 ? this.maps.ow1 : this.maps.ow2).sort()
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
          this.ranked = this.update.ranked
        } else {
          date = new Date()
          this.map = ""
          this.outcome = ""
          this.sr = ""
          this.balance = "Balanced"
          this.role = this.roleQueue ? this.role : "Any"
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
        outcome: this.needOutcome ? this.outcome : undefined,
        role: this.role,
        map: this.map,
        balance: this.balance,
        date: new Date(this.date)
      }
      this.dialog = false
      this.$emit("submit", payload)
    },
    remove () {
      this.dialog = false
      this.$emit("delete")
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
