import React from "react";
import "./App.css";
import Datepicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

function App() {
  return (
    <div className="App">
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
