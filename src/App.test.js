import React from "react";
import ReactDOM from "react-dom";
import { render, fireEvent, cleanup } from "@testing-library/react";

import Autocomplete from "./Autocomplete";
import App from "./App";
import top100Films from "./top_films";
import autocompleteModel from "./autocomplete_machine";

const testPlans = autocompleteModel.getSimplePathPlans();

testPlans.forEach(plan => {
  afterEach(cleanup);

  plan.paths.forEach(path => {
    it(path.description, async () => {
      const rendered = render(<Autocomplete />);

      await path.test(rendered);
    });
  });
});

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
