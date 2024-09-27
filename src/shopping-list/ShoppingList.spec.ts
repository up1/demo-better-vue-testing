import { expect, test, render, screen, fireEvent } from "../__test__/utils";

import ShoppingList from "./ShoppingList.vue";

test(`it should emit an "remove" event when we click an item`, async () => {
  let { emitted } = render(ShoppingList, {
    props: {
      items: [
        { id: '1', title: `2x4 DIPA Melvin 9.9%`, state: `active` },
        { id: '2', title: `Muay Thai Kob Khun 6.2%`, state: `active` },
      ],
    },
  });

  const removeItem = screen.getByRole(`button`, {
    name: `2x4 DIPA Melvin 9.9%`,
  });
  await fireEvent.click(removeItem);

  const removeEvents = emitted().remove as unknown[][]; 
  expect(removeEvents[0][0]).toBe('1'); // id of removed item
});
