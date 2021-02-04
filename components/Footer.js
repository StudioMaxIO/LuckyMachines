import React, { Component } from "react";
import { Icon, Grid } from "semantic-ui-react";
import { Link, Router } from "../routes";

class Footer extends Component {
  render() {
    return (
      <Grid>
        <Grid.Row centered>
          <p>Contact Links Go Here</p>
          <br />
        </Grid.Row>
      </Grid>
    );
  }
}

export default Footer;
