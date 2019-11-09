import { Machine, assign } from "xstate";
import { createModel } from "@xstate/test";
import { fireEvent } from "@testing-library/react";
import { getSuggestions } from "./Autocomplete";

const nameList = ["Rithwik", "Mukesh"];

console.log({ Machine });
function matches(ctx) {
  return getSuggestions(ctx.text).length !== 0;
}

function doesNotMatch(ctx) {
  return !matches(ctx);
}

function shouldHideList(ctx) {
  return !ctx.text || ctx.text.length === 0;
}

const autocompleteMachine = Machine({
  id: "autocomplete",
  initial: "blur",
  context: {
    text: ""
  },
  states: {
    blur: {
      on: {
        FOCUS: "focused"
      },
      meta: {
        test: ({ container }) =>
          expect(container.querySelector("input")).toBeDefined()
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
      meta: {
        test: ({ container }) =>
          expect(container.querySelector("input")).toBeDefined()
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
        list_hidden: {
          meta: {
            test: ({ queryByRole }) =>
              // the listbox is there but with zero elements
              expect(
                queryByRole("listbox").querySelectorAll("option")
              ).toHaveLength(0)
          }
        },
        list: {
          states: {
            empty: {
              meta: {
                test: ({ queryByRole }) =>
                  // the listbox is there but with zero elements
                  expect(
                    queryByRole("listbox").querySelectorAll("option")
                  ).toHaveLength(0)
              }
            },
            non_empty: {
              initial: "not_selected",
              on: {
                ARROW_KEY: "non_empty.selected",
                MOUSE_CLICK_ITEM: "#autocomplete.blur"
              },
              meta: {
                test: ({ container }) => expect(1).toBe(1)
              },

              states: {
                not_selected: {
                  meta: {
                    test: ({ container }) =>
                      expect(
                        container.querySelectorAll(
                          ".react-autosuggest__suggestion--highlighted"
                        )
                      ).toHaveLength(0)
                  }
                },
                selected: {
                  meta: {
                    test: ({ container }) =>
                      expect(
                        container.querySelectorAll(
                          ".react-autosuggest__suggestion--highlighted"
                        )
                      ).toHaveLength(1)
                  },
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
});

const autocompleteModel = createModel(autocompleteMachine).withEvents({
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
    fireEvent.blur(container.querySelector("input"))
});

export default autocompleteModel;

