

export interface ReactFunctionWithExtendsTypedProps extends React.HTMLAttributes<HTMLDivElement> {
    content: string
}

function ReactFunctionWithExtendsTyped(props: ReactFunctionWithExtendsTypedProps) {
    
    return (
        <div {...props}>{props.content}</div>
    )
}

export default ReactFunctionWithExtendsTyped
