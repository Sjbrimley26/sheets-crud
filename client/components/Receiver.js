import * as React from "react";
const { Component } = React;

class Receiver extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    fetch('/newPlan', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        COMPANY: "Uptown",
        CONTACT: "Spencer",
        JOB: "Mega Dome",
        PHONE: "480-410-0403",
        EMAIL: "sjbrimley26@live.com",
        ENTERED_BY: "Spencer"
      })
    });
  }

  render() {
    return (
      <div>
        Receive new plans!
      </div>
    );
  }
}

export default Receiver;