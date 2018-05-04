import "babel-polyfill";
import * as React from "react";
import * as ReactDOM from "react-dom";
import AppRouter from "../router/AppRouter";
import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(<AppRouter />, document.getElementById("app"));

registerServiceWorker();