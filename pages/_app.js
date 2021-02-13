import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  global.chainID = "0";
  return <Component {...pageProps} />;
}

export default MyApp;
