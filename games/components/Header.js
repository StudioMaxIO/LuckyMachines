import React, { Component } from "react";
import { Menu, Segment, Image } from "semantic-ui-react";
import { Link, Router } from "../routes";
//const profile = require("../settings/profile");

class Header extends Component {
  //export default () => {
  state = {
    activeItem: this.props.page,
  };
  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name });
    if (name == "games") {
      Router.pushRoute("/games");
    } else {
      window.location.assign("https://luckymachines.io/" + name);
    }
  };
  render() {
    const { activeItem } = this.state;

    return (
      <Segment style={{ marginTop: "10px", padding: "0px" }} inverted>
        <Menu pointing secondary inverted>
          <Link route="/">
            <a className="item">
              <Image
                src={
                  "https://i.postimg.cc/254k1WZj/Lucky-Machines-Logo-Small.png"
                }
                size="mini"
              ></Image>
            </a>
          </Link>
          <Menu.Menu position="right" style={{ marginBottom: "10px" }}>
            <Menu.Item
              name="games"
              active={activeItem === "games"}
              onClick={this.handleItemClick}
            />
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
