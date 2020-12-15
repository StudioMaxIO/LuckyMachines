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

class Factory extends Component {
  render() {
    return (
      <Layout>
        <h1>Factory</h1>
      </Layout>
    );
  }
}

export default Factory;
