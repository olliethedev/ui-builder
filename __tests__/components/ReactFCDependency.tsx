import React from "react";


interface ReactFCDependencyProps {
    content: string
}

const ReactFCDependency: React.FC<ReactFCDependencyProps> = (props) => {
    return (
        <p>
            This should never be displayed. With props: {props.content}
        </p>
    )
}

export default ReactFCDependency
