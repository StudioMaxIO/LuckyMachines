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
  Menu,
  Icon
} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
import LuckyMachine from "../ethereum/luckyMachine";
import web3 from "../ethereum/web3";
const s = require("../settings");

class Play extends Component {
  state = {
    bet: "",
    pick: 1,
    gameIDInput: "",
    checkGameLoading: false,
    checkGameErrorMessage: "",
    loading: false,
    errorMessage: "",
    summaryGameID: "",
    summaryPlayer: "",
    summaryBet: "",
    summaryPick: "",
    summaryWinningNumber: "",
    summaryPlayed: false,
    requestRefundErrorMessage: "",
    requestRefundLoading: false,
    summaryGameRefunded: false
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
    if (global.chainID == "0") {
      global.chainID = await web3.currentProvider.request({
        method: "eth_chainId"
      });
    }
    if (global.chainID != s.REQUIRED_CHAIN_ID) {
      window.location.assign("/incorrect-chain");
    } else {
      this.setState({
        bet: web3.utils.fromWei(this.props.minimumBet, "ether")
      });
      if (this.props.gameID != "") {
        //this.setState({ summaryGameID: this.props.gameID });
        this.loadGame();
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  displayPickerValues() {
    const final = [];
    //console.log("Max pick: ", this.props.maximumPick);
    for (var i = 1; i < Number(this.props.maximumPick) + 1; i++) {
      final.push(
        <Button
          key={i.toString()}
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
    const weiBet = web3.utils.toWei(this.state.bet, "ether");
    const accounts = await web3.eth.getAccounts();
    const luckyMachine = await LuckyMachine(this.props.address);
    const payable = await luckyMachine.methods.betPayable(weiBet).call();
    const betInRange =
      weiBet >= this.props.minimumBet && weiBet <= this.props.maximumBet;
    const linkBalance = await luckyMachine.methods.getLinkBalance().call();
    const linkAvailable = linkBalance >= 0.1 * (10 ^ 18);
    if (betInRange) {
      if (payable) {
        if (linkAvailable) {
          try {
            await luckyMachine.methods
              .placeBetFor(accounts[0], this.state.pick)
              .send({
                from: accounts[0],
                value: web3.utils.toWei(this.state.bet, "ether")
              });
            const gameID = await luckyMachine.methods
              .lastGameCreated(accounts[0])
              .call();

            if (this.props.gameID == "") {
              const gameURL = "/play/" + this.props.address + "/g/" + gameID;
              window.location.assign(gameURL);
            } else {
              this.setState({ gameIDInput: gameID });
              this.reloadGame();
            }
          } catch (err) {
            this.setState({ errorMessage: err.message });
          }
        } else {
          this.setState({
            errorMessage:
              "Machine does not have enough LINK to request random number."
          });
        }
      } else {
        this.setState({
          errorMessage:
            "Machine unable to pay out winnings. Try again later or try another machine."
        });
      }
    } else {
      const rangeError =
        "Bet outside of range of " +
        web3.utils.fromWei(this.props.minimumBet, "ether") +
        "ETH - " +
        web3.utils.fromWei(this.props.maximumBet, "ether") +
        "ETH";
      this.setState({
        errorMessage: rangeError
      });
    }
    this.setState({ loading: false });
  };

  async loadGame() {
    this.setState({ checkGameLoading: true, errorMessage: "" });
    // load game summary from id
    try {
      //if data loaded, set state
      const accounts = await web3.eth.getAccounts();
      const luckyMachine = await LuckyMachine(this.props.address);
      const gameSummary = await luckyMachine.methods
        .games(this.props.gameID)
        .call();
      //console.log("Game Summary: ", gameSummary);
      this.setState({
        summaryGameID: gameSummary.id,
        summaryPlayer: gameSummary.player,
        summaryBet: gameSummary.bet,
        summaryPick: gameSummary.pick,
        summaryWinningNumber: gameSummary.winner,
        summaryPlayed: gameSummary.played,
        checkGameErrorMessage: ""
      });
    } catch (err) {
      this.setState({ checkGameErrorMessage: err.message });
    }
    this.setState({ checkGameLoading: false, errorMessage: "" });
  }

  reloadGame = async event => {
    if (event) {
      event.preventDefault();
    }
    this.setState({ requestRefundErrorMessage: false });
    try {
      const accounts = await web3.eth.getAccounts();
      const luckyMachine = await LuckyMachine(this.props.address);
      const gameSummary = await luckyMachine.methods
        .games(this.state.gameIDInput)
        .call();
      this.setState({
        summaryGameID: gameSummary.id,
        summaryPlayer: gameSummary.player,
        summaryBet: gameSummary.bet,
        summaryPick: gameSummary.pick,
        summaryWinningNumber: gameSummary.winner,
        summaryPlayed: gameSummary.played,
        checkGameErrorMessage: ""
      });
    } catch (err) {
      this.setState({ checkGameErrorMessage: err.message });
    }
  };

  checkGame = async event => {
    event.preventDefault();
    this.setState({ checkGameLoading: true, errorMessage: "" });
    if (this.props.gameID == "") {
      const gameURL =
        "/play/" + this.props.address + "/g/" + this.state.gameIDInput;
      window.location.assign(gameURL);
    } else {
      this.reloadGame();
    }
    this.setState({ checkGameLoading: false, errorMessage: "" });
  };

  requestRefund = async event => {
    if (event) {
      event.preventDefault();
    }
    try {
      const accounts = await web3.eth.getAccounts();
      const luckyMachine = await LuckyMachine(this.props.address);
      const gameInfo = await luckyMachine.methods
        .games(this.state.summaryGameID)
        .call();
      if (!gameInfo.played) {
        await luckyMachine.methods
          .requestRefund(this.state.summaryGameID)
          .send({ from: accounts[0] });
      } else {
        this.setState({ summaryGameRefunded: true });
        this.setState({
          requestRefundErrorMessage: "Game already played. Cannot refund."
        });
      }
    } catch (err) {
      this.setState({ requestRefundErrorMessage: err.message });
    }
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
              </Form.Group>
              <Message error header="Oops!" content={this.state.errorMessage} />
              <Button loading={this.state.loading} color="orange" size="huge">
                Place Bet
              </Button>
            </Form>
          </Grid.Row>
        </Grid>
        <Grid style={{ paddingTop: "10px" }}>
          <Grid.Row centered>
            <Grid.Column color="black">
              <center>
                <Form onSubmit={this.checkGame}>
                  <Form.Field>
                    <Input
                      placeholder="Game ID"
                      value={this.state.gameIDInput}
                      onChange={event =>
                        this.setState({ gameIDInput: event.target.value })
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
          <Grid style={{ paddingTop: "0px" }}>
            <Grid.Row
              centered
              style={{
                backgroundColor: "#313131",
                color: "white"
              }}
            >
              <Grid.Column>
                <center>
                  <h2
                    style={{
                      textColor: "black",
                      fontWeight: "normal"
                    }}
                  >
                    {this.state.summaryGameID != "0"
                      ? "Game #" + this.state.summaryGameID
                      : "No Game Found"}
                  </h2>
                  <a href="#">
                    <Icon name="redo" onClick={this.reloadGame} />
                  </a>
                </center>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row centered>
              <Grid.Column color="grey">
                <p>
                  <strong>Player:</strong>{" "}
                  {this.state.summaryPlayer !=
                  "0x0000000000000000000000000000000000000000"
                    ? this.state.summaryPlayer
                    : ""}
                </p>
                <p>
                  <strong>Bet:</strong>{" "}
                  {this.state.summaryBet != "0"
                    ? web3.utils.fromWei(this.state.summaryBet, "ether") + "ETH"
                    : ""}
                </p>
                <p>
                  <strong>Pick:</strong>{" "}
                  {this.state.summaryPick != "0" ? this.state.summaryPick : ""}
                </p>
                <p>
                  <strong>Winning Number:</strong>{" "}
                  {this.state.summaryGameID == "0"
                    ? ""
                    : this.state.summaryWinningNumber == "0"
                    ? this.state.summaryPlayed
                      ? "None selected"
                      : "Pending..."
                    : this.state.summaryWinningNumber}
                </p>
                <p>
                  <strong>Game Result:</strong>{" "}
                  {this.state.summaryGameID == "0"
                    ? ""
                    : this.state.summaryWinningNumber == "0"
                    ? this.state.summaryPlayed
                      ? "Refunded / Canceled"
                      : "Awaiting Random Number"
                    : this.state.summaryWinningNumber == this.state.summaryPick
                    ? "Winner!"
                    : "Not a winner"}
                </p>
                <p>
                  <a
                    href="#"
                    style={{ color: "#fe7e7e" }}
                    onClick={this.requestRefund}
                  >
                    {this.state.summaryGameRefunded
                      ? ""
                      : this.state.summaryGameID != "0" &&
                        this.state.summaryWinningNumber == "0" &&
                        this.state.summaryPlayed == false
                      ? "Request Refund"
                      : ""}
                  </a>
                  <span style={{ color: "#fe7e7e" }}>
                    &nbsp;{this.state.requestRefundErrorMessage}
                  </span>
                </p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        ) : null}
        <Grid>
          <Grid.Row></Grid.Row>
          <Grid.Row></Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default Play;
