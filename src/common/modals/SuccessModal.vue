<template>
  <modal
    :is-shown="isShown"
    :is-close-by-click-outside="false"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <div class="success-modal__pane">
      <div class="success-modal__payload">
        <icon class="success-modal__icon" :name="$icons.certificate" />
        <div>
          <h3>
            {{ title || $t('success-modal.title') }}
          </h3>
          <p class="success-modal__description">
            {{ description || $t('success-modal.description') }}
          </p>
        </div>
      </div>

      <p class="success-modal__tx">
        {{ transaction }}
      </p>
      <app-button
        class="success-modal__btn"
        color="success"
        :text="$t('success-modal.close-btn-text')"
        @click="closeModel"
      />
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { Icon, AppButton, Modal } from '@/common'
import { ROUTE_NAMES } from '@/enums'
import { useRouter } from '@/router'

const router = useRouter()

withDefaults(
  defineProps<{
    isShown: boolean
    description: string
    transaction: string
    title: string
  }>(),
  {
    title: '',
    description: '',
  },
)

const emit = defineEmits<{
  (event: 'update:is-shown', v: boolean): void
}>()

const closeModel = () => {
  emit('update:is-shown', false)
  router.push({ name: ROUTE_NAMES.main })
}
</script>

<style lang="scss" scoped>
.success-modal__pane {
  display: grid;
  background: var(--background-primary-main);
  padding: toRem(24);
  border-radius: toRem(8);
  max-width: toRem(720);
  max-height: toRem(256);
  width: 100%;
  height: 100%;

  @include respond-to(small) {
    padding: 3%;
  }
}

.success-modal__payload {
  display: flex;
}

.success-modal__description {
  color: var(--text-secondary-light);
}

.success-modal__icon {
  width: toRem(55);
  height: toRem(55);
  margin-right: toRem(20);
}

.success-modal__tx {
  background: var(--background-primary-dark);
  padding: toRem(20);
}

.success-modal__btn {
  margin: toRem(15) auto;
}
</style>
