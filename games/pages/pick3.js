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
  Icon,
} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
import LuckyMachineJackpot from "../ethereum/luckyMachineJackpot";
import Jackpots from "../ethereum/jackpots";
import web3 from "../ethereum/web3";
const s = require("../settings");

class Pick3 extends Component {
  state = {
    bet: "",
    pick1: 1,
    pick2: 1,
    pick3: 1,
    gameIDInput: "",
    checkGameLoading: false,
    checkGameErrorMessage: "",
    loading: false,
    errorMessage: "",
    summaryGameID: "",
    summaryPlayer: "",
    summaryBet: "",
    summaryPicks: [],
    summaryWinners: [],
    summaryPayout: "",
    summaryPlayed: false,
    requestRefundErrorMessage: "",
    requestRefundLoading: false,
    summaryGameRefunded: false,
    currentJackpot: "",
  };

  static async getInitialProps(props) {
    this._isMounted = false;

    const luckyMachineJackpot = LuckyMachineJackpot(s.PICK_3_MACHINE);
    const summary = await luckyMachineJackpot.methods
      .getJackpotMachineSummary()
      .call();

    const jackpots = await Jackpots(s.JACKPOTS);
    const jackpot = await jackpots.methods
      .getBalanceOf(s.PICK_3_MACHINE)
      .call();
    console.log("Jackpot:", jackpot);
    // 0=entryFee, 1=payoutTiers, 2=payouts,
    // 3=maxPick, 4=totalPicks, 5=currentJackpot, 6=jackpotContribution
    let payoutsString = "";
    for (let i = 0; i < summary[2].length; i++) {
      const pluralMatch = summary[1][i] > 1 ? " Matches: " : " Match: ";
      if (i > 0) {
        payoutsString +=
          ", " +
          String(summary[1][i]) +
          pluralMatch +
          web3.utils.fromWei(summary[2][i], "ether") +
          " MATIC";
      } else {
        payoutsString +=
          String(summary[1][i]) +
          pluralMatch +
          web3.utils.fromWei(summary[2][i], "ether") +
          " MATIC";
      }
    }
    console.log("Payouts String", payoutsString);
    return {
      address: s.PICK_3_MACHINE,
      entryFee: summary[0],
      payoutTiers: summary[1],
      payouts: summary[2],
      payoutsString: payoutsString,
      maximumPick: summary[3],
      totalPicks: summary[4],
      jackpotContribution: summary[6],
      gameID: props.query.gameID,
      jackpot: jackpot,
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
        bet: web3.utils.fromWei(this.props.entryFee, "ether"),
      });
      if (this.props.gameID != "") {
        this.setState({ summaryGameID: this.props.gameID });
        this.loadGame();
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  displayPickerValues(picker) {
    const final = [];
    let isActive;
    let selectFunction;
    for (var i = 1; i < Number(this.props.maximumPick) + 1; i++) {
      switch (picker) {
        case 1:
          isActive = this.state.pick1 === i;
          selectFunction = this.selectNumber1;
          break;
        case 2:
          isActive = this.state.pick2 === i;
          selectFunction = this.selectNumber2;
          break;
        case 3:
          isActive = this.state.pick3 === i;
          selectFunction = this.selectNumber3;
          break;
        default:
          isActive = false;
      }
      final.push(
        <Button
          key={i.toString()}
          size="mini"
          style={{ margin: "5px" }}
          onClick={selectFunction}
          name={i}
          active={isActive}
        >
          {i}
        </Button>
      );
    }
    return <div>{final}</div>;
  }

  selectNumber1 = (e, { name }) => {
    this.setState({ pick1: name });
  };

  selectNumber2 = (e, { name }) => {
    this.setState({ pick2: name });
  };

  selectNumber3 = (e, { name }) => {
    this.setState({ pick3: name });
  };

  placeBet = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, errorMessage: "" });
    const playerPicks = [this.state.pick1, this.state.pick2, this.state.pick3];
    const weiBet = web3.utils.toWei(this.state.bet, "ether");
    const accounts = await web3.eth.getAccounts();
    const luckyMachineJackpot = await LuckyMachineJackpot(s.PICK_3_MACHINE);
    const payable = await luckyMachineJackpot.methods.betPayable(weiBet).call();

    const canPayLINKFee = await luckyMachineJackpot.methods
      .canPayFee(s.LINK_FEE * 10 ** 18)
      .call();
    if (payable) {
      if (canPayLINKFee) {
        try {
          await luckyMachineJackpot.methods
            .placeJackpotBetFor(accounts[0], playerPicks)
            .send({
              from: accounts[0],
              value: web3.utils.toWei(this.state.bet, "ether"),
            });
          const gameID = await luckyMachineJackpot.methods
            .lastGameCreated(accounts[0])
            .call();
          if (this.props.gameID == "") {
            const gameURL = "/pick3/g/" + gameID;
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
            "Machine does not have enough LINK to request random number.",
        });
      }
    } else {
      this.setState({
        errorMessage:
          "Machine unable to pay out winnings. Try again later or try another machine.",
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
      const luckyMachineJackpot = await LuckyMachineJackpot(this.props.address);

      const gameSummary = await luckyMachineJackpot.methods
        .jackpotGames(this.props.gameID)
        .call();
      console.log("Game Summary: ", gameSummary);

      const playedPicks = await luckyMachineJackpot.methods
        .getPlayedPicks(this.props.gameID)
        .call();
      console.log("Played Picks: ", playedPicks);

      const winningNumbers = await luckyMachineJackpot.methods
        .getWinningNumbers(this.props.gameID)
        .call();
      console.log("Winning Numbers: ", winningNumbers);

      this.setState({
        summaryGameID: gameSummary.id,
        summaryPlayer: gameSummary.player,
        summaryBet: gameSummary.bet,
        summaryPicks: playedPicks,
        summaryWinners: winningNumbers,
        summaryPayout: gameSummary.payout,
        summaryPlayed: gameSummary.played,
        checkGameErrorMessage: "",
      });
    } catch (err) {
      this.setState({ checkGameErrorMessage: err.message });
    }
    this.setState({ checkGameLoading: false, errorMessage: "" });
  }

  reloadGame = async (event) => {
    if (event) {
      event.preventDefault();
    }
    this.setState({ requestRefundErrorMessage: false });
    try {
      const accounts = await web3.eth.getAccounts();
      const luckyMachineJackpot = await LuckyMachineJackpot(this.props.address);
      const gameSummary = await luckyMachineJackpot.methods
        .jackpotGames(this.state.gameIDInput)
        .call();
      const playerPicks = await luckyMachineJackpot.methods
        .getPlayedPicks(gameSummary.id)
        .call();
      const winningNumbers = await luckyMachineJackpot.methods
        .getWinningNumbers(gameSummary.id)
        .call();
      this.setState({
        summaryGameID: gameSummary.id,
        summaryPlayer: gameSummary.player,
        summaryBet: gameSummary.bet,
        summaryPicks: playerPicks,
        summaryWinners: winningNumbers,
        summaryPayout: gameSummary.payout,
        summaryPlayed: gameSummary.played,
      });
      if (!gameSummary.played) {
        //set timer to recheck
        setTimeout(this.reloadGame, 20000);
      }
    } catch (err) {
      this.setState({ checkGameErrorMessage: err.message });
    }
  };

  checkGame = async (event) => {
    event.preventDefault();
    this.setState({ checkGameLoading: true, errorMessage: "" });
    if (this.props.gameID == "") {
      const gameURL = "/pic3/g/" + this.state.gameIDInput;
      window.location.assign(gameURL);
    } else {
      this.reloadGame();
    }
    this.setState({ checkGameLoading: false, errorMessage: "" });
  };

  requestRefund = async (event) => {
    if (event) {
      event.preventDefault();
    }
    try {
      const accounts = await web3.eth.getAccounts();
      const luckyMachineJackpot = await LuckyMachineJackpot(this.props.address);
      const gameInfo = await luckyMachine.methods
        .jackpotGames(this.state.summaryGameID)
        .call();
      if (!gameInfo.played) {
        await luckyMachineJackpot.methods
          .requestRefund(this.state.summaryGameID)
          .send({ from: accounts[0] });
      } else {
        this.setState({ summaryGameRefunded: true });
        this.setState({
          requestRefundErrorMessage: "Game already played. Cannot refund.",
        });
      }
    } catch (err) {
      this.setState({ requestRefundErrorMessage: err.message });
    }
  };

  render() {
    return (
      <Layout page="games">
        <Grid centered columns={6} style={{ marginTop: "10px" }}>
          <Grid.Row color="black">
            <h1
              style={{
                textColor: "white",
                fontSize: "4em",
                fontWeight: "normal",
                zIndex: "600",
              }}
            >
              Pick 3
            </h1>
          </Grid.Row>
          <Grid.Row color="black" style={{ marginTop: "-35px" }}>
            <h2 style={{ zIndex: "500", marginBottom: "10px" }}>
              (Rolling Jackpot)
            </h2>
          </Grid.Row>
          <Grid.Row
            columns={"3"}
            style={{ backgroundColor: "#AAD9FF", marginTop: "-10px" }}
          >
            <Grid.Column>
              <center>
                <p>
                  <strong>Entry Fee:</strong>
                  <br />
                  {web3.utils.fromWei(this.props.entryFee, "ether")} MATIC
                </p>
              </center>
            </Grid.Column>
            <Grid.Column>
              <center>
                <p>
                  <strong>Payouts:</strong>
                  <br /> {this.props.payoutsString}
                </p>
              </center>
            </Grid.Column>
            <Grid.Column>
              <center>
                <p>
                  <strong>Jackpot:</strong>
                  <br />{" "}
                  {this.props.jackpot > 0
                    ? web3.utils.fromWei(String(this.props.jackpot), "ether")
                    : "0"}{" "}
                  MATIC
                </p>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2} style={{ backgroundColor: "#AAD9FF" }}>
            <Grid.Column>
              <center>
                <Card
                  style={{ backgroundColor: "#FDF4DB", paddingBottom: "5px" }}
                >
                  <Grid.Row>
                    <center>
                      <Label
                        color="black"
                        style={{
                          marginTop: "5px",
                          marginBottom: "5px",
                          zIndex: "1000",
                        }}
                      >
                        Pick #1
                      </Label>
                    </center>
                  </Grid.Row>
                  <Grid.Row>
                    <center>{this.displayPickerValues(1)}</center>
                  </Grid.Row>
                </Card>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2} style={{ backgroundColor: "#AAD9FF" }}>
            <Grid.Column>
              <center>
                <Card
                  style={{ backgroundColor: "#FDF4DB", paddingBottom: "5px" }}
                >
                  <Grid.Row>
                    <center>
                      <Label
                        color="black"
                        style={{
                          marginTop: "5px",
                          marginBottom: "5px",
                          zIndex: "1000",
                        }}
                      >
                        Pick #2
                      </Label>
                    </center>
                  </Grid.Row>
                  <Grid.Row>
                    <center>{this.displayPickerValues(2)}</center>
                  </Grid.Row>
                </Card>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2} style={{ backgroundColor: "#AAD9FF" }}>
            <Grid.Column>
              <center>
                <Card
                  style={{ backgroundColor: "#FDF4DB", paddingBottom: "5px" }}
                >
                  <Grid.Row>
                    <center>
                      <Label
                        color="black"
                        style={{
                          marginTop: "5px",
                          marginBottom: "5px",
                          zIndex: "1000",
                        }}
                      >
                        Pick #3
                      </Label>
                    </center>
                  </Grid.Row>
                  <Grid.Row>
                    <center>{this.displayPickerValues(3)}</center>
                  </Grid.Row>
                </Card>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ backgroundColor: "#AAD9FF" }} centered>
            <Form onSubmit={this.placeBet} error={!!this.state.errorMessage}>
              <Message error header="Oops!" content={this.state.errorMessage} />
              <Button
                loading={this.state.loading}
                style={{
                  backgroundColor: "#00D792",
                  color: "white",
                  marginBottom: "10px",
                }}
                size="huge"
              >
                Play
              </Button>
            </Form>
          </Grid.Row>
        </Grid>
        <Grid>
          <Grid.Row style={{ backgroundColor: "#00875C" }} centered>
            <Grid.Column>
              <center>
                <Form onSubmit={this.checkGame}>
                  <Form.Field>
                    <Input
                      placeholder="Game ID"
                      value={this.state.gameIDInput}
                      style={{ paddingRight: "100px", paddingLeft: "100px" }}
                      onChange={(event) =>
                        this.setState({ gameIDInput: event.target.value })
                      }
                    />
                  </Form.Field>
                  <Button
                    size="huge"
                    style={{ backgroundColor: "#FF874C", color: "white" }}
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
                backgroundColor: "#016646",
                color: "white",
              }}
            >
              <Grid.Column>
                <center>
                  <h2
                    style={{
                      fontWeight: "normal",
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
            <Grid.Row style={{ backgroundColor: "#00875C", color: "white" }}>
              <Grid.Column>
                <p>
                  <strong>Game Result:</strong>
                  {this.state.summaryGameID == "0"
                    ? ""
                    : this.state.summaryPayout > 0
                    ? " Winner!"
                    : this.state.summaryWinners.toString() == "0,0,0"
                    ? " Pending..."
                    : " Not a winner"}
                </p>
                <p>
                  <strong>Player:</strong> {this.state.summaryPlayer}
                </p>
                <p>
                  <strong>Entry Fee:</strong>{" "}
                  {this.state.summaryBet != "0"
                    ? web3.utils.fromWei(this.state.summaryBet, "ether") +
                      " MATIC"
                    : ""}
                </p>
                <p>
                  <strong>Picks:</strong> {this.state.summaryPicks.toString()}
                </p>
                <p>
                  <strong>Winning Numbers:</strong>{" "}
                  {this.state.summaryGameID == "0"
                    ? ""
                    : this.state.summaryWinners.toString() == "0,0,0"
                    ? "Pending..."
                    : this.state.summaryWinners.toString()}
                </p>
                <p>
                  <strong>Payout:</strong>
                  {this.state.summaryWinners.toString() == "0,0,0"
                    ? " Pending..."
                    : web3.utils.fromWei(this.state.summaryPayout, "ether") +
                      " MATIC"}
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
      </Layout>
    );
  }
}

export default Pick3;
