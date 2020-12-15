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
  Label
} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
import luckyMachine from "../ethereum/luckyMachine";
import web3 from "../ethereum/web3";

class Play extends Component {
  state = {
    bet: 0,
    pick: 0,
    loading: false,
    errorMessage: ""
  };

  onSubmit = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      await luckyMachine.methods.placeBet(this.state.pick).send({
        from: accounts[0],
        value: web3.toWei(this.state.bet, "ether")
      });

      //Router.pushRoute("/workshop");
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout>
        <Grid centered columns={6} style={{ marginTop: "10px" }}>
          <Grid.Row color="black">
            <h1
              style={{
                textColor: "white",
                fontSize: "4em",
                fontWeight: "normal"
              }}
            >
              Lucky Machine
            </h1>
          </Grid.Row>
          <Grid.Row color="black">
            <p>Rules...</p>
          </Grid.Row>
          <Grid.Row color="blue">
            <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
              <Form.Group widths="equal">
                <Form.Field>
                  <Label color="black">Pick</Label>
                  <Input
                    value={this.state.pick}
                    onChange={event =>
                      this.setState({ pick: event.target.value })
                    }
                  />
                </Form.Field>
                <Form.Field>
                  <Label color="black">Bet</Label>
                  <Input
                    label="ETH"
                    labelPosition="right"
                    value={this.state.bet}
                    onChange={event =>
                      this.setState({ bet: event.target.value })
                    }
                  />
                </Form.Field>
              </Form.Group>
              <Message error header="Oops!" content={this.state.errorMessage} />
              <Button loading={this.state.loading} color="orange" size="huge">
                Place Bet
              </Button>
            </Form>
          </Grid.Row>
        </Grid>
        <Grid style={{ paddingTop: "10px" }}>
          <Grid.Row centered columns={2}>
            <Grid.Column color="black">
              <center>
                <h2
                  style={{
                    textColor: "black",
                    fontWeight: "normal"
                  }}
                >
                  Game #124
                </h2>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row centered columns={2}>
            <Grid.Column color="grey">
              <p>
                <strong>Player:</strong>{" "}
                0x2F7a65f3702FB30bB7Ec60A19e9d7F9b99864C09
              </p>
              <p>
                <strong>Bet:</strong> 0.1 ETH
              </p>
              <p>
                <strong>Pick:</strong> 24
              </p>
              <p>
                <strong>Winning Number:</strong> Pending...
              </p>
              <p>
                <strong>Game Not Yet Played</strong>
              </p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default Play;
