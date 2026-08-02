import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import useAuth from "../hooks/useAuth"; // Adjust path

const LogoScreen = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    const logoRef = useRef();

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

    useEffect(() => {
        // Only navigate AFTER the session check is completely done
        if (!loading) {
            if (user) {
                // User is valid, send to dashboard
                navigate("/dashboard", { replace: true });
            } else {
                // No user, send to login
                navigate("/forms", { replace: true });
            }
        }
    }, [user, loading, navigate]);

    return (
        < div className='logo_page' >
            <img className="logo-img" ref={logoRef} src='logo-light.png' alt="logo"></img>
        </div > 
    );
};

export default LogoScreen;