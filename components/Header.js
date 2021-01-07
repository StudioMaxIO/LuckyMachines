import React, { Component } from "react";
import { Menu, Segment } from "semantic-ui-react";
import { Link, Router } from "../routes";
//const profile = require("../settings/profile");

class Header extends Component {
  //export default () => {
  state = {
    activeItem: this.props.page
  };
  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name });
    Router.pushRoute("/" + name);
  };
  render() {
    const { activeItem } = this.state;

    return (
      <Segment style={{ marginTop: "10px" }} inverted>
        <Menu pointing secondary inverted>
          <Link route="/">
            <a className="item">Lucky Machines</a>
          </Link>
          <Menu.Menu position="right">
            <Menu.Item
              name="play"
              active={activeItem === "play"}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name="operate"
              active={activeItem === "operate"}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name="factory"
              active={activeItem === "factory"}
              onClick={this.handleItemClick}
            />
          </Menu.Menu>
        </Menu>
      </Segment>
    );
  }
}

export default Header;
