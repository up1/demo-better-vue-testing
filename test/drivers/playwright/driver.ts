import { expect, Locator, Page, test as itPlaywright } from '@playwright/test';

import type {
  Assertions,
  AssertionsNot,
  Driver,
  Interactions,
  ItCallback,
} from '../types';

type LocatorResolver = () => Locator;

function makeAssertions(elementResolver: LocatorResolver): Assertions {
  return {
    shouldHaveAttribute: async (attribute, value) => {
      await expect(elementResolver()).toHaveAttribute(attribute, value || /.*/);
    },
    shouldBeVisible: async () => {
      await expect(elementResolver()).toBeVisible();
    },
  };
}

function makeAssertionsNot(elementResolver: LocatorResolver): AssertionsNot {
  return {
    shouldNotBeVisible: async () => {
      await expect(elementResolver()).toBeHidden();
    },
    shouldNotExist: async () => {
      await expect(elementResolver()).not.toBeVisible();
    },
  };
}

function makeInteractions(elementResolver: LocatorResolver): Interactions {
  return {
    check: async () => {
      await elementResolver().check();
    },
    click: async () => {
      await elementResolver().click();
    },
    focus: async () => {
      await elementResolver().focus();
    },
    type: async (text) => {
      await elementResolver().fill(`${text}`);
    },
  };
}

function makeActions(
  elementResolver: LocatorResolver,
): Assertions & Interactions {
  return {
    ...makeAssertions(elementResolver),
    ...makeInteractions(elementResolver),
  };
}

const makeDriver = ({ page }: { page: Page }): Driver => ({
  async goTo(path) {
    await page.goto(`http://localhost:5173${path}`);
  },
  findByLabelText(text) {
    return makeActions(() => page.getByLabel(text));
  },
  findByRole(role, { name }) {
    return makeActions(() => page.getByRole(role, { name }));
  },
  findByText(text, { withinTestId = null } = {}) {
    return makeAssertions(() => {
      let screenLocal = withinTestId
        ? page.locator(`[data-qa="${withinTestId}"]`)
        : page;
      return screenLocal.getByText(text);
    });
  },
  findAllByText(text, { withinTestId = null } = {}) {
    return makeAssertions(() => {
      let screenLocal = withinTestId
        ? page.locator(`[data-qa="${withinTestId}"]`)
        : page;
      return screenLocal.getByText(text);
    });
  },
  findByTestId(testId) {
    return makeActions(() => page.locator(`[data-qa="${testId}"]`));
  },
  async prepare(precondition) {
    let localStorageFake = {
      data: {},
      setItem(key: string, value: unknown) {
        this.data[key] = value;
      },
      getItem(key: string) {
        return this.data[key];
      },
      length: 0,
      clear() {
        this.data = {};
      },
      key(index: number) {
        return Object.keys(this.data)[index] || null;
      },
      removeItem(key: string) {
        delete this.data[key];
      },
    };
    precondition({
      localStorage: localStorageFake,
      mockEndpoint: function (
        endpoint: string,
        options: {
          body:
            | { [x: string]: unknown; [x: number]: unknown }
            | (({ searchParams }: { searchParams: URLSearchParams }) => {
                [x: string]: unknown;
                [x: number]: unknown;
              });
          httpVerb: `get` | `post` | `patch` | `delete`;
          status: number;
        },
      ): void {
        throw new Error('Function not implemented.');
      },
    });

    await page.addInitScript((state) => {
      for (let [key, value] of Object.entries(state)) {
        window.localStorage.setItem(key, value as string);
      }
    }, localStorageFake.data);
  },
  queryByText(text, { withinTestId = null } = {}) {
    return makeAssertionsNot(() => {
      let screenLocal = withinTestId
        ? page.locator(`[data-qa="${withinTestId}"]`)
        : page;
      return screenLocal.getByText(text);
    });
  },
});

function wrapItCallback(func: ItCallback) {
  return ({ page }: { page: Page }) => {
    let driver = makeDriver({ page });
    return func({ driver });
  };
}

const test = (description: string, func: ItCallback) =>
  itPlaywright(description, wrapItCallback(func));
test.only = (description: string, func: ItCallback) =>
  itPlaywright.only(description, wrapItCallback(func));
test.skip = (description: string, func: ItCallback) =>
  itPlaywright.skip(description, wrapItCallback(func));

export { test };
