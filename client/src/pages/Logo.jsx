import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

const Logo = () => {
    const logoRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                navigate("/forms");
            }
        });

        // Step 1: Logo animation
        tl.fromTo(
            logoRef.current,
            {
                y: -50,
                opacity: 0,
            },
            {
                y: -10,
                opacity: 1,
                duration: 1,
            }
        );

        tl.to({}, { duration: 3 });

    });
    return (
        < div className='logo_page' >
            <img className="logo-img" ref={logoRef} src='logo-light.png' alt="logo"></img>
        </div >
    )
}

export default Logo;