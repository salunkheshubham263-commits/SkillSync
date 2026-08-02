import { useEffect, useRef } from "react";
import gsap from "gsap";

const Loading_screen = () => {
    const container = useRef();
    const logo = useRef();
    const progress = useRef();
    const glow = useRef();

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            tl.to(container.current, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out"
            })
                .fromTo(
                    logo.current,
                    { y: 25, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
                );
            gsap.to(glow.current, {
                opacity: 0.4,
                scale: 1.1,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
            gsap.to(progress.current, {
                width: "85%",
                duration: 0.8,
                ease: "power2.out"
            });
            gsap.to(progress.current, {
                width: "95%",
                duration: 6,
                delay: 0.8,
                ease: "linear"
            });

        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <div className="loading-screen" ref={container} style={{ opacity: 0 }}>
            <div className="logo-glow-pro" ref={glow} />
            <img
                ref={logo}
                src="/logo-trans.png"
                className="loading-logo-horizontal"
                alt="SkillSync - Collaboration & Growth"
            />

            {/* Ultra-thin, modern progress bar */}
            <div className="loading-bar-pro">
                <div ref={progress} className="loading-progress-fill" />
            </div>

        </div>
    );
};

export default Loading_screen;