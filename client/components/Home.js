import * as React from "react";
const { Component } = React;
import "../assets/styles/global.scss";

const sortOptions = [
  "TAKEOFF_INCOMPLETE",
  "QUOTE_INCOMPLETE",
  "ALL_BY_RECEIVED",
  "CUSTOMER",
  "COMPANY",
  "JOB",
  "QUOTE_UNCHECKED",
  "QUOTE_UNSENT"
];

const prettifyProp = name => {
  name = name.substring(0, 1) + name.substring(1).toLowerCase();
  let i = name.indexOf("_");
  while (i >= 0) {
    name =
      name.substring(0, i + 1) +
      name.substring(i + 1, i + 2).toUpperCase() +
      name.substring(i + 2);

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
};

class Home extends Component {
  constructor(props) {
    super(props);
    this.searchRef = React.createRef();

    this.openSearchBar = this.openSearchBar.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.markQuoteComplete = this.markQuoteComplete.bind(this);
    this.markTakeoffComplete = this.markTakeoffComplete.bind(this);

    this.state = {
      loadingResults: true,
      searchResults: [],
      searchType: "TAKEOFF_INCOMPLETE",
      searchBarOpen: false,
      selectedButton: "",
      activeButton: 1,
      searchValue: ""
    };
  }

  componentDidMount() {
    this.getFields.call(this, [sortOptions[0]], 1);
  }

  getFields(option, buttonIndex) {
    this.setState({
      loadingResults: true,
      searchResults: [],
      searchBarOpen: false,
      activeButton: buttonIndex
    });
    const [field] = option;
    fetch("/api/DB", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: [],
        sortOption: [...option]
      })
    })
      .then(res => {
        console.log(res);
        return res.json();
      })
      .then(json => handleJSONResponse(json))
      .then(data =>
        this.setState({
          searchResults: data,
          loadingResults: false,
          searchType: field
        })
      )
      .catch(err => alert("There was an error fetching the data!", err));
  }

  openSearchBar(index) {
    return e => {
      this.setState({ searchBarOpen: true, activeButton: index });
    };
  }

  handleInputChange(e) {
    this.setState({ searchValue: e.target.value });
  }

  handleEnter(e) {
    if (e.key === "Enter") {
      this.handleSearch();
    }
  }

  handleSearch() {
    switch (this.state.activeButton) {
      case 3:
        this.getFields.call(this, [sortOptions[3], this.state.searchValue], 3);
        break;
      case 4:
        this.getFields.call(this, [sortOptions[4], this.state.searchValue], 4);
        break;
      case 5:
        this.getFields.call(this, [sortOptions[5], this.state.searchValue], 5);
        break;
    }
    this.setState({ searchValue: "" });
    this.searchRef.current.value = "";
  }

  markTakeoffComplete(e) {
    fetch("/api/takeoffComplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: e.target.value
      })
    })
    .catch(err => alert("Error completing take-off", err))
    .finally(() => this.getFields.call(this, ["TAKEOFF_INCOMPLETE"], 1))
  }

  markQuoteComplete(e) {
    fetch("/api/quoteComplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: e.target.value
      })
    })
    .catch(err => alert("Error completing quote", err))
    .finally(() => this.getFields.call(this, ["QUOTE_INCOMPLETE"], 2));
  }

  render() {

    let { activeButton } = this.state;

    const getClassName = (name, index) => {
      if (index !== activeButton) {
        return name;
      } else {
        return name + " active";
      }
    };

    return (
      <div>
        <div className="options flex topAndBottomMargin width80 spaceBetween">
          <button
            onClick={this.getFields.bind(this, [sortOptions[2]], 0)}
            className={getClassName("column selector", 0)}
          >
            All
          </button>
          <button
            onClick={this.getFields.bind(this, [sortOptions[0]], 1)}
            className={getClassName("column selector", 1)}
          >
            Incomplete Takeoffs
          </button>
          <button
            onClick={this.getFields.bind(this, [sortOptions[1]], 2)}
            className={getClassName("column selector", 2)}
          >
            Incomplete Quotes
          </button>
          <button
            onClick={this.openSearchBar(3)}
            className={getClassName("column selector", 3)}
          >
            Search by Customer
          </button>
          <button
            onClick={this.openSearchBar(4)}
            className={getClassName("column selector", 4)}
          >
            Search By Company
          </button>
          <button
            onClick={this.openSearchBar(5)}
            className={getClassName("column selector", 5)}
          >
            Search by Job Name
          </button>
        </div>
        <div className="options options2 flex topAndBottomMargin justifyCenter">
          <button
            onClick={this.getFields.bind(this, [sortOptions[6]], 6)}
            className={getClassName("column selector", 6)}
          >
            Unchecked Quotes
          </button>
          <button
            onClick={this.getFields.bind(this, [sortOptions[7]], 7)}
            className={getClassName("column selector", 7)}
          >
            Unsent Quotes
          </button>
        </div>
        {this.state.searchBarOpen ? (
          <div>
            <input
              ref={this.searchRef}
              onKeyPress={this.handleEnter}
              onChange={this.handleInputChange}
              className="searchBar"
              type="text"
            />
            <button
              onClick={this.handleSearch}
              className="selector miniMarginLeft miniTopAndBottomMargin"
            >
              Search
            </button>
          </div>
        ) : null}
        {this.state.loadingResults ? (
          <div className="loader">Loading...</div>
        ) : null}
        {this.state.searchResults.length > 0
          ? this.state.searchResults.map((result, i) => {
              return <div className="resultDiv" key={i}>
                { 
                  (!result.TAKE_OFF_MADE || !result.QUOTE_MADE) ? 
                  <div className="flex--column floatRight rightMargin">
                    {
                      !result.TAKE_OFF_MADE ?
                        <button value={result.id} onClick={this.markTakeoffComplete} className="statusButton topAndBottomMargin">
                          Take-off Completed
                        </button> : null
                    }
                    {
                      !result.QUOTE_MADE ?
                        <button value={result.id} onClick={this.markQuoteComplete} className="statusButton">
                          Quote Completed
                        </button> : null
                    }
                  </div> : null
                }
                  {Object.entries(result).map((pair, j) => {
                    let [prop, val] = pair;
                    if (prop !== "id") {
                      return <div className="flex" key={j}>
                          <div className="column miniTopAndBottomMargin">
                            {prettifyProp(prop)} :
                          </div>
                          <div className="column--wide miniTopAndBottomMargin">
                            {val}
                          </div>
                        </div>;
                    } else {
                      return null;
                    }
                  })}
                  <br />
                </div>;
            })
          : null}
      </div>
    );
  }
}

export default Home;
