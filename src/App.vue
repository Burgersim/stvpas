<template>
  <div id="app">
    <PASImport msg="STV PAS Import"/>
  </div>
</template>

<script>
import PASImport from './components/PASImport.vue'

export default {
  name: 'App',
  components: {
    PASImport
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

</style>
