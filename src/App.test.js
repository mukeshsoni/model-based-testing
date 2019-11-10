import React from "react";
import ReactDOM from "react-dom";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { Machine, assign } from "xstate";
import { createModel } from "@xstate/test";

import { machineConfig } from "./autocomplete_machine";
import { withStateValidators, requiredStateValidators } from "./glue";

import { getSuggestions } from "./Autocomplete";

import Autocomplete from "./Autocomplete";
import App from "./App";
import top100Films from "./top_films";

function matches(ctx) {
  return getSuggestions(ctx.text).length !== 0;
}

function doesNotMatch(ctx) {
  return !matches(ctx);
}

function shouldHideList(ctx) {
  return !ctx.text || ctx.text.length === 0;
}

const events = {
  FOCUS: ({ container }) => fireEvent.focus(container.querySelector("input")),
  BLUR: ({ container }) => fireEvent.blur(container.querySelector("input")),
  CHANGE_TEXT: {
    exec: ({ container }, event) => {
      const input = container.querySelector("input");
      fireEvent.change(input, { target: { value: event.text } });
    },
    cases: [{ text: "a" }, { text: "b" }]
  },
  ARROW_KEY: ({ container }) =>
    fireEvent.keyDown(container.querySelector("input"), {
      key: "ArrowDown",
      keyCode: 40,
      charCode: 40
    }),
  ENTER_KEY: ({ container }) =>
    fireEvent.keyDown(container.querySelector("input"), {
      key: "Enter",
      keyCode: 13
    }),
  MOUSE_CLICK_ITEM: ({ getAllByRole }) => {
    const items = getAllByRole("option");
    const randomItemIndex = Math.floor(Math.random() * items.length);
    const randomSuggestedItem = items[randomItemIndex];

    fireEvent.click(randomSuggestedItem);
  },
  MOUSE_CLICK_OUTSIDE: ({ container }) =>
    // fireEvent.click(container.querySelectorAll("*:not(input)")[0])
    fireEvent.blur(container.querySelector("input"))
};

const stateValidators = {
  blur: ({ queryByRole, container }) => {
    expect(container.querySelector("input")).toBeDefined();
    expect(container.querySelectorAll("[role=option]")).toHaveLength(0);
  },
  focused: ({ container }) =>
    // this does not ensure that we are testing input focus
    expect(container.querySelector("input")).toBeDefined(),
  "focused.list_hidden": ({ queryByRole }) =>
    // the listbox is there but with zero elements
    expect(queryByRole("listbox").querySelectorAll("option")).toHaveLength(0),
  "focused.list.empty": ({ queryByRole }) =>
    // the listbox is there but with zero elements
    expect(queryByRole("listbox").querySelectorAll("option")).toHaveLength(0),
  "focused.list.non_empty": ({ container }) =>
    // the listbox is there but with zero elements
    expect(
      container.querySelectorAll("[role=option]").length
    ).toBeGreaterThanOrEqual(1),
  "focused.list.non_empty.not_selected": ({ container }) =>
    expect(
      container.querySelectorAll(".react-autosuggest__suggestion--highlighted")
    ).toHaveLength(0),
  "focused.list.non_empty.selected": ({ container }) =>
    expect(
      container.querySelectorAll(".react-autosuggest__suggestion--highlighted")
    ).toHaveLength(1)
};
const machineOptions = {
  guards: {
    shouldHideList,
    matches,
    doesNotMatch
  }
};
const autocompleteMachine = Machine(
  withStateValidators(stateValidators, machineConfig),
  machineOptions
);
const autocompleteModel = createModel(autocompleteMachine).withEvents(events);
const testPlans = autocompleteModel.getSimplePathPlans();

// in case one wants to find out all the state validators required
// by the machine
const statesWhichNeedValidators = requiredStateValidators(machineConfig);
console.log({ statesWhichNeedValidators });

testPlans.forEach(plan => {
  afterEach(cleanup);

  plan.paths.forEach(path => {
    it(path.description, async () => {
      const rendered = render(<Autocomplete />);

      await path.test(rendered);
    });
  });
});

