import { expect, it as itVitest } from 'vitest';
import {
  configure,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/dom';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import type { UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';

import type {
  Assertions,
  AssertionsNot,
  Driver,
  Interactions,
  MockEndpoint,
  ItCallback,
} from '../types';
import { mount } from '../../../src/mount';
import { makeRouter } from '../../../src/router';

configure({ testIdAttribute: `data-qa` });

type ElementResolver = () => Promise<HTMLElement | HTMLElement[]>;

function toArray<Type>(maybeArray: Type | Type[]) {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

function makeAssertions(elementResolver: ElementResolver): Assertions {
  return {
    shouldBeVisible: async () => {
      expect(await elementResolver()).toBeTruthy();
    },
    shouldHaveAttribute: async (attribute, value) => {
      let elements = toArray<HTMLElement>(await elementResolver());

      // eslint-disable-next-line no-restricted-syntax
      for (let element of elements) {
        if (value) {
          expect(element.getAttribute(attribute)).toMatch(value);
        } else {
          expect(element.getAttribute(attribute)).toBeTruthy();
        }
      }
    },
  };
}

function makeAssertionsNot(
  elementResolver: () => Promise<HTMLElement | null>,
): AssertionsNot {
  return {
    shouldNotBeVisible: async () => {
      expect(await elementResolver()).toBeFalsy();
    },
    shouldNotExist: async () => {
      let element = await elementResolver();
      if (element) {
        try {
          await waitForElementToBeRemoved(element);
        } catch (error) {
          throw new Error(`Expected element to not exist but it still exists!`);
        }
      }
    },
  };
}

function makeInteractions(
  elementResolver: ElementResolver,
  { user }: { user: UserEvent },
): Interactions {
  return {
    check: async () => {
      let elements = toArray<HTMLElement>(await elementResolver());
      for (let element of elements) {
        await user.click(element);
      }
    },
    click: async () => {
      let elements = toArray<HTMLElement>(await elementResolver());
      for (let element of elements) {
        await user.click(element);
      }
    },
    focus: async () => {
      let elements = toArray<HTMLElement>(await elementResolver());
      for (let element of elements) {
        element.focus();
      }
    },
    type: async (text) => {
      let elements = toArray<HTMLElement>(await elementResolver());
      for (let element of elements) {
        await user.type(element, text);
      }
    },
  };
}

function makeActions(
  elementResolver: ElementResolver,
  { user }: { user: UserEvent },
): Assertions & Interactions {
  return {
    ...makeAssertions(elementResolver),
    ...makeInteractions(elementResolver, { user }),
  };
}

export const mockServer = setupServer();

type MockHandle = {
  endpoint: string;
  options: {
    httpVerb: string;
    status: number;
  };
  hasBeenInvoked: boolean;
};

const makeMockEndpoint =
  ({ mockHandles }: { mockHandles: Set<MockHandle> }): MockEndpoint =>
  (endpoint, { body: bodyOrGetBody, httpVerb = `get`, status = 200 }) => {
    let getBody =
      typeof bodyOrGetBody === `function` ? bodyOrGetBody : () => bodyOrGetBody;
    let handle = {
      endpoint,
      options: {
        httpVerb,
        status,
      },
      hasBeenInvoked: false,
    };
    mockHandles.add(handle);
    mockServer.use(
      http[httpVerb](endpoint, (req, res, ctx) => {
        handle.hasBeenInvoked = true;
        return res(
          ctx.status(status),
          ctx.json(getBody({ searchParams: req.url.searchParams })),
        );
      }),
    );
  };

const makeDriver = ({
  mockHandles,
  user,
}: {
  mockHandles: Set<MockHandle>;
  user: UserEvent;
}): Driver => ({
  async goTo(path) {
    let router = makeRouter();
    try {
      await router.push(path);
    } catch (error) {
      // Ignore redirection error.
      if (
        error instanceof Error &&
        error.message.includes(`Redirected when going from`)
      ) {
        return;
      }

      throw error;
    }

    document.body.innerHTML = `<div id="app"></div>`;
    mount({ router });
  },
  findByLabelText(text) {
    return makeActions(() => screen.findByLabelText(text), { user });
  },
  findByRole(role, { name }) {
    return makeActions(async () => screen.findByRole(role, { name }), { user });
  },
  findByText(text, { withinTestId = null } = {}) {
    return makeAssertions(async () => {
      let screenLocal = withinTestId
        ? within(await screen.findByTestId(withinTestId))
        : screen;
      return screenLocal.findByText(text);
    });
  },
  findAllByText(text, { withinTestId = null } = {}) {
    return makeAssertions(async () => {
      let screenLocal = withinTestId
        ? within(await screen.findByTestId(withinTestId))
        : screen;
      return screenLocal.findAllByText(text);
    });
  },
  findByTestId(testId) {
    return makeActions(() => screen.findByTestId(testId), { user });
  },
  async prepare(precondition) {
    precondition({
      localStorage,
      mockEndpoint: makeMockEndpoint({ mockHandles }),
    });
  },
  queryByText(text, { withinTestId = null } = {}) {
    return makeAssertionsNot(async () => {
      let screenLocal = withinTestId
        ? within(await screen.findByTestId(withinTestId))
        : screen;
      return screenLocal.queryByText(text);
    });
  },
});

function wrapItCallback(func: ItCallback) {
  return async () => {
    let context: {
      mockHandles: Set<MockHandle>;
      user: UserEvent;
    } = {
      mockHandles: new Set(),
      user: userEvent.setup(),
    };
    let driver = makeDriver(context);
    await func({ driver });

    context.mockHandles.forEach((handle) => {
      if (handle.hasBeenInvoked) return;
      throw new Error(
        `You mocked an endpoint that you did not use in the test! ${JSON.stringify(
          handle,
        )}`,
      );
    });
  };
}

const test = (description: string, func: ItCallback) =>
  itVitest(description, wrapItCallback(func));
test.only = (description: string, func: ItCallback) =>
  itVitest.only(description, wrapItCallback(func));
test.skip = (description: string, func: ItCallback) =>
  itVitest.skip(description, wrapItCallback(func));

export { test };
