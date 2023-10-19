<template>
  <div id="app">
    <h1>{{msg}}</h1>
    <br>
    <b-alert :variant=error :show="elapsed !== ''">{{ elapsed }}</b-alert>
    <b-button block variant="warning" v-on:click="importPAS" :disabled="synchInProgress" style="font-variant: small-caps; width: 90px"><b-spinner small v-if="synchInProgress" variant="light"></b-spinner>{{ synchInProgress ? "" : "Import" }}</b-button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'PASImport',
  props: {
    msg: String
  },
  data() {
    return {
      synchInProgress: false,
      elapsed: "",
      error: "success"
    }
  },
  methods: {
    importPAS() {
      this.elapsed = "";
      this.synchInProgress = true;
      axios.get('/api/premieringAssetSync').then((res) => {
        this.elapsed = res.data;
        console.log(res.data)
        this.synchInProgress = false;
        if(res.status !== 200)
          this.error = "danger"
        console.log(res)
      }).then(() => {
        setTimeout(() => {
          this.elapsed = "";
          this.error = "success";
        }, 7000);
      })

    }
  }
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
