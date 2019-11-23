import { Machine, assign } from "xstate";
import { createModel } from "@xstate/test";

import { machineConfig } from "./autocomplete_machine";
import { withStateValidators, requiredStateValidators } from "./glue";

import { getSuggestions } from "./matchers";

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
  FOCUS: cy =>
    cy
      .get("input")
      .focus()
      .promisify(),
  BLUR: cy =>
    cy
      .get("input")
      .blur()
      .promisify(),
  CHANGE_TEXT: {
    exec: async (cy, event) => {
      await cy
        .get("input")
        .clear()
        .type(event.text)
        .promisify();
    },
    cases: [{ text: "a" }, { text: "b" }]
  },
  ARROW_KEY: cy =>
    cy
      .get("input")
      .type("{downarrow}")
      .promisify(),
  ENTER_KEY: cy =>
    cy
      .get("input")
      .type("{enter}")
      .promisify(),
  MOUSE_CLICK_ITEM: cy => {
    return cy
      .get("[role=option]")
      .then(items => {
        const randomItemIndex = Math.floor(Math.random() * items.length);
        const randomSuggestedItem = items[randomItemIndex];
        return randomSuggestedItem.click();
      })
      .promisify();
  },
  MOUSE_CLICK_OUTSIDE: cy =>
    cy
      .get("input")
      .blur()
      .promisify()
};

const stateValidators = {
  blur: async cy =>
    await cy
      .get("input")
      .should("not.have.focus")
      .promisify(),
  focused: cy =>
    cy
      .get("input")
      .should("have.focus")
      .promisify(),
  "focused.list_hidden": cy =>
    // the listbox is there but with zero elements
    cy
      .get("[role=listbox]")
      .get("[role=option]")
      .should("not.exist")
      .promisify(),
  "focused.list.empty": cy =>
    cy
      .get("[role=option]")
      .should("not.exist")
      .promisify(),
  "focused.list.non_empty": cy =>
    cy
      .get("[role=option]")
      .its("length")
      .should("be.gt", 0)
      .promisify(),
  "focused.list.non_empty.not_selected": cy =>
    cy
      .get(".react-autosuggest__suggestion--highlighted")
      .should("have.length", 0)
      .promisify(),
  "focused.list.non_empty.selected": cy =>
    cy
      .get(".react-autosuggest__suggestion--highlighted")
      .its("length")
      .should("be.gt", 0)
      .promisify()
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

export default testPlans;
