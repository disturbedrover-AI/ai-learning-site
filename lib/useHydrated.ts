import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * False while React is matching this component to the server's HTML ("hydrating"),
 * true afterwards (and straight away for anything rendered later in the browser).
 *
 * Use it to show the same thing the server showed until hydration is done, for
 * values only the browser knows (who's signed in, saved progress). Parts of a page
 * inside <Suspense> can hydrate after those values have already loaded; without
 * this they'd render differently from the server and React would report an error.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
