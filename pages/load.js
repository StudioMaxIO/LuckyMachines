import React, { Component } from "react";
import { Card, Grid, Button, Form, Input } from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";

class Load extends Component {
  state = {
    machineAddress: ""
  };

  loadMachine = event => {
    if (this.state.machineAddress != "") {
      var route = "/play/" + this.state.machineAddress;
      Router.pushRoute(route);
    }
  };

  render() {
    return (
      <Layout>
        <Grid centered style={{ marginTop: "10px" }}>
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
                  Lucky Machine
                </h1>
                <Form onSubmit={this.loadMachine}>
                  <Form.Field>
                    <Input
                      placeholder="Lucky Machine Address: 0x..."
                      value={this.state.machineAddress}
                      onChange={event =>
                        this.setState({
                          machineAddress: event.target.value
                        })
                      }
                    />
                  </Form.Field>
                  <Button size="huge" color="blue">
                    Play!
                  </Button>
                </Form>
              </center>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default Load;
