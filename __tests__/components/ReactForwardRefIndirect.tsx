import { forwardRef } from "react";

interface ReactForwardRefIndirectProps {
    content: string
}


export const ReactForwardRefIndirect = forwardRef<HTMLDivElement, ReactForwardRefIndirectProps>(ComponentImplementation);

function ComponentImplementation(props: ReactForwardRefIndirectProps, ref: React.Ref<HTMLDivElement>) {
  return <div ref={ref}>{props.content}</div>
}