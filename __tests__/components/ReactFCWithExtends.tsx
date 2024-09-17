import { FC } from "react"


export const initialStateCount: number = 2


interface SomeInterface {
    prefix: string
}
export interface ReactFCWithExtendsProps extends SomeInterface {
    content: string
}

const ReactFCWithExtends: FC<ReactFCWithExtendsProps> = (props) => {

    return (
        <div {...props}>{props.prefix}:{props.content}</div>
    )
}

export default ReactFCWithExtends
