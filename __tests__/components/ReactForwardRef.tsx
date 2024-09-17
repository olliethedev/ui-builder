import React from "react";

interface ReactForwardRefProps {
    content: string
}

export const ReactForwardRef = React.forwardRef<HTMLDivElement, ReactForwardRefProps>((props, ref) => {
    return <div ref={ref}>{props.content}</div>;
  });