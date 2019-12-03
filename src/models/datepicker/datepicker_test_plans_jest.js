import { fireEvent } from "@testing-library/react";
import { Machine } from "xstate";
import { createModel } from "@xstate/test";

import { machineConfig, options } from "./datepicker_machine";
import { withStateValidators } from "../utils/glue";

const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const events = {
  FOCUS: ({ container }) => {
    fireEvent.focus(container.querySelector("input"));
  },
  BLUR: ({ container }) =>
    fireEvent.keyDown(container, {
      key: "Escape",
      keyCode: 27
    }),
  CHANGE_INPUT_DATE: {
    exec: ({ container }, event) => {
      const input = container.querySelector("input");
      fireEvent.change(input, { target: { value: event.text } });
    },
    cases: [{ text: "1991-01-05" }, { text: "Invalid" }]
  },
  ENTER_KEY: ({ container }) =>
    fireEvent.keyDown(container.querySelector("input"), {
      key: "Enter",
      keyCode: 13
    }),
  CLICK_DATE: ({ getByText }, event) => {
    const randomDate = randomNumber(10, 20);
    fireEvent.click(getByText(`${randomDate}`));
  },
  CHANGE_CALENDAR_DATE: ({ getByLabelText }) => {
    const labels = [
      "previous month",
      "next month",
      "previous year",
      "next year",
      "Go to today"
    ];
    const randomLabel = labels[randomNumber(0, labels.length - 1)];
    fireEvent.click(getByLabelText(randomLabel));
  }
};

const stateValidators = {
  blurred: ({ container, queryAllByLabelText, getByValue }, { context }) => {
    expect(container.querySelector("input")).toBeDefined();
    expect(queryAllByLabelText("previous month")).toHaveLength(0);
  },
  focussed: ({ container, queryAllByLabelText }) => {
    expect(queryAllByLabelText("previous month")).toHaveLength(1);
  },
  "focussed.valid": ({ container }) => {
    expect(container.querySelector("[aria-invalid=false]")).toBeDefined();
  },
  "focussed.invalid": ({ container }) => {
    expect(container.querySelector("[aria-invalid=true]")).toBeDefined();
  }
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
