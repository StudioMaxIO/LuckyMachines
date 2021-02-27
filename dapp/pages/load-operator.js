import React, { Component } from "react";
import {
  Card,
  Grid,
  Button,
  Form,
  Input,
  List,
  Icon,
  Header
} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
import LuckyMachineFactory from "../ethereum/luckyMachineFactory";
import LuckyMachine from "../ethereum/luckyMachine";
const s = require("../settings");
import web3 from "../ethereum/web3";

class LoadOperator extends Component {
  state = {
    machineAddress: "",
    machines: []
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
    } else {
      this._isMounted && this.getMachines();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  loadMachine = event => {
    if (this.state.machineAddress != "") {
      var route = "/operate/" + this.state.machineAddress;
      Router.pushRoute(route);
    }
  };

  async getMachines() {
    const accounts = await web3.eth.getAccounts();
    const factory = await LuckyMachineFactory(s.FACTORY_ADDRESS);
    const allMachines = await factory.methods
      .getOwnedMachines()
      .call({ from: accounts[0] });
    const machines = [];
    for (var i = 0; i < allMachines.length; i++) {
      const m = await LuckyMachine(allMachines[i]);
      const summary = await m.methods.getSummary().call();
      //active means max bet payable and enough link for bet
      const maxBetPayable = await m.methods.betPayable(summary[1]).call();
      const linkBalance = await m.methods.getLinkBalance().call();
      const availableLink = linkBalance >= 0.1 * (10 ^ 18);
      const active = maxBetPayable && availableLink;
      machines.push([
        summary[0],
        summary[1],
        summary[2],
        summary[3],
        allMachines[i],
        active
      ]);
    }
    this.setState({
      machines: machines
    });
  }

  displayMachines() {
    const final = [];
    for (var i = 0; i < this.state.machines.length; i++) {
      if (i > 0) {
        final.push(
          <List.Item style={{ marginTop: "-20px" }} key={i.toString()}>
            <Link route={"/operate/" + this.state.machines[i][4]}>
              {this.state.machines[i][4]}
            </Link>
            &nbsp;
            <Icon
              color={this.state.machines[i][5] ? "green" : "red"}
              name="circle"
            />{" "}
            <br />
            <p>
              <strong>Payout:</strong>
              {this.state.machines[i][2] + "X "}
              <strong>Min Bet:</strong>
              {web3.utils.fromWei(this.state.machines[i][0], "ether") + "ETH "}
              <strong>Max Bet:</strong>
              {web3.utils.fromWei(this.state.machines[i][1], "ether") + "ETH "}
              <strong>Max Pick:</strong>
              {this.state.machines[i][3]}
            </p>
            <br />
          </List.Item>
        );
      } else {
        final.push(
          <List.Item key={i.toString()}>
            <Link route={"/operate/" + this.state.machines[i][4]}>
              {this.state.machines[i][4]}
            </Link>
            &nbsp;
            <Icon
              color={this.state.machines[i][5] ? "green" : "red"}
              name="circle"
            />{" "}
            <br />
            <p>
              <strong>Payout:</strong>
              {this.state.machines[i][2] + "X "}
              <strong>Min Bet:</strong>
              {web3.utils.fromWei(this.state.machines[i][0], "ether") + "ETH "}
              <strong>Max Bet:</strong>
              {web3.utils.fromWei(this.state.machines[i][1], "ether") + "ETH "}
              <strong>Max Pick:</strong>
              {this.state.machines[i][3]}
            </p>
            <br />
          </List.Item>
        );
      }
    }
    return <div>{final}</div>;
  }

  render() {
    return (
      <Layout page="operate">
        <Grid centered style={{ marginTop: "10px" }}>
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
                <Form onSubmit={this.loadMachine}>
                  <Form.Field>
                    <Input
                      placeholder="Lucky Machine Address: 0x..."
                      value={this.state.machineAddress}
                      onChange={event =>
                        this.setState({
                          machineAddress: event.target.value
                        })
                      }
                    />
                  </Form.Field>
                  <Button size="huge" color="blue">
                    Operate
                  </Button>
                </Form>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ backgroundColor: "#99ccff" }}>
            <Grid.Column>
              <Header>My Machines:</Header>
              <List>{this.displayMachines()}</List>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default LoadOperator;
