import * as React from "react";
const { Component } = React;
import { withRouter } from "react-router-dom";
import "../assets/styles/global.scss";
import "../assets/styles/receiver.scss";

const fields = new Map([
  ["Company", "company"],
  ["Contact", "contact"],
  ["Job Name", "job"],
  ["Phone # (required)", "phone"],
  ["Email Address", "email"],
  ["Plan Received By (required)", "entered_by"],
  ["Additional Notes", "notes"]
]);

class Receiver extends Component {
  constructor(props) {
    super(props);
    this.inputRefs = Array(7)
      .fill(0)
      .map(item => React.createRef());
    this.handleInputChange = this.handleInputChange.bind(this);
    this.appendData = this.appendData.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.state = {
      company: "",
      contact: "",
      job: "",
      phone: "",
      email: "",
      entered_by: "",
      notes: ""
    };
  }

  navTo(url) {
    return this.props.history.push(`${url}`);
  }

  appendData() {
    const {
      company,
      contact,
      job,
      phone,
      email,
      entered_by,
      notes
    } = this.state;

    if (!(company || contact) || !phone || !entered_by || phone.length < 10) {
      return alert("Please complete all required fields!");
    }

    const dataToAppend = {
      PHONE: phone,
      ENTERED_BY: entered_by
    };

    dataToAppend.COMPANY = company ? company : null;
    dataToAppend.CONTACT = contact ? contact : null;
    dataToAppend.JOB = job ? job : null;
    dataToAppend.EMAIL = email ? email : null;

    if (notes) {
      dataToAppend.NOTES = notes;
    }

    fetch("/api/newPlan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataToAppend)
    })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err =>
        alert("There was an error creating the new record!", err)
      )
      .finally(() => this.navTo.call(this, "/"));

    this.inputRefs.forEach(ref => (ref.current.value = ""));
    
  }

  handleInputChange(e) {
    const spaceIndex = e.target.className.indexOf(" ");
    const value = e.target.className.substring(0, spaceIndex);
    if (value !== "phone") {
      const returnObj = {};
      returnObj[value] = e.target.value;
      return this.setState(returnObj);
    } else {
      const numReg = /^[ \(\)\d-]+$/g;
      if (
        (numReg.test(e.target.value) || e.target.value === "") &&
        e.target.value.length < 17
      ) {
        return this.setState({
          phone: e.target.value
        });
      }
    }
  }

  handleEnter(e) {
    if (e.key === 'Enter') {
      this.appendData();
    }
  }

  render() {
    return (
      <div className="flex--column">
        <h1 className="block column">Receive a new plan</h1>
        <br />
        <div className="width80 blueBackground topBumper" />
        {[...fields].map((item, i) => {
          const [field, value] = item;
          return (
            <div key={i} className="column flex width80">
              <label className="column topAndBottomPadding">{field}</label>
              <div className="column--wide blueBackground flex">
                <input
                  ref={this.inputRefs[i]}
                  key={value}
                  onChange={this.handleInputChange}
                  onKeyPress={this.handleEnter}
                  value={this.state[value]}
                  type="text"
                  className={
                    value +
                    " column topAndBottomMargin leftAndRightMargin bigRightMargin planInput"
                  }
                />
              </div>
            </div>
          );
        })}
        <div className="column width80 blueBackground topAndBottomPadding">
          <button onClick={this.appendData} className="submitNewPlan">
            {" "}
            Submit!{" "}
          </button>
        </div>
        <div className="width80 blueBackground bottomBumper" />
      </div>
    );
  }
}

export default withRouter(Receiver);