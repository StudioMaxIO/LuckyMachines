import React from "react";
import { Container, Grid } from "semantic-ui-react";
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

const Layout = props => {
  return (
    <Container>
      <Head>
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
        />
      </Head>
      <Header page={props.page ? props.page : "dashboard"} />
      {props.children}
      <Footer />
    </Container>
  );
};

export default Layout;
