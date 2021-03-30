import React, { Component } from "react";
import { Icon, Grid, List } from "semantic-ui-react";
import { Link, Router } from "../routes";

class Footer extends Component {
  render() {
    return (
      <Grid>
        <Grid.Row centered style={{ background: "#bee6ff" }}>
          <Grid.Column width={3}>
            <List>
              <List.Item>
                <List.Header>Community</List.Header>
              </List.Item>
              <List.Item>
                <span>
                  <Icon name="telegram plane" />
                  <a href="https://t.me/LuckyMachinesIO">Telegram</a>
                </span>
              </List.Item>
              <List.Item>
                <span>
                  <Icon name="twitter" />
                  <a href="https://twitter.com/studiomaxio">Twitter</a>
                </span>
              </List.Item>
            </List>
          </Grid.Column>
          <Grid.Column width={3}>
            <List>
              <List.Item>
                <List.Header>Developers</List.Header>
              </List.Item>
              <List.Item>
                <span>
                  <Icon name="github" />
                  <a href="https://github.com/StudioMaxIO/LuckyMachinesPolygon">
                    Github
                  </a>
                </span>
              </List.Item>
            </List>
          </Grid.Column>
          <br />
        </Grid.Row>
      </Grid>
    );
  }
}

export default Footer;
