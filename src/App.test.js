import React from "react";
import { render, cleanup } from "@testing-library/react";
import Datepicker from "@planview/pv-uikit/lib/datepicker";
import testPlans from "./datepicker_test_plans_jest";

jest.mock("popper.js", () => {
  const PopperJS = jest.requireActual("popper.js");

  return class {
    static placements = PopperJS.placements;

    constructor() {
      return {
        destroy: () => {},
        scheduleUpdate: () => {}
      };
    }
  };
});

testPlans.forEach(plan => {
  afterEach(cleanup);

  plan.paths.forEach(path => {
    it(path.description, async () => {
      const rendered = render(<Datepicker />);

      await path.test(rendered);
    });
  });
});
