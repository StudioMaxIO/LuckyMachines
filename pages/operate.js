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
  Header
} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
import LuckyMachine from "../ethereum/luckyMachine";
import web3 from "../ethereum/web3";

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
    withdrawLinkLoading: false
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
    this._isMounted && this.getBalances();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async getBalances() {
    const luckyMachine = LuckyMachine(this.props.address);
    const ethBalance = await web3.eth.getBalance(this.props.address);
    const linkBalance = await luckyMachine.methods.getLinkBalance().call();
    const payoutAddress = await luckyMachine.methods.payoutAddress().call();
    this.setState({
      ethBalance: ethBalance,
      linkBalance: linkBalance,
      payoutAddress: payoutAddress
    });
  }

  updateBalances = async event => {
    const luckyMachine = LuckyMachine(this.props.address);
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
    const luckyMachine = LuckyMachine(this.props.address);
    // withdraw eth...
    this.setState({
      withdrawEthLoading: false
    });
  };

  withdrawLink = async event => {
    const luckyMachine = LuckyMachine(this.props.address);
    // withdraw eth...
    this.setState({
      withdrawLinkLoading: false
    });
  };

  render() {
    return (
      <Layout page="operate">
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
                  Lucky Machine Operator
                </h1>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Header>Machine:</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-28px" }}>
            <Grid.Column>
              <strong>
                <a href="#">
                  <Link route={"/play/" + this.props.address}>
                    {this.props.address}
                  </Link>
                </a>
              </strong>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-5px" }}>
            <Grid.Column width={"6"}>
              <Header>
                Balances
                <a href="javascript:void(0);">
                  <Image
                    style={{ marginTop: "-2px" }}
                    spaced="left"
                    size="mini"
                    src="https://i.postimg.cc/qMRWjVXx/smaller-reload.png"
                    onClick={this.updateBalances}
                  />
                </a>
              </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-30px" }}>
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
          <Grid.Row style={{ marginTop: "-20px" }}>
            <Grid.Column>
              <p>
                {" "}
                To fund machine, send ETH & LINK to:
                <br />
                <strong>{this.props.address}</strong>
              </p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Header>Machine Settings</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-23px" }}>
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
            <Grid.Column width={"2"}>
              <p>
                <strong>Payout:</strong>
                <br />
                {this.props.payout}X
              </p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={"6"}>
              <Header>Withdraw to address:</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-28px" }}>
            <Grid.Column>
              <strong>
                <p>{this.state.payoutAddress}</p>
              </strong>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ marginTop: "-15px" }}>
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
                    primary="true"
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
                    primary="true"
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
        </Grid>
      </Layout>
    );
  }
}

export default Operate;
