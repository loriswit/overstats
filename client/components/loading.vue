<template lang="pug">
  .container
    .loading
</template>

<style scoped lang="sass">
.container
  background-color: rgba(0, 0, 0, 0.4)
  width: 100%
  height: 100vh
  position: absolute
  top: 0
  left: 0
  display: flex
  align-items: center
  justify-content: center

.loading
  border: 4px solid rgba(255, 255, 255, 0.2)
  border-top: 4px solid white
  border-radius: 50%
  width: 80px
  height: 80px
  animation: spin 1s linear infinite

@keyframes spin
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)

</style>
