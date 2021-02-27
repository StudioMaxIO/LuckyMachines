import React, { Component } from "react";
import { Grid, Header } from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
import web3 from "../ethereum/web3";
const s = require("../settings");

class IncorrectChain extends Component {
  async componentDidMount() {
    this._isMounted = true;
    const cid = await web3.currentProvider.request({ method: "eth_chainId" });
    if (cid == s.REQUIRED_CHAIN_ID) {
      window.location.assign("/play");
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <Layout page="">
        <Grid style={{ marginTop: "10px" }}>
          <Grid.Row color="black">
            <Grid.Column>
              <center>
                <h1
                  style={{
                    textColor: "white",
                    fontSize: "4em",
                    fontWeight: "normal"
                  }}
                >
                  Lucky Machines
                </h1>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row
            style={{
              marginTop: "0px",
              backgroundColor: "#99ccff",
              color: "#001433"
            }}
          >
            <Grid.Column>
              <center>
                <h2>
                  You must be on {s.REQUIRED_CHAIN_NAME} to use Lucky Machines.
                </h2>
              </center>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default IncorrectChain;
