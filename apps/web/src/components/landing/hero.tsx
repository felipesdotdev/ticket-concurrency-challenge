"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function Hero() {
	const { scrollYProgress } = useScroll();
	const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);
	const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

	return (
		<section className="px-6 pt-16 pb-20 text-center">
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="relative z-10"
				initial={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.8 }}
			>
				<span className="mb-2 block font-semibold text-[#bf4800] text-[17px] tracking-tight">
					Grande Final 2026
				</span>
				<h1 className="mb-2 font-semibold text-[#1d1d1f] text-[56px] leading-[1.05] tracking-tighter md:text-[80px]">
					CrowdPass.
				</h1>
				<p className="font-medium text-[#1d1d1f] text-[24px] leading-tight tracking-tight md:text-[28px]">
					O Maior Espetáculo da Terra.
				</p>
			</motion.div>

			<motion.div
				className="relative mx-auto mt-12 aspect-[21/9] w-full max-w-[900px] overflow-hidden rounded-[30px] bg-black shadow-[0_40px_80px_rgba(0,0,0,0.12)]"
				style={{ scale: heroScale, opacity: heroOpacity }}
			>
				<motion.div
					animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
					className="absolute inset-0 bg-[url('https://assets.goal.com/images/v3/bltae7f8664e38023a5/FLAYboiXEAgk65d.jpeg?auto=webp&format=pjpg&width=1080&quality=60')] bg-center bg-cover opacity-20"
					transition={{
						duration: 30,
						repeat: Number.POSITIVE_INFINITY,
						repeatType: "mirror",
					}}
				/>
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="font-semibold text-3xl text-white tracking-tight drop-shadow-2xl md:text-5xl">
						Estádio Monumental
					</span>
				</div>
			</motion.div>
		</section>
	);
}
