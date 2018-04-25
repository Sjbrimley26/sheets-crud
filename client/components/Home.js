import React, { Component } from "react";
import "../assets/styles/global.scss";

const sortOptions = [
  "TAKEOFF_INCOMPLETE",
  "QUOTE_INCOMPLETE",
  "ALL_BY_RECEIVED",
  "CUSTOMER",
  "COMPANY",
  "JOB"
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
    this.openSearchBar = this.openSearchBar.bind(this);
    this.state = {
      loadingResults: true,
      searchResults: [],
      searchType: "TAKEOFF_INCOMPLETE",
      searchBarOpen: false,
      selectedButton: "",
      activeButton: null,
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
        sortOption: [sortOptions[0]]
      })
    })
    .then(res => res.json())
    .then(json => handleJSONResponse(json))
    .then(data => this.setState({searchResults: data, loadingResults: false}))
    .catch(err => alert("There was an error fetching the data!", err));
  }

  getFields (option) {
    this.setState({ loadingResults: true, searchResults: [], searchBarOpen: false });
    const [ field ] = option;
    fetch("/DB", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: [],
        sortOption: [...option]
      })
    })
    .then(res => res.json())
    .then(json => handleJSONResponse(json))
    .then(data => this.setState({searchResults: data, loadingResults: false, searchType: field}))
    .catch(err => alert("There was an error fetching the data!", err));
  }

  openSearchBar (index) {
    return e => {
      this.setState({ searchBarOpen: true, activeButton: index});
      e.target.className = 
        e.target.className.includes("red")
          ?  e.target.className
          : e.target.className + " red";
    }

  }

  render() {
    let headerText;
    switch (this.state.searchType) {
      case "TAKEOFF_INCOMPLETE":
        headerText = "Now showing plans without take-offs";
        break;
      case "QUOTE_INCOMPLETE":
        headerText = "Now showing plans without quotes";
        break;
      case "ALL_BY_RECEIVED":
        headerText = "Now showing plans by date received";
        break;
      case "CUSTOMER":
        headerText = "Now showing all of this customer\'s plans";
        break;
      case "COMPANY":
        headerText = "Now showwing all of this company\'s plans";
        break;
      case "JOB":
        headerText = "Now showing all jobs of a given job name";
        break;
      default:
        headerText = "";
        break;
    }

    let { activeButton } = this.state;
    console.log(activeButton);

    const getClassName = (name, index) => {
      if (index !== activeButton) {
        return name;
      }
      else {
        return name + " red";
      }
    }

    return (
      <div>
        <h1>Welcome!</h1>
        <div className="header"><h2>{headerText}</h2></div>
        <div className="options flex topAndBottomMargin width80 spaceBetween">
          <button onClick={this.getFields.bind(this, [sortOptions[2]])} className={getClassName("column selector", 0)}>All</button>
          <button onClick={this.getFields.bind(this, [sortOptions[0]])} className={getClassName("column selector", 1)}>Incomplete Takeoffs</button>
          <button onClick={this.getFields.bind(this, [sortOptions[1]])} className={getClassName("column selector", 2)}>Incomplete Quotes</button>
          <button onClick={this.openSearchBar(3)} className={getClassName("column selector", 3)}>Search by Customer</button>
          <button onClick={this.openSearchBar} className={getClassName("column selector", 4)}>Search By Company</button>
          <button onClick={this.openSearchBar} className={getClassName("column selector", 5)}>Search by Job Name</button>
        </div>
        { this.state.searchBarOpen ? <div><input type="text"/></div> : null }
        { this.state.loadingResults ? <div className="loader">Loading...</div> : null }
        {
          this.state.searchResults.length > 0
          ? this.state.searchResults.map((result, i) => {
            return (
              <div className="resultDiv" key={i}>
                {Object.entries(result).map((pair, j) => {
                  let [ prop, val ] = pair;
                  return <div className="flex" key={j}>
                      <div className="column miniTopAndBottomMargin">
                        {prettifyProp(prop)} :
                      </div>
                      <div className="column--wide miniTopAndBottomMargin">{val}</div>
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
