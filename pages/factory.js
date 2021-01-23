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
import LuckyMachine from "../ethereum/luckyMachine";
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
    errorMessage: "",
    machines: []
  };

  async componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.getMachines();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async getMachines() {
    const accounts = await web3.eth.getAccounts();
    const factory = await LuckyMachineFactory(factoryAddress);
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

  createMachine = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      const factory = await LuckyMachineFactory(factoryAddress);
      const newMachine = await factory.methods
        .createMachine(
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
                      label="X"
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

export default Factory;
