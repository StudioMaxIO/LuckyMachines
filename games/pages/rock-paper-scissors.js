import React, { Component } from "react";
import {
  Card,
  Grid,
  Container,
  Header,
  Button,
  Form,
  Input,
  Message,
  Label,
} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
import web3 from "../ethereum/web3";
import RPS from "../components/RPS";
import ZoomFreeze from "../components/ZoomFreeze";
import LuckyMachine from "../ethereum/luckyMachine";
const s = require("../settings");

class RockPaperScissors extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: "",
      bet: "",
      loading: false,
      animating: false,
      displayInitialBG: true,
      displayWinnerRock: false,
      displayWinnerPaper: false,
      displayWinnerScissors: false,
      displayGameInfo: false,
      buttonsDisabled: false,
      pick: 1,
      gameIDInput: "",
      checkGameLoading: false,
      checkGameErrorMessage: "",
      summaryGameID: "",
      summaryPlayer: "",
      summaryBet: "",
      summaryPick: "",
      summaryWinningNumber: "",
      summaryPlayed: false,
      summaryGameRefunded: false,
    };
    this.rockPressed = this.rockPressed.bind(this);
    this.paperPressed = this.paperPressed.bind(this);
    this.scissorsPressed = this.scissorsPressed.bind(this);
    this.loadGame = this.loadGame.bind(this);
    this.reloadGame = this.reloadGame.bind(this);
  }

  static async getInitialProps(props) {
    this._isMounted = false;
    const luckyMachine = LuckyMachine(s.ROCK_PAPER_SCISSORS_MACHINE);
    const summary = await luckyMachine.methods.getSummary().call();

    return {
      minimumBet: summary[0],
      maximumBet: summary[1],
      maximumPick: summary[3],
      payout: summary[2],
      gameID: props.query.gameID,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    if (global.chainID == "0") {
      global.chainID = await web3.eth.getChainId();
    }
    if (global.chainID != s.REQUIRED_CHAIN_ID) {
      window.location.assign("/incorrect-chain");
    } else {
      this.setState({
        bet: web3.utils.fromWei(this.props.minimumBet, "ether"),
      });
      if (this.props.gameID != "") {
        this.loadGame();
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async loadGame() {
    console.log("Loading game...");
    this.setState({
      checkGameLoading: true,
      errorMessage: "",
    });
    // load game summary from id
    try {
      //if data loaded, set state
      const accounts = await web3.eth.getAccounts();
      const luckyMachine = await LuckyMachine(s.ROCK_PAPER_SCISSORS_MACHINE);
      const gameSummary = await luckyMachine.methods
        .games(this.props.gameID)
        .call();
      console.log("Game Summary: ", gameSummary);
      this.setState({
        summaryGameID: gameSummary.id,
        summaryPlayer: gameSummary.player,
        summaryBet: gameSummary.bet,
        summaryPick: gameSummary.pick,
        summaryWinningNumber: gameSummary.winner,
        summaryPlayed: gameSummary.played,
        checkGameErrorMessage: "",
      });
      if (gameSummary.winner != "0") {
        this.setState({
          displayInitialBG: false,
          animating: false,
          buttonsDisabled: false,
          displayWinnerRock: gameSummary.winner == "1",
          displayWinnerPaper: gameSummary.winner == "2",
          displayWinnerScissors: gameSummary.winner == "3",
          displayGameInfo: true,
        });
      } else {
        this.setState({
          animating: true,
          buttonsDisabled: true,
          displayInitialBG: false,
        });

        setTimeout(location.reload.bind(location), 10000);
      }
    } catch (err) {
      this.setState({ checkGameErrorMessage: err.message });
    }
    this.setState({ checkGameLoading: false, errorMessage: "" });
  }

  reloadGame = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const luckyMachine = await LuckyMachine(s.ROCK_PAPER_SCISSORS_MACHINE);
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
        checkGameErrorMessage: "",
      });
      if (gameSummary.winner === "0") {
        //set timer to recheck
        this.setState({
          animating: true,
          buttonsDisabled: true,
          displayInitialBG: false,
        });
        setTimeout(this.reloadGame, 10000);
      } else {
        // display winning value
        this.setState({
          animating: false,
          buttonsDisabled: false,
          displayGameInfo: true,
          displayWinnerRock: gameSummary.winner == "1",
          displayWinnerPaper: gameSummary.winner == "2",
          displayWinnerScissors: gameSummary.winner == "3",
        });
      }
    } catch (err) {
      this.setState({ checkGameErrorMessage: err.message });
    }
  };

  checkGame = async (event) => {
    event.preventDefault();
    this.setState({ checkGameLoading: true, errorMessage: "" });
    if (this.props.gameID == "") {
      const gameURL = "/rock-paper-scissors/g/" + this.state.gameIDInput;
      window.location.assign(gameURL);
    } else {
      this.reloadGame();
    }
    this.setState({ checkGameLoading: false, errorMessage: "" });
  };

  reloadWhenGameFinished = async () => {
    const accounts = await web3.eth.getAccounts();
    const luckyMachine = await LuckyMachine(s.ROCK_PAPER_SCISSORS_MACHINE);
    const gameID = await luckyMachine.methods
      .lastGameCreated(accounts[0])
      .call();
    const gameSummary = await luckyMachine.methods.games(gameID).call();

    if (gameSummary.winner === "0") {
      setTimeout(await this.reloadWhenGameFinished(), 5000);
    } else {
      const gameURL = "/rock-paper-scissors/g/" + gameID;
      window.location.assign(gameURL);
    }
  };

  placeBet = async () => {
    this.setState({ loading: true, errorMessage: "" });
    const weiBet = web3.utils.toWei(this.state.bet, "ether");
    const accounts = await web3.eth.getAccounts();
    const luckyMachine = await LuckyMachine(s.ROCK_PAPER_SCISSORS_MACHINE);
    const payable = await luckyMachine.methods.betPayable(weiBet).call();
    const betInRange = true;
    if (parseInt(weiBet) < parseInt(this.props.minimumBet)) {
      betInRange = false;
    }
    if (parseInt(weiBet) > parseInt(this.props.maximumBet)) {
      betInRange = false;
    }
    const canPayLINKFee = await luckyMachine.methods
      .canPayFee(s.LINK_FEE * 10 ** 18)
      .call();
    if (betInRange) {
      if (payable) {
        if (canPayLINKFee) {
          try {
            await luckyMachine.methods
              .placeBetFor(accounts[0], this.state.pick)
              .send({
                from: accounts[0],
                value: web3.utils.toWei(this.state.bet, "ether"),
              });
          } catch (err) {
            this.setState({
              errorMessage: err.message,
              animating: false,
              displayInitialBG: true,
              buttonsDisabled: false,
            });
          }
        } else {
          this.setState({
            errorMessage:
              "Machine does not have enough LINK to request random number.",
            animating: false,
            displayInitialBG: true,
            buttonsDisabled: false,
          });
        }
      } else {
        this.setState({
          errorMessage:
            "Machine unable to pay out winnings. Try again later or try another machine.",
          animating: false,
          displayInitialBG: true,
          buttonsDisabled: false,
        });
      }
    } else {
      const rangeError =
        "Bet outside of range of " +
        web3.utils.fromWei(this.props.minimumBet, "ether") +
        " MATIC - " +
        web3.utils.fromWei(this.props.maximumBet, "ether") +
        " MATIC";
      this.setState({
        errorMessage: rangeError,
        animating: false,
        displayInitialBG: true,
        buttonsDisabled: false,
      });
    }
    this.setState({ loading: false });
    this.reloadWhenGameFinished();
  };

  rockPressed() {
    console.log("Rock Pressed");
    //rock beats scissors, scissors = 3, bet to beat scissors = bet on 3
    this.setState({
      animating: true,
      buttonsDisabled: true,
      pick: 3,
      displayWinnerRock: false,
      displayWinnerPaper: false,
      displayWinnerScissors: false,
      displayGameInfo: false,
      displayInitialBG: false,
    });
    this.placeBet();
  }

  paperPressed() {
    console.log("Paper Pressed");
    //paper beats rock, rock = 1, bet to beat rock = bet on 1
    this.setState({
      animating: true,
      buttonsDisabled: true,
      pick: 1,
      displayWinnerRock: false,
      displayWinnerPaper: false,
      displayWinnerScissors: false,
      displayGameInfo: false,
      displayInitialBG: false,
    });
    this.placeBet();
  }

  scissorsPressed() {
    console.log("Scissors Pressed");
    //scissors beats paper, paper = 2, bet to beat paper = bet on 2
    this.setState({
      animating: true,
      buttonsDisabled: true,
      pick: 2,
      displayWinnerRock: false,
      displayWinnerPaper: false,
      displayWinnerScissors: false,
      displayGameInfo: false,
      displayInitialBG: false,
    });
    this.placeBet();
  }

  render() {
    const cpuSymbols = { 1: "👊", 2: "✋", 3: "✌️" };
    const playerSymbols = { 1: "✋", 2: "✌️", 3: "👊" };
    return (
      <Layout page="games">
        <Grid centered columns={5} style={{ marginTop: "10px" }}>
          <Grid.Row color="black">
            <h1
              style={{
                textColor: "white",
                fontSize: "4em",
                fontWeight: "normal",
              }}
            >
              Rock, Paper, Scissors!
            </h1>
          </Grid.Row>
          <Grid.Row color="black">
            <div
              style={{
                margin: "auto",
                height: "150px",
                width: "75%",
              }}
            >
              <div
                style={{
                  display: this.state.displayInitialBG ? "inline" : "none",
                }}
              >
                <center>
                  <p style={{ fontSize: "100px" }}>👊 ✋✌️</p>
                </center>
              </div>
              <div
                style={{
                  display: this.state.displayWinnerRock ? "inline" : "none",
                }}
              >
                <ZoomFreeze>
                  <h1 style={{ fontSize: "100px" }}>👊</h1>
                </ZoomFreeze>
              </div>
              <div
                style={{
                  display: this.state.displayWinnerPaper ? "inline" : "none",
                }}
              >
                <ZoomFreeze>
                  <h1 style={{ fontSize: "100px" }}>✋</h1>
                </ZoomFreeze>
              </div>
              <div
                style={{
                  display: this.state.displayWinnerScissors ? "inline" : "none",
                }}
              >
                <ZoomFreeze>
                  <h1 style={{ fontSize: "100px" }}>✌️</h1>
                </ZoomFreeze>
              </div>
              <div
                style={{ display: this.state.animating ? "inline" : "none" }}
              >
                <RPS>{[<h1 style={{ fontSize: "100px" }}>👊</h1>, 1]}</RPS>
                <RPS>{[<h1 style={{ fontSize: "100px" }}>✋</h1>, 2]}</RPS>
                <RPS>{[<h1 style={{ fontSize: "100px" }}>✌️</h1>, 3]}</RPS>
              </div>
            </div>
          </Grid.Row>
          <Grid.Row color="black">
            <Grid.Column style={{ marginTop: "-10px" }}>
              <center>
                <p>
                  Minimum Bet:
                  <br />
                  <strong>
                    {web3.utils.fromWei(this.props.minimumBet, "ether")} MATIC
                  </strong>
                </p>
              </center>
            </Grid.Column>
            <Grid.Column style={{ marginTop: "-10px" }}>
              <center>
                <p>
                  Maximum Bet:
                  <br />
                  <strong>
                    {web3.utils.fromWei(this.props.maximumBet, "ether")} MATIC
                  </strong>
                </p>
              </center>
            </Grid.Column>
            <Grid.Column style={{ marginTop: "-10px" }}>
              <center>
                <p>
                  Payout:
                  <br /> <strong>{this.props.payout}:1</strong>
                </p>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row color="black" centered>
            <Form onSubmit={this.placeBet} error={!!this.state.errorMessage}>
              <Form.Group>
                <Form.Field>
                  <Label
                    color="blue"
                    style={{
                      marginTop: "-10px",
                      marginBottom: "5px",
                      padding: "5px",
                    }}
                  >
                    Bet
                  </Label>
                  <Input
                    label="MATIC"
                    labelPosition="right"
                    value={this.state.bet}
                    style={{
                      padding: "5px",
                      marginBottom: "-10px",
                      zIndex: "1000",
                    }}
                    onChange={(event) =>
                      this.setState({ bet: event.target.value })
                    }
                  />
                </Form.Field>
              </Form.Group>
              <Message error header="Oops!" content={this.state.errorMessage} />
            </Form>
          </Grid.Row>
          <Grid.Row color="black" style={{ marginTop: "-20px" }}>
            <Button
              disabled={this.state.buttonsDisabled}
              color="blue"
              size="huge"
              onClick={this.rockPressed}
            >
              👊
            </Button>
            <Button
              disabled={this.state.buttonsDisabled}
              color="blue"
              size="huge"
              onClick={this.paperPressed}
            >
              ✋
            </Button>
            <Button
              disabled={this.state.buttonsDisabled}
              color="blue"
              size="huge"
              onClick={this.scissorsPressed}
            >
              ✌️
            </Button>
          </Grid.Row>
          <Grid.Row color="black" style={{ marginTop: "-10px" }}>
            <div
              style={{
                display: this.state.displayGameInfo ? "inline" : "none",
              }}
            >
              Your Pick: {playerSymbols[this.state.summaryPick]}
              <br />{" "}
              {this.state.summaryPick == this.state.summaryWinningNumber
                ? "Winner!"
                : "Not a winner"}
              <br />({playerSymbols[this.state.summaryPick]}{" "}
              {this.state.summaryPick == this.state.summaryWinningNumber
                ? " beats "
                : " does not beat "}{" "}
              {cpuSymbols[this.state.summaryWinningNumber]})
            </div>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default RockPaperScissors;
