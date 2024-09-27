import { test } from '../drivers/playwright/driver';
import { Driver } from '../drivers/types';

test.skip('add item to list', async ({ driver }) => {
  const shoppingList = createShoppingList({ driver });
  await shoppingList.open();
  const newBeer = '2x4 DIPA Melvin';
  await shoppingList.expectItemNotOnList(newBeer);
  await shoppingList.addItem(newBeer);
  await shoppingList.expectItemOnList(newBeer);

  // await new Promise(resolve => setTimeout(resolve, 5000));
});

const createShoppingList = ({ driver }: { driver: Driver }) => ({
  open: async () => {
    await driver.goTo('/');
  },
  addItem: async (title: string) => {
    await driver.findByTestId('title').type(title);
    await driver.findByTestId('add-button').click();
  },
  expectItemOnList: async (item: string) => {
    await driver
      .findByText(item, { withinTestId: 'active items' })
      .shouldBeVisible();
  },
  expectItemNotOnList: async (item: string) => {
    await driver.queryByText(item).shouldNotExist();
  },
});
