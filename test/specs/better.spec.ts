import { test } from "../drivers/playwright/driver";

test.skip("add item to list", async ({ driver }) => {
  await driver.goTo("/");
  await driver.findByTestId("title").type("2x4 DIPA Melvin");
  await driver.findByTestId("add-button").click();
  await driver
    .findByText("2x4 DIPA Melvin", { withinTestId: "active items" })
    .shouldBeVisible();
});
