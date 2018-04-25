import React, { Component } from "react";
import "../assets/styles/global.scss";

const sortOptions = [
  "ALL",
  "TAKEOFF_INCOMPLETE",
  "QUOTE_INCOMPLETE",
  "ALL_BY_RECEIVED",
  "CUSTOMER",
  "COMPANY"
];

const prettifyProp = name => {
  name = name.substring(0,1) + name.substring(1).toLowerCase();
  let i = name.indexOf("_");
  while (i >= 0) {
    name = name.substring(0, i+1) 
         + name.substring(i+1, i+2).toUpperCase() 
         + name.substring(i+2);

    i = name.indexOf("_", i + 1);
  }
  return name.replace(/_/g, " ");
};

const handleJSONResponse = json => {
  if (json.err) {
    return Promise.reject("Error fetching data", json.err);
  } else {
    return Promise.resolve(json);
  }
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingResults: true,
      searchResults: [],
    }
  }

  componentDidMount() {
    fetch("/DB", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: [],
        sortOption: [sortOptions[1]]
      })
    })
    .then(res => res.json())
    .then(json => handleJSONResponse(json))
    .then(data => this.setState({searchResults: data, loadingResults: false}))
    .catch(err => alert("There was an error fetching the data!", err));
  }

  render() {
    console.table(this.state.searchResults);
    return (
      <div>
        <h1>Welcome!</h1>
        <h2>Showing plans without take-offs</h2>
        { this.state.loadingResults ? <div className="loader">Loading...</div> : null }
        {
          this.state.searchResults.length > 0
          ? this.state.searchResults.map((result, i) => {
            return (
              <div className="resultDiv" key={i}>
                {Object.entries(result).map((pair, j) => {
                  let [ prop, val ] = pair;
                  return <div className="flex" key={j}>
                      <div className="column">
                        {prettifyProp(prop)} :
                      </div>
                      <div className="column--wide">{val}</div>
                    </div>;
                })}
                <br/>
              </div>
            )
          })
          : null
        }
      </div>
    );
  }
}

export default Home;
