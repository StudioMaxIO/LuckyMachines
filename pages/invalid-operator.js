import React, { Component } from "react";
import {
  Card,
  Checkbox,
  Grid,
  Container,
  Button,
  Form,
  Input,
  Message,
  Label,
  Image,
  Header,
  Icon
} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
import LuckyMachine from "../ethereum/luckyMachine";
import web3 from "../ethereum/web3";
const s = require("../settings");

class InvalidOperator extends Component {
  state = {
    ethBalance: "",
    linkBalance: "",
    address: "",
    payoutAddress: "",
    withdrawEthAmount: "",
    withdrawEthErrorMessage: "",
    withdrawEthLoading: false,
    withdrawLinkAmount: "",
    withdrawLinkErrorMessage: "",
    withdrawLinkLoading: false,
    closeMachineErrorMessage: "",
    closeMachineLoading: false
  };

  static async getInitialProps(props) {
    //const project = Project(props.query.address);

    this._isMounted = false;
    return {
      address: props.query.address
    };
  }

  async componentDidMount() {
    if (global.chainID == "0") {
      global.chainID = await web3.currentProvider.request({
        method: "eth_chainId"
      });
    }
    if (global.chainID != s.REQUIRED_CHAIN_ID) {
      window.location.assign("/incorrect-chain");
    }
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <Layout page="operate">
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
                  Lucky Machine Operator
                </h1>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Header>Machine:</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-28px" }}>
            <Grid.Column>
              <strong>
                <Link route={"/play/" + this.props.address}>
                  {this.props.address}
                </Link>
              </strong>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "0px" }}>
            <Grid.Column>
              <h2>
                You must be the owner of this machine to access the operator
                interface.
              </h2>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default InvalidOperator;
