import { Component } from "react"


interface ReactClassDependencyProps {
    content: string
}

class ReactClassDependency extends Component<ReactClassDependencyProps> {
    constructor(props: ReactClassDependencyProps) {
        super(props)
    }

    render() {
        return (
            <p>
                This should never be displayed. With props: {this.props.content}
            </p >
        )
    }
}

export default ReactClassDependency
