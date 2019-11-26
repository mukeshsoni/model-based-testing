import React from "react";
import "./App.css";
import Datepicker from "@planview/pv-uikit/lib/datepicker";

function App() {
  return (
    <div className="App">
      <div style={{ display: "flex" }}>
        <div style={{ width: 160 }}>
          <Datepicker />
        </div>
        <button aria-label="outside element">outside</button>
      </div>
    </div>
  );
}

export default App;
