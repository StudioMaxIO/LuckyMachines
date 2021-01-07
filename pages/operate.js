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
  Label
} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
import LuckyMachine from "../ethereum/luckyMachine";
import web3 from "../ethereum/web3";

class Operate extends Component {
  state = {
    ethBalance: "",
    linkBalance: "",
    address: ""
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
    this.setState({
      ethBalance: ethBalance,
      linkBalance: linkBalance
    });
  }

  updateBalances = async event => {
    const luckyMachine = LuckyMachine(this.props.address);
    const ethBalance = await web3.eth.getBalance(this.props.address);
    const linkBalance = await luckyMachine.methods.getLinkBalance().call();
    this.setState({
      ethBalance: ethBalance,
      linkBalance: linkBalance
    });
  };

  render() {
    return (
      <Layout>
        <h1>Operate Lucky Machine</h1>
        <h3>{this.props.address}</h3>
        <h1>Balances</h1>
        <a onClick={this.updateBalances}>Reload</a>
        <p>ETH: {web3.utils.fromWei(this.state.ethBalance, "ether")}</p>
        <p>LINK: {web3.utils.fromWei(this.state.linkBalance, "ether")}</p>
        <p> Send ETH & LINK to {this.props.address} to fund machine </p>
        <br />
        <p>Min Bet: {web3.utils.fromWei(this.props.minimumBet, "ether")} ETH</p>
        <p>Max Bet: {web3.utils.fromWei(this.props.maximumBet, "ether")} ETH</p>
        <p>Payout: {this.props.payout}X</p>
      </Layout>
    );
  }
}

export default Operate;
