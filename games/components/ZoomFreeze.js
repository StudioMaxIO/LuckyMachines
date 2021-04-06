import React, { useState } from "react";
import { useSpring, useChain, animated, interpolate } from "@react-spring/web";

const ZoomFreeze = (props) => {
  let transformInterpolationOutput = [0, 1.5];
  let opacityInterpolationOutput = [0, 1];

  const [state, toggle] = useState(true);
  const { x } = useSpring({
    loop: false,
    from: { x: 0 },
    x: state ? 1 : 0,
    config: { duration: 1000 },
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
          range: [0, 0.99],
          output: opacityInterpolationOutput,
        }),
        transform: x
          .interpolate({
            range: [0, 0.99],
            output: transformInterpolationOutput,
          })
          .interpolate((x) => `scale(${x})`),
      }}
    >
      {props.children}
    </animated.div>
  );
};

export default ZoomFreeze;
