import * as React from "react";
const { Component } = React;
import "../assets/styles/global.scss";
import oboe from "oboe";
import Popup from "reactjs-popup";

const sortOptions = [
  "TAKEOFF_INCOMPLETE",
  "QUOTE_INCOMPLETE",
  "ALL_BY_RECEIVED",
  "CUSTOMER",
  "COMPANY",
  "JOB",
  "QUOTE_UNCHECKED",
  "QUOTE_UNSENT",
  "QUOTE_NUMBER"
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

/*

const handleJSONResponse = json => {
  if (json.err) {
    return Promise.reject("Error fetching data", json.err);
  } else {
    return Promise.resolve(json);
  }
};

*/

const setInitialState = () => {
  return {
    loadingResults: true,
    searchResults: [],
    searchType: "TAKEOFF_INCOMPLETE",
    searchBarOpen: false,
    selectedButton: "",
    activeButton: 1,
    searchValue: "",
    takeoffPopupOpen: false,
    quotePopupOpen: false,
    updateQuotePopupOpen: false,
    takeoffName: "",
    quoteName: "",
    selectedPlan: null,
    quoteNumber: "",
  };
};

class Home extends Component {
  constructor(props) {
    super(props);
    this.searchRef = React.createRef();

    this.openSearchBar = this.openSearchBar.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.markQuoteComplete = this.markQuoteComplete.bind(this);
    this.markTakeoffComplete = this.markTakeoffComplete.bind(this);
    this.closePopups = this.closePopups.bind(this);
    this.markQuoteUpdated = this.markQuoteUpdated.bind(this);

    this.state = setInitialState()
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

    
    oboe({
      url: "/api/DB",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: [],
        sortOption: [...option]
      }),
      cached: false
    })
      .on("node", "{}", json => {
        if (typeof json === "object" && json.id !== undefined) {
          //console.log(json);
          return this.setState({
            searchResults: this.state.searchResults.concat(json),
            loadingResults: false
          });
        } else if (typeof json === "object" && json.id === undefined) {
          // When I pipe it, it sends an empty object at the end.
          return this.setState({
            loadingResults: false
          });
        }
      })
      .fail(err => {
        console.log("Error retrieving data", err);
      });

      /*
    
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
        console.log(typeof(res));
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

      */
    
  }

  openSearchBar(index) {
    return e => {
      this.setState({ searchBarOpen: true, activeButton: index });
    };
  }

  handleInputChange(key, e) {
    let returnObj = {};
    returnObj[key] = e.target.value;
    this.setState(returnObj);
  }

  handleEnter(option = "search", e) {
    let fn;
    switch(option) {
      case "search":
        fn = this.handleSearch;
        break;
      case "takeoff":
        fn = this.markTakeoffComplete.bind(this);
        break;
      case "quote":
        fn = this.markQuoteComplete.bind(this);
        break;
      case "updateQuote":
        fn = this.markQuoteUpdated.bind(this);
        break;
    }
    if (e.key === "Enter") {
      fn();
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
      case 8:
        this.getFields.call(this, [sortOptions[8], this.state.searchValue], 8);
        break;
    }
    this.setState({ searchValue: "" });
    this.searchRef.current.value = "";
  }

  togglePopup(option = "takeoff", id) {
    let stateObj = {};
    stateObj[option + "PopupOpen"] = true;
    stateObj.selectedPlan = id;
    return this.setState(stateObj);
  }

  closePopups() {
    return this.setState({
      takeoffPopupOpen: false,
      quotePopupOpen: false,
      updateQuotePopupOpen: false
    });
  }

  markTakeoffComplete() {
    this.takeoffCompleteFetch.call(this, this.state.selectedPlan, this.state.takeoffName);
    return this.setState({ takeoffPopupOpen: false });
  }

  markQuoteComplete() {
    this.quoteCompleteFetch.call(this, this.state.selectedPlan, this.state.quoteName, this.state.quoteNumber);
    return this.setState({ quotePopupOpen: false });
  }

  markQuoteUpdated() {
    this.quoteUpdateFetch.call(this, this.state.selectedPlan, this.state.quoteName, this.state.quoteNumber);
    return this.setState({ updateQuotePopupOpen: false });
  }

  quoteCompleteFetch(id, name, number = "") {
    let reqBody = {
      id: id,
      name: name
    };
    if (number) {
      reqBody.number = number;
    }
    fetch("/api/quoteComplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reqBody)
    })
      .catch(err => alert("Error completing quote", err))
      .finally(() => this.getFields.call(this, ["QUOTE_INCOMPLETE"], 2));
  }

  takeoffCompleteFetch(id, name) {
    fetch("/api/takeoffComplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: id,
        name: name
      })
    })
      .catch(err => alert("Error completing take-off", err))
      .finally(() => this.getFields.call(this, ["TAKEOFF_INCOMPLETE"], 1));
  }

  quoteUpdateFetch(id, name, number) {
    fetch("/api/updateQuote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id,
        name,
        number
      })
    })
      .catch(err => console.error("Error during quote update fetch", err))
      .then(() => this.getFields.call(this, ["QUOTE_INCOMPLETE"], 2));
  }

  render() {

    return (
      <div>
        { render_sort_buttons(this) }
        {this.state.searchBarOpen ? (
          render_search_bar(this)
        ) : null}
        {this.state.loadingResults ? (
          <div className="loader">Loading...</div>
        ) : null}
        {this.state.searchResults.length > 0
          ? render_search_results(this)
          : null}
      </div>
    );
  }
}

