<template lang="pug">
  .loading
</template>

<style scoped lang="sass">
.loading
  border: 4px solid rgba(255, 255, 255, 0.2)
  border-top: 4px solid white
  border-radius: 50%
  width: 80px
  height: 80px
  margin: 100px auto
  animation: spin 1s linear infinite

@keyframes spin
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)

</style>
