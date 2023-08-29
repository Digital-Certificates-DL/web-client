<template>
  <div class="app-dropdown">
    <div class="app-dropdown__label">
      <img
        v-if="Boolean(mainImage) || Boolean(currentItem.img)"
        class="app-dropdown__label-img"
        :src="currentItem.img || mainImage"
        :alt="$t('app-dropdown.img-alt')"
      />
      <p class="dropdown__item-title">
        {{ currentItem.text || title || $t('app-dropdown.select-title') }}
      </p>
    </div>
    <div class="app-dropdown__content">
      <div v-for="(item, key) in items" :key="key">
        <div class="app-dropdown__item" @click="selectItem(item)">
          <img
            v-if="Boolean(item.img)"
            class="app-dropdown__item-img"
            :src="item.img"
            :alt="$t('app-dropdown.img-alt')"
          />
          <p class="app-dropdown__item-title">
            {{ item.text }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { DropdownItem } from '@/types'
const currentItem = ref({} as DropdownItem)

const emit = defineEmits<{
  (event: 'select-item', value: DropdownItem): void
}>()

withDefaults(
  defineProps<{
    items: DropdownItem[]
    title?: string
    mainImage?: string
  }>(),
  {
    title: '',
    mainImage: '',
  },
)

const selectItem = (item: DropdownItem) => {
  currentItem.value = item
  emit('select-item', item)
}
</script>

<style scoped lang="scss">
.app-dropdown {
  position: relative;
  display: inline-block;
  max-width: toRem(145);
  max-height: toRem(56);
}

.app-dropdown__label,
.app-dropdown__item {
  display: flex;
  align-items: center;
}

.app-dropdown__content {
  display: none;
  position: absolute;
  background-color: var(--background-primary-main);
  border-radius: toRem(8);
  padding: toRem(8);
  min-width: toRem(160);
  box-shadow: 0 toRem(8) toRem(16) 0 rgba(var(--white-rgb), 0.2);
  z-index: var(--defaut-z-index);
}

.app-dropdown__content a {
  color: var(--black);
  padding: toRem(12) toRem(16);
  text-decoration: none;
  display: block;
}

.app-dropdown__item-img,
.app-dropdown__label-img {
  max-width: toRem(17);
  max-height: toRem(14);
  margin-right: toRem(10);
}

.app-dropdown:hover .app-dropdown__content {
  display: block;
}
</style>
