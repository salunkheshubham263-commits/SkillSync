import { useEffect, useRef } from "react"
import gsap from "gsap"

const PageWrapper = ({children}) => {
    const ref = useRef();

    useEffect(() => {
        gsap.fromTo(ref.current, {
            opacity: 0
        },
        {
            opacity: 1,
            duration: 2,
        });
    },[])
    return (
        <div ref={ref}>{children}</div>
    )
}

export default PageWrapper
