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

const camel_case_ify = (string) => {
  return string.replace(/\s/g, "_");
}

class Receiver extends Component {
  constructor(props) {
    super(props);
    this.inputRefs = Array(7)
      .fill(0)
      .map(item => React.createRef());
    this.handleInputChange = this.handleInputChange.bind(this);
    this.appendData = this.appendData.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.state = {
      company: "",
      contact: "",
      job: "",
      phone: "",
      email: "",
      entered_by: "",
      notes: "",
      file: null,
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

    if (this.state.file) {

      let fileData = new FormData();
      let fileTitle = "";
      if (company) {
        fileTitle += camel_case_ify(company) + "_";
      }
      if (contact) {
        fileTitle += `(${camel_case_ify(contact)})_`;
      }
      if (job) {
        fileTitle += `${camel_case_ify(job)}_`
      }
      fileTitle += "Plans_";
      const date = new Date();
      const dateString = date.getMonth() + 1 + "." + date.getDate() + "." + date.getFullYear();
      fileTitle += dateString
      fileData.append("file", this.state.file);
      fileData.append("title", fileTitle);

      fetch("/api/uploadPlan", {
        method: "POST",
        body: fileData
      })
        .then(res => res.json())
        .then(json => {
          const { title } = json;
          if (!title) {
            throw ("No title returned from server!");
          }
          const dataToAppend = {
            PHONE: phone,
            ENTERED_BY: entered_by,
            Plans_Uploaded: title
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
            .then(() => this.navTo.call(this, "/"))
            .catch(err =>
              alert("There was an error creating the new record!", err)
            );
            
        })
        .catch(err => alert("There was an error creating the record", err));
        

    } else { // No File

      const dataToAppend = {
        PHONE: phone,
        ENTERED_BY: entered_by
      };
  
      dataToAppend.COMPANY = company ? company : null;
      dataToAppend.CONTACT = contact ? contact : null;
      dataToAppend.JOB = job ? job : null;
      dataToAppend.EMAIL = email ? email : null;
  
      if (notes) { // This one is separate because the servver handles it differently
                  //  if the req.body has a NOTES property
        dataToAppend.NOTES = notes;
      }

      fetch("/api/newPlan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataToAppend)
      })
        .catch(err =>
          alert("There was an error creating the new record!", err)
        )
        .finally(() => this.navTo.call(this, "/"));
    
    }

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

  handleFileUpload(e) {
    const file = e.target.files[0];
    return this.setState({ file: file });
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
            <div key={i} className="column wrap flex width80">
              <label className="column topAndBottomPadding">{field}</label>
              <div className="column--wide blueBackground flex">
                {
                  field === "Additional Notes"
                    ? (
                      < textarea
                      ref = {
                        this.inputRefs[i]
                      }
                      key = {
                        value
                      }
                      onChange = {
                        this.handleInputChange
                      }
                      value = {
                        this.state[value]
                      }
                      type = "text"
                      className = {
                        value +
                        " column topAndBottomMargin leftAndRightMargin bigRightMargin planInput tall"
                      }
                      />
                    )
                    : (
                    < input
                    ref = {
                      this.inputRefs[i]
                    }
                    key = {
                      value
                    }
                    onChange = {
                      this.handleInputChange
                    }
                    onKeyPress = {
                      this.handleEnter
                    }
                    value = {
                      this.state[value]
                    }
                    type = "text"
                    className = {
                      value +
                      " column topAndBottomMargin leftAndRightMargin bigRightMargin planInput"
                    }
                    />
                    )
                }
              </div>
            </div>
          );
        })}
        <div className="column wrap flex width80">
          <label className="column topAndBottomPadding">Attach Plan</label>
          <div className="column--wide flex blueBackground">
            <input type="file" className="autoMargin fileInput" onChange={this.handleFileUpload} />
          </div>
        </div>
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