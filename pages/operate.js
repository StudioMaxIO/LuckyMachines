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

class Operate extends Component {
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
    const luckyMachine = LuckyMachine(props.query.address);
    const summary = await luckyMachine.methods.getSummary().call();
    return {
      address: props.query.address,
      minimumBet: summary[0],
      maximumBet: summary[1],
      maximumPick: summary[3],
      payout: summary[2]
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
      this._isMounted && this.getBalances();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async getBalances() {
    const accounts = await web3.eth.getAccounts();
    const luckyMachine = await LuckyMachine(this.props.address);
    const owner = await luckyMachine.methods.owner().call();
    if (owner == accounts[0]) {
      const ethBalance = await web3.eth.getBalance(this.props.address);
      const linkBalance = await luckyMachine.methods.getLinkBalance().call();
      const payoutAddress = await luckyMachine.methods.payoutAddress().call();
      this.setState({
        ethBalance: ethBalance,
        linkBalance: linkBalance,
        payoutAddress: payoutAddress
      });
    } else {
      const invalidURL = "/operate/" + this.props.address + "/invalid";
      window.location.assign(invalidURL);
    }
  }

  updateBalances = async event => {
    const luckyMachine = await LuckyMachine(this.props.address);
    const ethBalance = await web3.eth.getBalance(this.props.address);
    const linkBalance = await luckyMachine.methods.getLinkBalance().call();
    const payoutAddress = await luckyMachine.methods.payoutAddress().call();
    this.setState({
      ethBalance: ethBalance,
      linkBalance: linkBalance,
      payoutAddress: payoutAddress
    });
  };

  withdrawEth = async event => {
    this.setState({ withdrawEthLoading: true });
    this.setState({ withdrawEthErrorMessage: "" });
    try {
      const accounts = await web3.eth.getAccounts();
      const luckyMachine = await LuckyMachine(this.props.address);
      await luckyMachine.methods
        .withdrawEth(web3.utils.toWei(this.state.withdrawEthAmount, "ether"))
        .send({
          from: accounts[0]
        });
      this.setState({ withdrawEthAmount: "" });
      this.updateBalances();
    } catch (err) {
      this.setState({ withdrawEthErrorMessage: err.message });
    }

    this.setState({
      withdrawEthLoading: false
    });
  };

  withdrawLink = async event => {
    this.setState({ withdrawLinkLoading: true });
    this.setState({ withdrawLinkErrorMessage: "" });
    try {
      const accounts = await web3.eth.getAccounts();
      const luckyMachine = await LuckyMachine(this.props.address);
      await luckyMachine.methods
        .withdrawLink(web3.utils.toWei(this.state.withdrawLinkAmount, "ether"))
        .send({
          from: accounts[0]
        });
      this.setState({ withdrawLinkAmount: "" });
      this.updateBalances();
    } catch (err) {
      this.setState({ withdrawLinkErrorMessage: err.message });
    }

    this.setState({
      withdrawLinkLoading: false
    });
  };

  closeMachine = async event => {
    this.setState({ closeMachineLoading: true });
    this.setState({ closeMachineErrorMessage: "" });
    try {
      const accounts = await web3.eth.getAccounts();
      const luckyMachine = await LuckyMachine(this.props.address);
      await luckyMachine.methods.closeMachine().send({
        from: accounts[0]
      });
    } catch (err) {
      this.setState({ closeMachineErrorMessage: err.message });
    }
    this.setState({ closeMachineLoading: false });
  };

  render() {
    return (
      <Layout page="operate">
        <Grid
          style={{
            marginTop: "10px",
            backgroundColor: "#99ccff",
            color: "#001433"
          }}
        >
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
            <Grid.Column></Grid.Column>
            <Grid.Column>
              <Header>Machine:</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-28px" }}>
            <Grid.Column></Grid.Column>
            <Grid.Column>
              <strong>
                <Link route={"/play/" + this.props.address}>
                  {this.props.address}
                </Link>
              </strong>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-28px" }}>
            <Grid.Column></Grid.Column>
            <Grid.Column width={"6"}>
              <a
                href={
                  "https://kovan.etherscan.io/address/" + this.props.address
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Etherscan
              </a>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-5px", zIndex: "10000" }}>
            <Grid.Column></Grid.Column>
            <Grid.Column width={"6"}>
              <Header>
                Balances{" "}
                <a href="#">
                  <Icon name="redo" onClick={this.updateBalances} />
                </a>
              </Header>{" "}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-20px", zIndex: "1000" }}>
            <Grid.Column></Grid.Column>
            <Grid.Column width={"2"}>
              <p>
                <strong>ETH:</strong>
                <br /> {web3.utils.fromWei(this.state.ethBalance, "ether")}
              </p>
            </Grid.Column>
            <Grid.Column width={"2"}>
              <p>
                <strong>LINK:</strong>
                <br /> {web3.utils.fromWei(this.state.linkBalance, "ether")}
              </p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Column></Grid.Column>
          <Grid.Row style={{ marginTop: "-50px" }}>
            <Grid.Column></Grid.Column>
            <Grid.Column width={"10"}>
              <p>
                {" "}
                To fund machine, send ETH & LINK to:
                <br />
                <span>
                  <strong
                    ref={span => (this.span = span)}
                    value={this.props.address}
                  >
                    {this.props.address}
                  </strong>
                </span>
                &nbsp;
                <a href="#">
                  <Icon
                    name="copy outline"
                    onClick={() => {
                      navigator.clipboard.writeText(this.props.address);
                    }}
                  />
                </a>
              </p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column></Grid.Column>
            <Grid.Column width={"10"}>
              <Header>Machine Settings</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-23px" }}>
            <Grid.Column></Grid.Column>
            <Grid.Column width={"3"}>
              <p>
                <strong>Minimum Bet:</strong>
                <br /> {web3.utils.fromWei(this.props.minimumBet, "ether")} ETH
              </p>
            </Grid.Column>
            <Grid.Column width={"3"}>
              <p>
                <strong>Maximum Bet:</strong> <br />
                {web3.utils.fromWei(this.props.maximumBet, "ether")} ETH
              </p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-20px" }}>
            <Grid.Column></Grid.Column>
            <Grid.Column width={"2"}>
              <p>
                <strong>Payout:</strong>
                <br />
                {this.props.payout}X
              </p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-20px" }}>
            <Grid.Column></Grid.Column>
            <Grid.Column width={"2"}>
              <p>
                <strong>Maximum Pick:</strong>
                <br />
                {this.props.maximumPick}
              </p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column></Grid.Column>
            <Grid.Column width={"10"}>
              <Header>Withdraw to address:</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-28px" }}>
            <Grid.Column></Grid.Column>
            <Grid.Column>
              <strong>
                <p>{this.state.payoutAddress}</p>
              </strong>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-15px" }}>
            <Grid.Column></Grid.Column>
            <Grid.Column>
              <Form
                onSubmit={this.withdrawEth}
                error={!!this.state.withdrawEthErrorMessage}
              >
                <Form.Group inline style={{ marginLeft: "-5px" }}>
                  <Form.Field>
                    <Input
                      label="ETH"
                      labelPosition="right"
                      value={this.state.withdrawEthAmount}
                      style={{ padding: "5px" }}
                      onChange={event =>
                        this.setState({
                          withdrawEthAmount: event.target.value
                        })
                      }
                    />
                  </Form.Field>

                  <Button
                    loading={this.state.withdrawEthLoading}
                    primary={true}
                    size="large"
                  >
                    Withdraw
                  </Button>
                </Form.Group>
                <Message
                  error
                  header="Oops!"
                  content={this.state.withdrawEthErrorMessage}
                />
              </Form>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column></Grid.Column>
            <Grid.Column>
              <Form
                onSubmit={this.withdrawLink}
                error={!!this.state.withdrawLinkErrorMessage}
              >
                <Form.Group
                  inline
                  style={{ marginTop: "-30px", marginLeft: "-5px" }}
                >
                  <Form.Field>
                    <Input
                      label="LINK"
                      labelPosition="right"
                      value={this.state.withdrawLinkAmount}
                      style={{ padding: "5px" }}
                      onChange={event =>
                        this.setState({
                          withdrawLinkAmount: event.target.value
                        })
                      }
                    />
                  </Form.Field>
                  <Button
                    loading={this.state.withdrawLinkLoading}
                    primary={true}
                    size="large"
                  >
                    Withdraw
                  </Button>
                </Form.Group>
                <Message
                  error
                  header="Oops!"
                  content={this.state.withdrawLinkErrorMessage}
                />
              </Form>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column></Grid.Column>
            <Grid.Column width={"10"}>
              <Header>Close Machine (withdraw all funds)</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "15px" }}>
            <Grid.Column></Grid.Column>
            <Grid.Column width={"10"}>
              <Form
                onSubmit={this.closeMachine}
                error={!!this.state.closeMachineErrorMessage}
              >
                <Form.Group
                  inline
                  style={{ marginTop: "-30px", marginLeft: "-5px" }}
                >
                  <Button
                    style={{ marginLeft: "5px" }}
                    loading={this.state.closeMachineLoading}
                    color="red"
                    size="large"
                  >
                    Close Machine
                  </Button>
                  <br />
                </Form.Group>
                <Message
                  error
                  header="Oops!"
                  content={this.state.closeMachineErrorMessage}
                />
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default Operate;
