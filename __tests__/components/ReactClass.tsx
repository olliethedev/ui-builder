import { Component } from "react"
import ReactClassDependency from "./ReactClassDependency"
import { utilitySquareFunction } from "./utilityFunctions"

export const initialStateCount: number = 2

export interface ReactClassProps {
    content: string
}

interface ReactClassState {
    count: number
}

class ReactClass extends Component<ReactClassProps, ReactClassState> {
    constructor(props: ReactClassProps) {
        super(props);
        this.state = {
            count: initialStateCount
        }
    }

    increase() {
        this.setState({
            count: utilitySquareFunction(this.state.count)
        })
    }

    render() {
        return (
            <div>
            <p>ReactClass header</p>
            <p>{this.props.content}</p>
            <p>{this.state.count}</p>
            <button onClick={() => this.increase()}>increase count</button>
            <ReactClassDependency content={"From ReactClass"} />
        </div>
        )
    }
}

export default ReactClass