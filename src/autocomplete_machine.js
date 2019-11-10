import { Machine, assign } from "xstate";

export const machineConfig = {
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
                cond: "shouldHideList",
                target: "list_hidden"
              },
              {
                cond: "matches",
                target: "list.non_empty"
              },
              {
                cond: "doesNotMatch",
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