const render_sort_buttons = (context) => {
  const { activeButton } = context;

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
            onClick={context.getFields.bind(context, [sortOptions[2]], 0)}
            className={getClassName("column selector", 0)}
          >
            All
          </button>
          <button
            onClick={context.getFields.bind(context, [sortOptions[0]], 1)}
            className={getClassName("column selector", 1)}
          >
            Incomplete Takeoffs
          </button>
          <button
            onClick={context.getFields.bind(context, [sortOptions[1]], 2)}
            className={getClassName("column selector", 2)}
          >
            Incomplete Quotes
          </button>
          <button
            onClick={context.openSearchBar(3)}
            className={getClassName("column selector", 3)}
          >
            Search by Customer
          </button>
          <button
            onClick={context.openSearchBar(4)}
            className={getClassName("column selector", 4)}
          >
            Search By Company
          </button>
          <button
            onClick={context.openSearchBar(5)}
            className={getClassName("column selector", 5)}
          >
            Search by Job Name
          </button>
        </div>
        <div className="options options2 flex topAndBottomMargin justifyCenter">
          <button
            onClick={context.getFields.bind(context, [sortOptions[6]], 6)}
            className={getClassName("column selector", 6)}
          >
            Unchecked Quotes
          </button>
          <button
            onClick={context.getFields.bind(context, [sortOptions[7]], 7)}
            className={getClassName("column selector", 7)}
          >
            Unsent Quotes
          </button>
          <button
            onClick={context.openSearchBar(8)}
            className={getClassName("column selector", 8)}
          >
            Search by Quote Number
          </button>
        </div>
    </div>
  );
};

const render_search_bar = context => {
  return (
    <div>
      <input
        ref={context.searchRef}
        onKeyPress={context.handleEnter.bind(context, "search")}
        onChange={context.handleInputChange.bind(context, "searchValue")}
        className="searchBar"
        type="text"
      />
      <button
        onClick={context.handleSearch}
        className="selector miniMarginLeft miniTopAndBottomMargin"
      >
        Search
      </button>
    </div>
  )
};

const render_search_results = context => {
  const {
    searchResults
  } = context.state;

  return (
    searchResults.map((result, i) => {
      return <div className="resultDiv" key={i}>
          { render_status_buttons(context, result) }
          { Object.entries(result).map(render_result_div) }
          { render_popups(context) }
          <br />
        </div>;
    })
  );
};

