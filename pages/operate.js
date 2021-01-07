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
    ethBalance: 0,
    linkBalance: 0
  };

  static async getInitialProps(props) {
    //const project = Project(props.query.address);

    this._isMounted = false;
    const luckyMachine = LuckyMachine(props.query.address);
    const summary = await luckyMachine.methods.getSummary().call();
    const linkBalance = await luckyMachine.methods.getLinkBalance().call();
    const ethBalance = await web3.eth.getBalance(props.query.address);
    this.setState({
      ethBalance: ethBalance,
      linkBalance: linkBalance
    });

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
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <Layout>
        <h1>Balances</h1>
        <p>ETH: {web3.eth.getBalance(props.query.address)}</p>
        <p>LINK: XX.X</p>
        <h1>Operate Lucky Machine: {this.props.address}</h1>
        <p>Min Bet: {web3.utils.fromWei(this.props.minimumBet, "ether")} ETH</p>
        <p>Max Bet: {web3.utils.fromWei(this.props.maximumBet, "ether")} ETH</p>
        <p>Payout: {this.props.payout}X</p>
      </Layout>
    );
  }
}

export default Operate;
