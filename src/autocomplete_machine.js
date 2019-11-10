import cloneDeep from "clone-deep";
import { Machine, assign } from "xstate";
import { createModel } from "@xstate/test";
import { fireEvent } from "@testing-library/react";
import { getSuggestions } from "./Autocomplete";

const nameList = ["Rithwik", "Mukesh"];

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

const machineObject = {
  id: "autocomplete",
  initial: "blur",
  context: {
    text: ""
  },
  states: {
    blur: {
      on: {
        FOCUS: "focused"
      }
    },
    focused: {
      initial: "match",
      on: {
        BLUR: "blur",
        MOUSE_CLICK_OUTSIDE: "blur",
        CHANGE_TEXT: {
          target: "focused.match",
          actions: [assign({ text: (ctx, e) => e.text })]
        }
      },
      states: {
        match: {
          on: {
            "": [
              {
                cond: shouldHideList,
                target: "list_hidden"
              },
              {
                cond: matches,
                target: "list.non_empty"
              },
              {
                cond: doesNotMatch,
                target: "list.empty"
              }
            ]
          }
        },
        list_hidden: {},
        list: {
          states: {
            empty: {},
            non_empty: {
              initial: "not_selected",
              on: {
                ARROW_KEY: "non_empty.selected",
                MOUSE_CLICK_ITEM: "#autocomplete.blur"
              },
              states: {
                not_selected: {},
                selected: {
                  on: {
                    ENTER_KEY: "#autocomplete.blur"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
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

function matches(ctx) {
  return getSuggestions(ctx.text).length !== 0;
}

function doesNotMatch(ctx) {
  return !matches(ctx);
}

function shouldHideList(ctx) {
  return !ctx.text || ctx.text.length === 0;
}

/*
 * This function helps extend the machine object with external object
 * which only has validation code for each state. This makes it easier
 * to use the common machine object with state validators for different
 * testing environments. E.g. cypress, regular jest, puppeteer etc.
 */
function withStateValidators(stateValidators, machine) {
  const machineCopy = cloneDeep(machine); // quick deep copy.

  Object.entries(stateValidators).forEach(([statePath, validator]) => {
    const pathParts = statePath.split(".");
    const newPathParts = pathParts.map(part => ["states", part]).flat();

    const stateProp = newPathParts.reduce((acc, pathPart) => {
      return acc[pathPart];
    }, machineCopy);

    stateProp.meta = stateProp.meta || {};

    stateProp.meta = {
      ...stateProp.meta,
      test: validator
    };
  });

  return machineCopy;
}

const autocompleteMachine = Machine(
  withStateValidators(stateValidators, machineObject)
);

const autocompleteModel = createModel(autocompleteMachine).withEvents(events);

export default autocompleteModel;

