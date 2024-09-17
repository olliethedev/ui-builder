import { useState } from "react"
import ReactFCDependency from "./ReactFCDependency"
import { utilitySquareFunction } from "./utilityFunctions"


export const initialStateCount: number = 2

export interface ReactFunctionProps {
    content: string
}

function ReactFunction(props: ReactFunctionProps) {
    const [count, setCount] = useState(initialStateCount)

    const increase = () => {
        setCount(utilitySquareFunction(count))
    }

    return (
        <div>
            <p>ReactFC header</p>
            <p>{props.content}</p>
            <p>{count}</p>
            <button onClick={() => increase()}>increase count</button>
            <ReactFCDependency content={"From ReactFunction"} />
        </div>
    )
}

export default ReactFunction