const render_status_buttons = (context, result) => {
  const render_status_button = option => {
    let buttonTitle;

    switch (option) {
      case "takeoff":
        buttonTitle = "Take-off Completed";
        break;
      case "quote":
        buttonTitle = "Quote Completed";
        break;
      case "updateQuote":
        buttonTitle = "Update Quote";
        break;
    }

    return (
      <button 
        value={result.id}
        onClick={context.togglePopup.bind(context, option, result.id)}
        className="statusButton"
      >
      { buttonTitle }
      </button>
    );
  };
  
  return (
    <div className="flex--column floatRight rightMargin">
      {
        !result.TAKE_OFF_MADE ? 
         render_status_button("takeoff")
         : null
      }
      {
        !result.QUOTE_MADE ? 
          render_status_button("quote")
        : render_status_button("updateQuote")
      }
    </div> 
  );
};

const render_popups = context => {
  const {
    takeoffPopupOpen,
    quotePopupOpen,
    updateQuotePopupOpen,
    takeoffName,
    quoteName,
    quoteNumber
  } = context.state;

  const {
    handleEnter,
    handleInputChange,
    markQuoteComplete,
    markTakeoffComplete,
    markQuoteUpdated,
    closePopups
  } = context;

  const render_popup = option => {
    let 
      popupOpen, 
      keypress = option, 
      change, 
      change2, 
      click,
      value,
      value2;

    switch (option) {
      case "takeoff":
        popupOpen = takeoffPopupOpen;
        change = "takeoffName";
        value = takeoffName;
        click = markTakeoffComplete;
        break;

      case "quote":
        popupOpen = quotePopupOpen;
        change = "quoteName";
        change2 = "quoteNumber";
        value = quoteName;
        value2 = quoteNumber;
        click = markQuoteComplete;
        break;

      case "updateQuote":
        popupOpen = updateQuotePopupOpen;
        change = "quoteName";
        change2 = "quoteNumber";
        value = quoteName;
        value2 = quoteNumber;
        click = markQuoteUpdated;
        break;
    }

    return (
      <Popup open={popupOpen} modal>
        <div className="popupDiv">
          <span> Who completed it? </span>
          <div>
            <input
              onKeyPress={handleEnter.bind(context, keypress)}
              onChange={handleInputChange.bind(context, change)}
              type="text"
              value={value}
            />
            {
              value2 === quoteNumber ? (
                <div>
                  <span> Quote Number: </span>
                  <input
                    onKeyPress={handleEnter.bind(context, keypress)}
                    onChange={handleInputChange.bind(context, change2)}
                    type="text"
                    value={value2}
                  />
                </div>
              ) : null
            }
            <button onClick={click}>Submit</button>
            <button className="closeButton" onClick={closePopups}>X</button>
          </div>
        </div>
      </Popup>
    );
  };

  return (
    <div>
      { render_popup("takeoff") }
      { render_popup("quote") }
      { render_popup("updateQuote") }
    </div>
  );
};

const render_result_div = (entry, index) => {
  const specialProps = [
    "id",
    "Plans_Uploaded"
  ];

  let [prop, val] = entry;

  if (!(specialProps.includes(prop))) {
    return (
      <div className="flex" key={index}>
        <div className="column miniTopAndBottomMargin label">
          { prettifyProp(prop) } :
        </div>
        <div className="column--wide miniLeftAndRightMargin miniTopAndBottomMargin">
          { val }
        </div>
      </div>
    );
  }

  else {
    // Should contain an if statement for every item in the specialProps array
    if (prop === "id") {
      return null;
    }

    if (prop === "Plans_Uploaded") {
      return (
        <div className="flex wrapWhenSmall" key={index}>
          <div className="column miniTopAndBottomMargin label">
            Look at Plans
          </div>
          <div className="column--wide miniTopAndBottomMargin">
            <form action={`/api/getPlan/${val}`} method="post">
              <input type="submit" value="Download"/>
            </form>
          </div>
        </div>
      );
    }

  }
};

export default Home;
