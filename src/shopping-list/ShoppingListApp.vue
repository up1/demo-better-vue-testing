<script setup lang="ts">
import { computed, ref } from 'vue';

import {
  create,
  getList,
  Item,
  update,
} from './repositories/shopping-repository';

import ShoppingList from './ShoppingList.vue';

let items = ref<Item[]>([]);

(async () => {
  items.value = await getList();
})();

let itemsActive = computed(() =>
  items.value.filter((item) => item.state === `active`),
);

let itemNewTitle = ref(``);
let addItem = async () => {
  await create({ title: itemNewTitle.value, state: `active` });
  items.value = await getList();
  itemNewTitle.value = ``;
};

let removeItem = async (itemId: number) => {
  await update(itemId, { state: `inactive` });
  items.value = await getList();
};
</script>

<template>
  <div>
    <div class="space-y-8">
      <div class="space-y-4">
        <h2 class="text-2xl">Beers in Shopping list</h2>
        <ShoppingList
          :items="itemsActive"
          data-qa="active items"
          @remove="removeItem"
        />
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl">Add new beer</h2>
        <form @submit.prevent="addItem">
          <label for="title"> Beer name </label>
          <div class="flex gap-2">
            <input
              id="title"
              data-qa="title"
              v-model="itemNewTitle"
              name="title"
              class="flex-grow border border-teal-900 rounded p-2"
            />
            <button
              id="add-button"
              data-qa="add-button"
              class="add-button rounded px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              @click.prevent="addItem"
            >
              Add beer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
