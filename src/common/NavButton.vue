<template>
  <div class="navbutton">
    <app-button :text="props.title"  style=":background: props.color"/>

  </div>
</template>

<script lang="ts" setup>
import {UserJSONResponse} from "@/types";

const props = withDefaults(
  defineProps<{
    color: string
    title: string
    description: string
  }>(),
  {
    color: '',
    title: '',
    description: '',
  },
)

import AppButton from "@/common/AppButton.vue";
</script>

<style scoped>

</style>
