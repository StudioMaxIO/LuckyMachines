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

class Dashboard extends Component {
  state = {};

  render() {
    return (
      <Layout>
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
        </Grid>
      </Layout>
    );
  }
}

export default Dashboard;
