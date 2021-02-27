import React, { Component } from "react";
import {
  Card,
  Checkbox,
  Grid,
  Container,
  Header,
  Button,
  Form,
  Input,
  Message,
  Label,
  List,
  Icon
} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Router, Link } from "../routes";
import LuckyMachineFactory from "../ethereum/luckyMachineFactory";
import web3 from "../ethereum/web3";
const s = require("../settings");
const factoryAddress = s.FACTORY_ADDRESS;

class Factory extends Component {
  state = {
    minBet: "0.01",
    maxBet: "0.1",
    maxPick: "100",
    payout: "10",
    loading: false,
    errorMessage: ""
  };

  async componentDidMount() {
    this._isMounted = true;
    if (global.chainID == "0") {
      global.chainID = await web3.currentProvider.request({
        method: "eth_chainId"
      });
    }
    if (global.chainID != s.REQUIRED_CHAIN_ID) {
      window.location.assign("/incorrect-chain");
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  createMachine = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      const factory = await LuckyMachineFactory(factoryAddress);
      const newMachine = await factory.methods
        .createMachine(
          s.MACHINE_COORDINATOR,
          web3.utils.toWei(this.state.maxBet, "ether"),
          web3.utils.toWei(this.state.minBet, "ether"),
          this.state.maxPick,
          this.state.payout
        )
        .send({ from: accounts[0] });

      const operateURL = "/operate/" + newMachine.events[0].address;
      window.location.assign(operateURL);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }
    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout page="factory">
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
                  Lucky Machine Factory
                </h1>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row color="blue" align="center">
            <Grid.Column>
              <Form
                onSubmit={this.createMachine}
                error={!!this.state.errorMessage}
              >
                <Form.Group
                  inline
                  widths="equal"
                  style={{ marginRight: "75px", marginLeft: "75px" }}
                >
                  <Form.Field>
                    <Label>Minimum Bet:</Label>
                    <br />
                    <Input
                      label="ETH"
                      labelPosition="right"
                      value={this.state.minBet}
                      style={{ padding: "5px" }}
                      onChange={event =>
                        this.setState({ minBet: event.target.value })
                      }
                    />
                  </Form.Field>
                  <Form.Field>
                    <Label>Maximum Bet:</Label>
                    <br />
                    <Input
                      label="ETH"
                      labelPosition="right"
                      value={this.state.maxBet}
                      style={{ padding: "5px" }}
                      onChange={event =>
                        this.setState({ maxBet: event.target.value })
                      }
                    />
                  </Form.Field>
                </Form.Group>
                <Form.Group
                  inline
                  widths="equal"
                  style={{ marginRight: "75px", marginLeft: "75px" }}
                >
                  <Form.Field>
                    <Label>Maximum Pick:</Label>
                    <br />
                    <Input
                      label="#"
                      labelPosition="right"
                      value={this.state.maxPick}
                      style={{ padding: "5px" }}
                      onChange={event =>
                        this.setState({ maxPick: event.target.value })
                      }
                    />
                  </Form.Field>
                  <Form.Field>
                    <Label>Payout:</Label>
                    <br />
                    <Input
                      label=": 1"
                      labelPosition="right"
                      value={this.state.payout}
                      style={{ padding: "5px" }}
                      onChange={event =>
                        this.setState({ payout: event.target.value })
                      }
                    />
                  </Form.Field>
                </Form.Group>
                <Message
                  error
                  header="Oops!"
                  content={this.state.errorMessage}
                />
                <Button loading={this.state.loading} color="orange" size="huge">
                  Create Lucky Machine
                </Button>
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default Factory;
