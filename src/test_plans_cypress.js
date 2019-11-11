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
  FOCUS: cy => cy.get("input").focus(),
  BLUR: cy => cy.get("input").blur(),
  CHANGE_TEXT: {
    exec: (cy, event) => {
      return cy
        .get("input")
        .clear()
        .type(event.text);
    },
    cases: [{ text: "a" }, { text: "b" }]
  },
  ARROW_KEY: cy => cy.get("input").type("{downarrow}"),
  ENTER_KEY: cy => cy.get("input").type("{enter}"),
  MOUSE_CLICK_ITEM: cy => {
    return cy.get("[role=option]").then(items => {
      const randomItemIndex = Math.floor(Math.random() * items.length);
      const randomSuggestedItem = items[randomItemIndex];
      return randomSuggestedItem.click();
    });
  },
  MOUSE_CLICK_OUTSIDE: cy => cy.get("input").blur()
};

const stateValidators = {
  blur: cy => {
    return cy.get("input").should("have.blur");
  },
  focused: cy => cy.get("input").should("have.focus"),
  "focused.list_hidden": cy =>
    // the listbox is there but with zero elements
    cy
      .get("[role=listbox]")
      .get("[role=option]")
      .should("not.exist"),
  "focused.list.empty": cy => cy.get("[role=option]").should("not.exist"),
  "focused.list.non_empty": cy =>
    cy
      .get("[role=option]")
      .its("length")
      .should("be.gt", 0),
  "focused.list.non_empty.not_selected": cy =>
    cy
      .get(".react-autosuggest__suggestion--highlighted")
      .should("have.length", 0),
  "focused.list.non_empty.selected": cy =>
    cy
      .get(".react-autosuggest__suggestion--highlighted")
      .its("length")
      .should("be.gt", 0)
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
