<template>
  <div class="certificates-filters">
    <!-- todo move to  external  component-->

    <app-dropdown
      class="certificates-filters__dropdown"
      :title="COURSE_FILTERS.ALL"
      :items="DROP_DOWN_COURSE_LIST"
      @select-item="findByCourse"
    />
    <app-dropdown
      class="certificates-filters__dropdown"
      :title="DATA_FILTERS.ALL"
      :items="DROP_DOWN_DATA_LIST"
      :main-image="'/branding/data-ico.png'"
    />
    <app-dropdown
      class="certificates-filters__dropdown"
      :title="STATE_FILTERS.ALL"
      :items="DROP_DOWN_STATE_LIST"
      :main-image="'/branding/success-ico.png'"
      @select-item="findByState"
    />
  </div>
</template>
<script setup lang="ts">
import { COURSE_FILTERS, DATA_FILTERS, STATE_FILTERS } from '@/enums'
import { AppDropdown } from '@/common'
import { CertificateJSONResponse, DropdownItem } from '@/types'
import { ref } from 'vue'

const certificatesList = ref<CertificateJSONResponse[]>([])

const props = defineProps<{
  list: CertificateJSONResponse[]
}>()

const emit = defineEmits<{
  (event: 'filer', list: CertificateJSONResponse[]): void
}>()

//todo make using computed

const findByCourse = (filter: DropdownItem): void => {
  const state = filter.text
  certificatesList.value = props.list
  /* eslint-disable no-console */
  console.log('certificatesList.value ', certificatesList.value)
  if (!state.length || state === COURSE_FILTERS.ALL) {
    certificatesList.value = props.list
    emit('filer', certificatesList.value)
    return
  }

  const searchQuery = state.toLowerCase()
  /* eslint-disable no-console */
  console.log('searchQuery ', searchQuery)
  certificatesList.value = certificatesList.value.filter(user => {
    /* eslint-disable no-console */
    console.log('shortCourse', user.shortCourse)
    return user.shortCourse.toLowerCase().includes(searchQuery)
  })

  /* eslint-disable no-console */
  console.log('final ', certificatesList.value)
  emit('filer', certificatesList.value)
}

const findByState = (filter: DropdownItem): void => {
  const state = filter.text

  certificatesList.value = certificatesList.value || props.list
  if (!state.length || state === STATE_FILTERS.ALL) {
    certificatesList.value = props.list

    emit('filer', certificatesList.value)
    return
  }

  if (state === STATE_FILTERS.GENERATED) {
    certificatesList.value = certificatesList.value.filter(certificate => {
      return certificate.certificate || certificate.digitalCertificate
    })

    emit('filer', certificatesList.value)
    return
  } else if (state === STATE_FILTERS.NOTGENERATED) {
    certificatesList.value = certificatesList.value.filter(certificate => {
      return !certificate.signature!.length
    })

    emit('filer', certificatesList.value)
    return
  }
}

const DROP_DOWN_COURSE_LIST = [
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.ALL,
  },
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.SOLIDITY,
  },
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.GOLANG,
  },
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.DATABASE,
  },
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.DEFI,
  },
] as DropdownItem[]

const DROP_DOWN_DATA_LIST = [
  {
    text: DATA_FILTERS.ALL,
  },
  {
    text: DATA_FILTERS.DAY,
  },
  {
    text: DATA_FILTERS.WEEK,
  },
  {
    text: DATA_FILTERS.MONTH,
  },
] as DropdownItem[]

const DROP_DOWN_STATE_LIST = [
  {
    text: STATE_FILTERS.ALL,
  },
  {
    text: STATE_FILTERS.GENERATED,
  },
  {
    text: STATE_FILTERS.NOTGENERATED,
  },
] as DropdownItem[]
</script>

<style scoped lang="scss">
.certificates-filters {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}
</style>
