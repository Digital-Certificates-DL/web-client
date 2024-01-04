<template>
  <div class="all-templates-page">
    <h2>{{ $t('all-templates-page.templates-title') }}</h2>

    <div class="all-templates-page__list">
      <no-data-message
        v-if="!templatesList.length"
        class="all-templates-page__no-data-message"
        :message="$t('all-templates-page.empty-template-list')"
      />
      <template-item
        class="all-templates-page__template-item"
        v-for="(item, key) in templatesList"
        :key="key"
        :template="item"
        @select="selectItem($event, item)"
        @remove="removeTemplate"
      />
    </div>

    <loader-modal
      v-model:is-shown="isLoading"
      :text="$t('all-templates-page.loader-text-update-date')"
    />
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { TemplateJSONItem } from '@/types'
import { ref } from 'vue'
import { NoDataMessage, LoaderModal, TemplateItem } from '@/common'
import { ErrorHandler } from '@/helpers'
import { removeTemplateByID, uploadTemplates } from '@/api'

const userState = useUserStore()

const selectedItems = ref<TemplateJSONItem[]>([])
const templatesList = ref<TemplateJSONItem[]>([])

const isLoading = ref(false)

const selectItem = (isSelected: boolean, item: TemplateJSONItem) => {
  if (isSelected) {
    selectedItems.value.push(item)
    return
  }

  const index = selectedItems.value.indexOf(item, 0)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  }
}

const getTemplates = async () => {
  isLoading.value = true

  try {
    templatesList.value = await uploadTemplates(
      userState.userSetting.accountName,
    )
  } catch (error) {
    ErrorHandler.process(error)
  }

  isLoading.value = false
}

const removeTemplate = async (templateID: string) => {
  try {
    /* eslint-disable no-console */

    console.log('template id: ', templateID)
    await removeTemplateByID(templateID)
    await getTemplates()
  } catch (error) {
    ErrorHandler.process(error)
  }
}

getTemplates()
</script>

<style scoped lang="scss">
.all-templates-page {
  margin: 0 auto;
  width: 100%;
}

.all-templates-page__search-wrp {
  margin-top: toRem(24);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: toRem(20);
  margin-bottom: toRem(50);
}

.all-templates-page__search {
  max-width: toRem(458);
  width: 100%;
  max-height: toRem(50);
  height: 100%;
}

.all-templates-page__btns-wrp {
  max-width: toRem(300);
  width: 100%;

  @include respond-to(large) {
    max-width: toRem(250);
  }

  @include respond-to(xmedium) {
    max-width: toRem(200);
  }
}

.all-templates-page__btns {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.all-templates-page__btn {
  height: toRem(52);
  width: toRem(120);
  margin-left: toRem(5);
  border-radius: toRem(8);

  @include respond-to(large) {
    width: toRem(80);
    height: toRem(45);
  }

  @include respond-to(xmedium) {
    width: toRem(60);
    height: toRem(40);
  }
}

.all-templates-page__list-titles {
  display: grid;
  grid-template-columns: 1fr 2fr 4fr 1fr 3fr;
  margin-left: toRem(25);
  gap: toRem(50);
  justify-content: space-between;
  margin-top: toRem(20);
  width: 100%;
}

.all-templates-page__filters {
  display: flex;
  max-width: toRem(260);
  width: 100%;
  margin-left: toRem(10);
  justify-content: space-between;
}

.all-templates-page__no-data-message {
  margin-top: toRem(100);
}

.all-templates-page__list-title {
  text-align: center;
}

.all-templates-page__list-title--start {
  grid-column-start: 2;
}

.all-templates-page__template-item {
  margin-top: toRem(35);
  padding-bottom: toRem(10);
}
</style>
