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
import web3 from "../ethereum/web3";

class Dashboard extends Component {
  state = {};

  render() {
    return <Layout>Lucky Machines info</Layout>;
  }
}

export default Dashboard;
