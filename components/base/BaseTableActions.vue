<script setup lang="ts">
withDefaults(
  defineProps<{
    resource?: string
    showView?: boolean
    showEdit?: boolean
    showDelete?: boolean
    viewTitle?: string
    editTitle?: string
    deleteTitle?: string
    disabledEdit?: boolean
    disabledDelete?: boolean
  }>(),
  {
    resource: '',
    showView: true,
    showEdit: true,
    showDelete: true,
    viewTitle: '',
    editTitle: '',
    deleteTitle: '',
    disabledEdit: false,
    disabledDelete: false,
  }
)

defineEmits<{
  view: []
  edit: []
  delete: []
}>()
</script>

<template>
  <div class="flex items-center gap-1.5">
    <BaseActionButton
      v-if="showView"
      type="view"
      :title="viewTitle"
      @click="$emit('view')"
    />
    <BaseActionButton
      v-if="showEdit"
      type="edit"
      :resource="resource"
      :title="editTitle"
      :disabled="disabledEdit"
      @click="$emit('edit')"
    />
    <BaseActionButton
      v-if="showDelete"
      type="delete"
      :resource="resource"
      :title="deleteTitle"
      :disabled="disabledDelete"
      @click="$emit('delete')"
    />
    <slot name="extra" />
  </div>
</template>
