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
    this.setState({
      bet: web3.utils.fromWei(this.props.minimumBet, "ether")
    });
    if (this.props.gameID != "") {
      //this.setState({ summaryGameID: this.props.gameID });
      this.loadGame();
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

            console.log("Game ID:", gameID);
            const gameURL = "/play/" + this.props.address + "/g/" + gameID;
            window.location.assign(gameURL);
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
        summaryWinningNumber:
          gameSummary.winner == "0" ? "pending..." : gameSummary.winner,
        summaryStatus:
          gameSummary.winner == "0"
            ? "Awaiting Random Number"
            : gameSummary.winner == gameSummary.pick
            ? "Winner!"
            : "Not a winner",
        checkGameErrorMessage: ""
      });
    } catch (err) {
      this.setState({ checkGameErrorMessage: err.message });
    }
    this.setState({ checkGameLoading: false, errorMessage: "" });
  }

  reloadGame = async event => {
    event.preventDefault();
    try {
      const accounts = await web3.eth.getAccounts();
      const luckyMachine = await LuckyMachine(this.props.address);
      const gameSummary = await luckyMachine.methods
        .games(this.props.gameID)
        .call();
      this.setState({
        summaryGameID: gameSummary.id,
        summaryPlayer: gameSummary.player,
        summaryBet: gameSummary.bet,
        summaryPick: gameSummary.pick,
        summaryWinningNumber:
          gameSummary.winner == "0" ? "pending..." : gameSummary.winner,
        summaryStatus:
          gameSummary.winner == "0"
            ? "Awaiting Random Number"
            : gameSummary.winner == gameSummary.pick
            ? "Winner!"
            : "Not a winner",
        checkGameErrorMessage: ""
      });
    } catch (err) {
      this.setState({ checkGameErrorMessage: err.message });
    }
  };

  checkGame = async event => {
    event.preventDefault();
    this.setState({ checkGameLoading: true, errorMessage: "" });
    // load game summary from id
    const gameURL =
      "/play/" + this.props.address + "/g/" + this.state.gameIDInput;
    this.setState({ checkGameLoading: false, errorMessage: "" });
    window.location.assign(gameURL);
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
                  <a href="#">
                    <Icon name="redo" onClick={this.reloadGame} />
                  </a>
                </center>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row centered columns={2}>
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
                  <strong>Game Result:</strong> {this.state.summaryStatus}
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
