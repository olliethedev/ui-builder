

interface SomeInterface {
    prefix: string
}

export interface ReactFunctionWithExtendsProps extends SomeInterface {
    content: string
}

function ReactFunctionWithExtends(props: ReactFunctionWithExtendsProps) {
    
    return (
        <div {...props}>{props.prefix}:{props.content}</div>
    )
}

export default ReactFunctionWithExtends
