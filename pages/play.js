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
  Menu
} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
import LuckyMachine from "../ethereum/luckyMachine";
import web3 from "../ethereum/web3";

class Play extends Component {
  state = {
    bet: 0.01,
    pick: 0,
    gameIDInput: "",
    checkGameLoading: false,
    loading: false,
    errorMessage: "",
    summaryGameID: "",
    summaryMaxPick: "",
    summaryPlayer: "",
    summaryBet: "",
    summaryPick: "",
    summaryWinningNumber: "pending...",
    summaryStatus: "Awaiting Random Number"
  };

  static async getInitialProps(props) {
    //const project = Project(props.query.address);

    this._isMounted = false;
    const luckyMachine = LuckyMachine(props.query.address);
    const summary = await luckyMachine.methods.getSummary().call();

    return {
      address: props.query.address,
      minimumBet: summary[0],
      maximumBet: summary[1],
      maximumPick: summary[3],
      payout: summary[2],
      gameID: props.query.gameID
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    if (this.props.gameID != "") {
      this.setState({ summaryGameID: this.props.gameID });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  displayPickerValues() {
    const final = [];
    console.log("Max pick: ", this.props.maximumPick);
    for (var i = 0; i < Number(this.props.maximumPick) + 1; i++) {
      final.push(
        <Button
          size="mini"
          style={{ margin: "5px" }}
          onClick={this.selectNumber}
          name={i}
          active={this.state.pick === i}
        >
          {i}
        </Button>
      );
    }
    return <div>{final}</div>;
  }

  selectNumber = (e, { name }) => {
    this.setState({ pick: name });
    //this.setState({ activeItem: name });
  };

  placeBet = async event => {
    event.preventDefault();
    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      const luckyMachine = LuckyMachine(String(this.props.address));
      await luckyMachine.methods
        .placeBetFor(accounts[0], this.state.pick)
        .send({
          from: accounts[0],
          value: web3.utils.toWei(String(this.state.bet), "ether")
        });

      //Router.pushRoute("/workshop");
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  checkGame = async event => {
    event.preventDefault();

    this.setState({ checkGameLoading: true, errorMessage: "" });
  };

  render() {
    return (
      <Layout page="play">
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
            <Grid.Column>
              <center>
                <p>
                  Minimum Bet:
                  <br />
                  {web3.utils.fromWei(this.props.minimumBet, "ether")} ETH
                </p>
              </center>
            </Grid.Column>
            <Grid.Column>
              <center>
                <p>
                  Maximum Bet:
                  <br />
                  {web3.utils.fromWei(this.props.maximumBet, "ether")} ETH
                </p>
              </center>
            </Grid.Column>
            <Grid.Column>
              <center>
                <p>
                  Payout:
                  <br /> {this.props.payout}X
                </p>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row color="blue" centered>
            <Label
              color="black"
              style={{ marginBottom: "-25px", zIndex: "1000" }}
            >
              Pick
            </Label>
          </Grid.Row>
          <Grid.Row color="blue" centered>
            {this.displayPickerValues()}
          </Grid.Row>
          <Grid.Row color="blue" centered>
            <Form onSubmit={this.placeBet} error={!!this.state.errorMessage}>
              <Form.Group style={{ paddingTop: "10px" }}>
                <center>
                  <Form.Field>
                    <Label
                      color="black"
                      style={{
                        marginBottom: "5px",
                        padding: "10px"
                      }}
                    >
                      Bet
                    </Label>
                    <Input
                      label="ETH"
                      labelPosition="right"
                      value={this.state.bet}
                      style={{ padding: "5px" }}
                      onChange={event =>
                        this.setState({ bet: event.target.value })
                      }
                    />
                  </Form.Field>
                </center>
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
                <Form onSubmit={this.checkGame}>
                  <Form.Field>
                    <Input
                      placeholder="Game ID"
                      value={this.state.gameIDInput}
                      onChange={event =>
                        this.setState({ tokenAddress: event.target.value })
                      }
                    />
                  </Form.Field>
                  <Button
                    size="huge"
                    color="teal"
                    loading={this.state.checkGameLoading}
                  >
                    Check Game
                  </Button>
                </Form>
              </center>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        {this.state.summaryGameID ? (
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
                    Game #{this.state.summaryGameID}
                  </h2>
                </center>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row centered columns={2} hidden="true">
              <Grid.Column color="grey">
                <p>
                  <strong>Player:</strong> {this.state.summaryPlayer}
                </p>
                <p>
                  <strong>Bet:</strong>{" "}
                  {web3.utils.fromWei(this.state.summaryBet, "ether")} ETH
                </p>
                <p>
                  <strong>Pick:</strong> {this.state.summaryPick}
                </p>
                <p>
                  <strong>Winning Number:</strong>{" "}
                  {this.state.summaryWinningNumber}
                </p>
                <p>
                  <strong>{this.state.summaryStatus}</strong>
                </p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        ) : null}
      </Layout>
    );
  }
}

export default Play;
