import { Machine } from "xstate";
import { createModel } from "@xstate/test";

import { machineConfig, options } from "./datepicker_machine";
import { withStateValidators } from "./glue";

const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const events = {
  FOCUS: cy =>
    cy
      .get("input")
      .focus()
      .promisify(),
  BLUR: cy =>
    cy
      .get("body")
      .get(`button[aria-label='outside element']`)
      .click()
      .promisify(),
  CHANGE_INPUT_DATE: {
    exec: (cy, event) =>
      cy
        .get("input")
        .type(event.text)
        .promisify(),
    cases: [{ text: "1991-01-05" }, { text: "Invalid" }]
  },
  ENTER_KEY: cy =>
    cy
      .get("input")
      .type("{enter}")
      .promisify(),
  CLICK_DATE: cy => {
    //const randomDate = randomNumber(10, 20);
    const randomDate = 15;
    return cy
      .get("body")
      .contains(randomDate)
      .click()
      .promisify();
  },
  CHANGE_CALENDAR_DATE: cy => {
    const labels = [
      "previous month",
      "next month",
      "previous year",
      "next year",
      "Go to today"
    ];
    const randomLabel = labels[randomNumber(0, labels.length - 1)];
    return cy
      .get("body")
      .get(`button[aria-label='${randomLabel}']`)
      .click()
      .promisify();
  }
};

const stateValidators = {
  blurred: cy => {
    return cy
      .get("input")
      .should("not.have.focus")
      .get("button[aria-label='previous month']")
      .should("not.exist")
      .promisify();
  },
  focussed: cy =>
    cy
      .get("button[aria-label='previous month']")
      .should("exist")
      .promisify(),
  "focussed.valid": cy =>
    cy
      .get("input[aria-invalid=false]")
      .should("exist")
      .promisify(),
  "focussed.invalid": cy =>
    cy
      .get("input[aria-invalid=true]")
      .should("exist")
      .promisify()
};

const datepickerMachine = Machine(
  withStateValidators(stateValidators, machineConfig),
  options
);
const datepickerModel = createModel(datepickerMachine).withEvents(events);
const testPlans = datepickerModel.getSimplePathPlans();

// in case one wants to find out all the state validators required
// by the machine

export default testPlans;
