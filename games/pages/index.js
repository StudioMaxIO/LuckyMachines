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
} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
import web3 from "../ethereum/web3";

class Dashboard extends Component {
  state = {};

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
              }}
            >
              Lucky Machine Games
            </h1>
          </Grid.Row>
          <Grid.Row style={{ backgroundColor: "#99ccff", color: "#001433" }}>
            <Grid.Column width={12}>
              <center>
                <Header>
                  Provably-fair betting games built with Lucky Machines.
                </Header>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ backgroundColor: "#99ccff", color: "#001433" }}>
            <Grid.Column width={12}>
              <Card.Group centered>
                <Card
                  style={{ backgroundColor: "black", color: "white" }}
                  href="/rock-paper-scissors"
                >
                  <div
                    style={{
                      fontSize: "3em",
                      paddingTop: "20px",
                      paddingBottom: "10px",
                    }}
                  >
                    <center>👊 ✋✌️</center>
                  </div>
                  <center>
                    <h2 style={{ paddingBottom: "10px" }}>
                      Rock Paper Scissors
                    </h2>
                    <p style={{ paddingBottom: "10px" }}>
                      <strong>Network:</strong> Polygon / Matic
                    </p>
                  </center>
                </Card>
                <Card
                  style={{ backgroundColor: "#00875C", color: "white" }}
                  href="/pick3"
                >
                  <div
                    style={{
                      fontSize: "3em",
                      paddingTop: "20px",
                      paddingBottom: "10px",
                    }}
                  >
                    <center>Pick 3</center>
                  </div>
                  <center>
                    <h2 style={{ paddingBottom: "10px" }}>w/Rolling Jackpot</h2>
                    <p style={{ paddingBottom: "10px" }}>
                      <strong>Network:</strong> Polygon / Matic
                    </p>
                  </center>
                </Card>
              </Card.Group>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ backgroundColor: "#99ccff", color: "#001433" }}>
            <Grid.Column width={12}>
              <center>
                <p>
                  <strong>
                    Have a game that uses Lucky Machines contracts?
                  </strong>{" "}
                  <br />
                  Tell us about it at{" "}
                  <a href="mailto:games@luckymachines.io">
                    games@luckymachines.io
                  </a>{" "}
                  to get added to the gallery.
                </p>
              </center>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default Dashboard;
