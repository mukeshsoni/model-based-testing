import React from "react";
import ReactDOM from "react-dom";
import {
  render,
  fireEvent,
  cleanup,
  wait,
  waitForElementToBeRemoved
} from "@testing-library/react";
import { Machine, assign } from "xstate";
import { createModel } from "@xstate/test";

import Autocomplete from "./Autocomplete";
import App from "./App";
import testPlans from "./test_plans_jest";

testPlans.forEach(plan => {
  afterEach(cleanup);

  plan.paths.forEach(path => {
    it(path.description, async () => {
      const rendered = render(<Autocomplete />);

      await path.test(rendered);
    });
  });
});

