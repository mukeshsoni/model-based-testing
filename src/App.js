import React from "react";
import logo from "./logo.svg";
import "./App.css";
import MyAutocomplete from "./Autocomplete";
import Datepicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

function App() {
  return (
    <div className="App">
      <MyAutocomplete />
      <div style={{ display: "flex" }}>
        <div style={{ width: 160 }}>
          <Datepicker placeholderText="YYYY-MM-DD" />
        </div>
        <button aria-label="outside element">outside</button>
      </div>
    </div>
  );
}

export default App;
