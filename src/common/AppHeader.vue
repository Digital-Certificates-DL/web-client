<template>
<div class="header">
  <div class="header_logo">
    <h2>LOGO</h2>
  </div>
  <div class="header_configuration">
    <div class="header_metamask">
      Metamask
      <button @click="connect"></button>
    </div>
    <div class="header_settings">
      <button @click="goToSetting">      Setting
      </button>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import {router} from "@/router";
import {ROUTE_NAMES} from "@/enums";

const goToSetting = () =>{
  router.push(ROUTE_NAMES.setting)
}
const connect = () =>{
//   todo add metamask connector
}
</script>

<style scoped lang="scss">
.header{
  width: 90%;
  margin: auto;
  display: flex;
  justify-content: space-between;
}

.header_logo{

}

.header_settings{
  background: #E5E5E5;
  border-radius: toRem(5);
}

.header_metamask{
  background: #E5E5E5;
  border-radius: toRem(5);
}

</style>
