import * as React from "react";
const { Component } = React;
import "../assets/styles/header.scss";
import { withRouter } from "react-router-dom";

class Header extends Component {
  constructor(props) {
    super(props);
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.state = {
      menuIsOpen: false
    };
  }

  handleMenuClick() {
    return this.setState({
      menuIsOpen: !this.state.menuIsOpen
    });
  }

  navTo(url) {
    this.setState({ menuIsOpen: false });
    return this.props.history.push(`${url}`);
  }

  render() {
    return (
      <div className="header">
        <button onClick={this.handleMenuClick} className="hamburger">
          <img height="25px" width="25px" src="https://cdn0.iconfinder.com/data/icons/social-messaging-productivity-4/128/menu-2-512.png" />
        </button>
        {
          this.state.menuIsOpen ?
          <div className="navMenu">
            <button onClick={this.navTo.bind(this, "/")}>Check Plans</button>
            <button onClick={this.navTo.bind(this, "/receive")}>Receive A Plan</button>
          </div>
          : null
        }
      </div>
    )
  }
}

export default withRouter(Header);
