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
    return (
      <Layout page="dashboard">
        <Grid centered columns={6} style={{ marginTop: "10px" }}>
          <Grid.Row color="black">
            <h1
              style={{
                textColor: "white",
                fontSize: "4em",
                fontWeight: "normal"
              }}
            >
              Lucky Machines
            </h1>
          </Grid.Row>
          <Grid.Row style={{ backgroundColor: "#99ccff", color: "#001433" }}>
            <Grid.Column width={12}>
              <Container
                fluid
                style={{
                  fontSize: "1.7em",
                  marginTop: "1.5em"
                }}
              >
                <p>
                  Provably fair betting machines using{" "}
                  <a href="https://docs.chain.link/docs/chainlink-vrf">
                    Chainlink VRF
                  </a>{" "}
                  for generating random numbers.{" "}
                  <Link route="/play">
                    <strong>
                      <a href="#">Play machines</a>
                    </strong>
                  </Link>{" "}
                  and bet on random numbers with instant payouts or{" "}
                  <Link route="/factory">
                    <strong>
                      <a href="#">create a machine</a>
                    </strong>
                  </Link>{" "}
                  for others to play.
                </p>
                <p>
                  Each machine must be funded with enough ETH to pay out any
                  potential winnings plus enough LINK to request random numbers
                  before play is available.
                </p>
                <p>
                  <Link route="/play">
                    <strong>
                      <a href="#">
                        Here is a list of verified machines ready to be played!
                      </a>
                    </strong>
                  </Link>
                </p>
                <p>
                  Lucky Machines can be shut down at any time and all funds
                  cashed out to the owner, although any unplayed bets cannot be
                  withdrawn. Unplayed bets, if any, may be refunded to the
                  player who placed the bet upon request to the contract.
                </p>
                <p>
                  The minimum bet, maximum bet, number of pickable values, and
                  payout amounts are set on a machine by machine basis, but once
                  the machine is created these values cannot be changed.
                </p>
                <br />
              </Container>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row></Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default Dashboard;
