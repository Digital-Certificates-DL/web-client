<template>
  <div class="certificate">
    <checkbox-field
      v-show="isShow"
      :model-value="isSelected"
      @click="selectItem"
    />
    <div class="certificate__body">
      <div class="certificate__info">
        <div class="certificate__img-wrp" @click="selectItem">
          <img
            v-if="props.user.signature !== ''"
            class="certificate__img"
            :src="props.user.img || '/branding/template.jpg'"
            alt="certificate"
          />
          <div v-else class="certificate__img"></div>
          <p class="certificate__name">
            {{ props.user.participant }}
          </p>
        </div>
        <div class="certificate__titles">
          <p>
            {{ props.user.courseTitle }}
          </p>
          <p>
            {{ props.user.date }}
          </p>
        </div>
      </div>

      <div class="certificate__btns" v-if="user.signature !== ''">
        <app-button
          class="certificate__btn"
          :text="$t('certificate.mint-text')"
          @click="emit('open-modal', props.user)"
        />
        <app-button
          class="certificate__btn"
          :text="$t('certificate.timestamp-btn')"
          @click="selectItem"
        />

        <app-button
          class="certificate__btn certificate__btn-download"
          icon-left="download"
          @click="downloadFile"
        />
      </div>
      <div v-else class="certificate__btns">
        <app-button
          class="certificate__btn"
          :text="$t('certificate.generate-btn')"
          @click="selectItem"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppButton } from '@/common'
import { CertificateJSONResponse } from '@/types'
import { CheckboxField } from '@/fields'

import { ref } from 'vue'

const isSelected = ref(false)

const emit = defineEmits<{
  (e: 'open-modal', user: CertificateJSONResponse): boolean
  (e: 'select', state: boolean, user: CertificateJSONResponse): boolean
}>()

const props = defineProps<{
  isShow: boolean
  user: CertificateJSONResponse
}>()

const selectItem = () => {
  isSelected.value = !isSelected.value
  emit('select', isSelected.value, props.user)
}

const downloadFile = () => {
  window.open(props.user.certificate, '_blank')
}
</script>

<style lang="scss" scoped>
.certificate {
  display: flex;
  align-items: center;
  margin-top: toRem(35);
  padding-bottom: toRem(10);
  border-bottom: var(--border-primary-main) toRem(1) solid;
  max-width: var(--page-large);

  @include respond-to(large) {
    width: var(--page-xmedium);
  }

  @include respond-to(xmedium) {
    width: var(--page-medium);
  }
}

.certificate__body {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.certificate__img-wrp {
  display: flex;
  align-items: center;
}

.certificate__info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: toRem(950);

  @include respond-to(large) {
    width: toRem(800);
  }

  @include respond-to(xmedium) {
    width: toRem(650);
  }
}

.certificate__img {
  width: toRem(74);
  border-radius: toRem(4);
  margin-right: toRem(10);

  @include respond-to(xmedium) {
    width: toRem(54);
  }

  @include respond-to(medium) {
    width: toRem(50);
  }

  @include respond-to(large) {
    width: toRem(64);
  }
}

.certificate__titles {
  display: flex;
  justify-content: space-between;
  width: 60%;
}

.certificate__name {
  width: toRem(150);
}

.certificate__btn {
  height: toRem(50);
}

.certificate__btn-download {
  width: toRem(50);
  margin-left: toRem(20);
  font-size: toRem(20);
}

.certificate__btns {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 20%;
}
</style>
