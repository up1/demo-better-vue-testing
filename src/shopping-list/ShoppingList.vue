<script setup lang="ts">

import { Item } from './repositories/shopping-repository';

const props = defineProps<{
  items: Item[];
}>();
</script>

<template>
  <ul class="space-y-2" data-testid="results">
    <li v-for="item in props.items" :key="item.id" class="item">
      <button
        class="rounded px-4 py-3 bg-teal-600 text-white text-left w-full transition-colors"
        @click="$emit('remove', item.id)"
      >
        {{ item.title }}
      </button>
    </li>
  </ul>
</template>
