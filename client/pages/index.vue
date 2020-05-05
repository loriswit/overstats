<script lang="ts">
import Vue from "vue"
import { userStore } from "~/store"

export default Vue.extend({
  beforeCreate () {
    this.$router.replace(userStore.logged ? userStore.name : "login")
  }
})
</script>
