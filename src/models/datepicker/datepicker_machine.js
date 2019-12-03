import { Machine, assign } from "xstate";

const isValidDate = date => !date || !isNaN(new Date(date).getTime());
// Guards
const isInputDateValid = ({ inputValue }) => isValidDate(inputValue);
const isInputDateInvalid = ({ inputValue }) => !isValidDate(inputValue);
// Actions
const invokeOnSelect = ({ selectedDate }) =>
  console.log(`Selected date is ${selectedDate}`);
// Options
export const options = {
  actions: {
    invokeOnSelect
  },
  guards: {
    isInputDateValid,
    isInputDateInvalid
  }
};

export const machineConfig = {
  id: "datepicker",
  initial: "blurred",
  context: {
    defaultValue: "1991-01-05",
    selectedDate: undefined,
    inputValue: undefined,
    calendarDate: undefined
  },
  states: {
    blurred: {
      on: {
        FOCUS: "focussed"
      }
    },
    focussed: {
      initial: "validate",
      on: {
        BLUR: "blurred",
        ENTER_KEY: {
          target: "blurred",
          actions: ["invokeOnSelect"]
        },
        CHANGE_INPUT_DATE: {
          target: "focussed.validate",
          actions: [assign({ inputValue: (ctx, e) => e.text })]
        },
        CLICK_DATE: {
          target: "blurred",
          actions: [
            assign({
              selectedDate: (ctx, e) => e.date,
              inputValue: (ctx, e) => e.date
            }),
            "invokeOnSelect"
          ]
        },
        CHANGE_CALENDAR_DATE: {
          target: "",
          actions: [
            assign({
              calendarDate: (ctx, e) => e.date
            })
          ]
        }
      },
      states: {
        validate: {
          on: {
            "": [
              {
                cond: "isInputDateValid",
                target: "valid"
              },
              {
                cond: "isInputDateInvalid",
                target: "invalid"
              }
            ]
          }
        },
        valid: {
          entry: [
            assign({
              calendarDate: ctx => ctx.inputValue,
              selectedDate: ctx => ctx.inputValue
            })
          ]
        },
        invalid: {}
      },
      exit: [
        assign({
          inputValue: ctx => ctx.selectedDate
        })
      ]
    }
  },
  entry: [
    assign({
      inputValue: ctx => ctx.defaultValue,
      selectedDate: ctx => ctx.defaultValue
    })
  ]
};

export const machine = Machine(machineConfig, options);
