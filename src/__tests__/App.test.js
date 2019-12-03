import React from "react";
import { render, cleanup } from "@testing-library/react";

import Autocomplete from "../Autocomplete";
import testPlans from "../models/autocomplete/test_plans_jest";

testPlans.forEach(plan => {
  afterEach(cleanup);

  plan.paths.forEach(path => {
    it(path.description, async () => {
      const rendered = render(<Autocomplete />);

      await path.test(rendered);
    });
  });
});

