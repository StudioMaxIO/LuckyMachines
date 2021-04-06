import React, { useState } from "react";
import { useSpring, useChain, animated, interpolate } from "@react-spring/web";

const RPS = (props) => {
  let transformInterpolationOutput;
  let opacityInterpolationOutput;
  switch (props.children[1]) {
    case 1:
      transformInterpolationOutput = [0, 1.5, 1, 0, 0, 0, 0, 0, 0, 0];
      opacityInterpolationOutput = [0, 1, 1, 0, 0, 0, 0, 0, 0, 0];
      break;
    case 2:
      transformInterpolationOutput = [0, 0, 0, 0, 1.5, 1, 0, 0, 0, 0];
      opacityInterpolationOutput = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0];
      break;
    case 3:
      transformInterpolationOutput = [0, 0, 0, 0, 0, 0, 0, 1.5, 1, 0];
      opacityInterpolationOutput = [0, 0, 0, 0, 0, 0, 0, 1, 1, 0];
      break;
    default:
      transformInterpolationOutput = [0, 1.5, 1, 0, 0, 0, 0, 0, 0, 0];
      opacityInterpolationOutput = [0, 1, 1, 0, 0, 0, 0, 0, 0, 0];
  }

  const [state, toggle] = useState(true);
  const { x } = useSpring({
    loop: true,
    from: { x: 0 },
    x: state ? 1 : 0,
    config: { duration: 3000 },
  });
  return (
    <animated.div
      style={{
        marginTop: "10px",
        position: "absolute",
        width: "200px",
        left: "50%",
        marginLeft: "-100px",
        opacity: x.interpolate({
          range: [0, 0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.77, 0.88, 0.99],
          output: opacityInterpolationOutput,
        }),
        transform: x
          .interpolate({
            range: [0, 0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.77, 0.88, 0.99],
            output: transformInterpolationOutput,
          })
          .interpolate((x) => `scale(${x})`),
      }}
    >
      {props.children[0]}
    </animated.div>
  );
};

export default RPS;
