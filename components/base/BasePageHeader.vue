<script setup lang="ts">
import { computed } from 'vue'
import { menuItems } from '~/config/navigation'

const props = defineProps<{
  title?: string
  subtitle?: string
}>()

const route = useRoute()

// Auto-resolve title dynamically from route or menuItems config if title prop is omitted
const displayTitle = computed(() => {
  if (props.title) return props.title
  if (route.meta?.title) return String(route.meta.title)

  const currentPath = route.path.replace(/\/$/, '')

  for (const item of menuItems) {
    if (item.path && item.path.replace(/\/$/, '') === currentPath) {
      return item.pageTitle || item.label
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.path && child.path.replace(/\/$/, '') === currentPath) {
          return child.pageTitle || child.label
        }
        if (child.children) {
          for (const leaf of child.children) {
            if (leaf.path && leaf.path.replace(/\/$/, '') === currentPath) {
              return leaf.pageTitle || leaf.label
            }
          }
        }
      }
    }
  }

  // Fallback: capitalize last URL segment (e.g. /home/master/user -> User)
  const segments = currentPath.split('/').filter(Boolean)
  const lastSeg = segments[segments.length - 1] || 'Dashboard'
  return lastSeg.charAt(0).toUpperCase() + lastSeg.slice(1)
})
</script>

<template>
  <div
    class="shrink-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-150"
  >
    <div>
      <h1 class="text-xl font-bold text-[#4D5E80] tracking-tight leading-snug">
        {{ displayTitle }}
      </h1>
      <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-3 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
