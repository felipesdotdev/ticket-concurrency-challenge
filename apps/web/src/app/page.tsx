"use client";

import {
	AnimatePresence,
	motion,
	useScroll,
	useTransform,
} from "framer-motion";
import {
	Activity,
	ArrowLeft,
	Check,
	ChevronRight,
	CreditCard,
	Minus,
	Plus,
	QrCode,
	Trophy,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { purchaseTicket } from "../lib/api";
import { useSocket } from "../providers/socket-provider";

/**
 * @name TicketStormCupertinoPaymentRefined
 * @description Sistema com animações de navegação bidirecional (Push/Pop) estilo iOS.
 * - Traduzido para Português do Brasil.
 */

const TIERS = [
	{
		id: "ticket-standard",
		name: "Arquibancada Superior",
		price: 490,
		desc: "Visão panorâmica do campo e torcida.",
		features: ["Assento Numerado", "Acesso aos Bares", "Telão Gigante"],
	},
	{
		id: "ticket-vip",
		name: "Camarote Lounge VIP",
		price: 1500,
		desc: "Experiência premium com open bar.",
		features: [
			"Open Bar & Food",
			"Estacionamento VIP",
			"Kit Torcedor",
			"Acesso Exclusivo",
		],
		new: true,
	},
];

const TICKER_MESSAGES = [
	"Últimos ingressos para a Grande Final.",
	"Checkout seguro com criptografia bancária.",
	"Limite de 4 ingressos por torcedor.",
	"Disponibilidade atualizada em tempo real.",
];

// Apple Physics Refined
const IOS_SPRING = {
	type: "spring",
	mass: 0.8,
	stiffness: 250,
	damping: 25,
} as const;
const IOS_EASE = [0.19, 1, 0.22, 1] as const; // "Apple Prime" Ease

// Mapeamento de passos para saber a ordem
const STEP_ORDER = {
	method: 0,
	details: 1,
	processing: 2,
	success: 3,
};

export default function App() {
	// System State
	const { lastEvent, userId } = useSocket();
	const [selectedTier, setSelectedTier] = useState("ticket-vip");
	const [quantity, setQuantity] = useState(1);
	const [stock, setStock] = useState(0); // Start with 0, wait for server update
	const [logs, setLogs] = useState<
		{ id: number; text: string; time: string }[]
	>([]);
	const [tickerIndex, setTickerIndex] = useState(0);
	const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

	// Modal State & Navigation Logic
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalStep, setModalStep] = useState<
		"method" | "details" | "processing" | "success"
	>("method");
	const [direction, setDirection] = useState(0); // -1 (back), 1 (forward)
	const [paymentMethod, setPaymentMethod] = useState<"card" | "qr" | null>(
		null
	);

	// Scroll
	const [isScrolled, setIsScrolled] = useState(false);
	const { scrollYProgress } = useScroll();
	const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);
	const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 50);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Ticker Rotation
	useEffect(() => {
		const interval = setInterval(() => {
			setTickerIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
		}, 4000);
		return () => clearInterval(interval);
	}, []);

	// Real-time Event Handling
	// Real-time Ticket Updates
	useEffect(() => {
		if (lastEvent?.type === "TICKET_UPDATE") {
			const { ticketId, quantity: newQuantity } = lastEvent.data;
			// Atualiza apenas se for o tier selecionado ou se quisermos mostrar todos
			if (ticketId === selectedTier) {
				setStock(newQuantity);
			}
		}
	}, [lastEvent, selectedTier]);

	// Real-time Order Updates
	useEffect(() => {
		if (lastEvent?.type !== "ORDER_UPDATE") return;

		const { orderId, status, message } = lastEvent.data;

		// Add to logs
		setLogs((prev) =>
			[
				{
					id: Date.now(),
					text: message,
					time: new Date().toLocaleTimeString(),
				},
				...prev,
			].slice(0, 5)
		);

		// If this is OUR order
		if (currentOrderId && orderId === currentOrderId) {
			if (status === "COMPLETED") {
				navigateTo("success");
			} else {
				toast.error(`Falha: ${message}`);
				closeModal();
			}
			setCurrentOrderId(null); // Reset
		}
	}, [lastEvent, currentOrderId]);

	// Initial Stock Fetch (Wait for broadcast)

	const currentTierData = TIERS.find((t) => t.id === selectedTier);
	const totalPrice = (currentTierData?.price || 0) * quantity;

	// Navigation Helper
	const navigateTo = (
		newStep: "method" | "details" | "processing" | "success"
	) => {
		const newIndex = STEP_ORDER[newStep];
		const oldIndex = STEP_ORDER[modalStep];
		setDirection(newIndex > oldIndex ? 1 : -1);
		setModalStep(newStep);
	};

	const openCheckout = () => {
		if (stock === 0) return;
		setModalStep("method");
		setDirection(1);
		setIsModalOpen(true);
	};

	const handleSelectMethod = (method: "card" | "qr") => {
		setPaymentMethod(method);
		navigateTo("details");
	};

	const handleConfirmPayment = async () => {
		navigateTo("processing");

		try {
			const response = await purchaseTicket({
				ticketId: selectedTier,
				userId: userId || "anon",
				idempotencyKey: crypto.randomUUID(),
				quantity,
			});

			// Store the order ID we are waiting for
			// The API returns { id, status, message } immediately (status: PENDING)
			setCurrentOrderId(response.id);

			// We do NOT navigate to success here. We wait for the socket event.
		} catch (error) {
			console.error("Payment failed", error);
			toast.error("Erro ao enviar pedido. Tente novamente.");
			closeModal();
		}
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setTimeout(() => {
			setModalStep("method");
			setPaymentMethod(null);
			setDirection(0);
		}, 300);
	};

	// Variants para Transição de Tela (Com Blur e Direção)
	const screenVariants = {
		enter: (direction: number) => ({
			x: direction > 0 ? 50 : -50, // Movimento menor para ser mais elegante
			opacity: 0,
			filter: "blur(8px)", // Blur na entrada
		}),
		center: {
			zIndex: 1,
			x: 0,
			opacity: 1,
			filter: "blur(0px)", // Foco no centro
		},
		exit: (direction: number) => ({
			zIndex: 0,
			x: direction < 0 ? 50 : -50, // Se voltando (dir -1), sai pra direita. Se indo (dir 1), sai pra esquerda.
			opacity: 0,
			filter: "blur(8px)", // Blur na saída
		}),
	};

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#F5F5F7] pb-32 font-sans text-[#1D1D1F] selection:bg-[#0071E3] selection:text-white">
			{/* 1. HEADER REFEITA (Event Products + Ticker) */}
			<nav className="relative z-50 flex h-[44px] items-center justify-center overflow-hidden bg-[#161617] font-normal text-[#E8E8ED]/80 text-[12px]">
				<div className="flex w-full max-w-[1024px] items-center justify-between px-6">
					{/* Left: Brand */}
					<div className="flex items-center gap-6">
						<Trophy className="h-4 w-4 text-[#E8E8ED]" fill="currentColor" />
						<div className="hidden gap-6 text-[#E8E8ED] tracking-wide sm:flex">
							<span className="cursor-pointer transition-colors hover:text-white">
								Jogos
							</span>
							<span className="cursor-pointer transition-colors hover:text-white">
								Esportes
							</span>
							<span className="cursor-pointer transition-colors hover:text-white">
								Teatro
							</span>
							<span className="cursor-pointer transition-colors hover:text-white">
								Festivais
							</span>
							<span className="cursor-pointer transition-colors hover:text-white">
								VIP
							</span>
						</div>
					</div>

					{/* Center: Animated Ticker */}
					<div className="absolute left-1/2 hidden w-[280px] -translate-x-1/2 text-center md:block">
						<AnimatePresence mode="wait">
							<motion.span
								animate={{ opacity: 1, y: 0 }}
								className="block truncate text-[#86868b]"
								exit={{ opacity: 0, y: -10 }}
								initial={{ opacity: 0, y: 10 }}
								key={tickerIndex}
								transition={{ duration: 0.5, ease: IOS_EASE }}
							>
								{TICKER_MESSAGES[tickerIndex]}
							</motion.span>
						</AnimatePresence>
					</div>

					{/* Right: Support */}
					<div className="flex items-center gap-6">
						<span className="cursor-pointer text-[11px] transition-colors hover:text-white">
							Suporte
						</span>
					</div>
				</div>
			</nav>

			{/* 2. RIBBON (Sticky) */}
			<motion.div
				animate={{
					backgroundColor: isScrolled
						? "rgba(255, 255, 255, 0.72)"
						: "rgba(255, 255, 255, 0)",
					backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
					height: isScrolled ? 52 : 60,
				}}
				className="sticky top-0 z-40 border-[#d2d2d7]/30 border-b"
			>
				<div className="mx-auto flex h-full max-w-[1024px] items-center justify-between px-6">
					<h2 className="font-semibold text-[21px] tracking-tight">
						Crowd<span className="opacity-50">Pass</span>
					</h2>
					<motion.button
						className="min-w-[60px] rounded-full bg-[#0071E3] px-4 py-1 font-medium text-[12px] text-white"
						onClick={() =>
							document
								.getElementById("configurator")
								?.scrollIntoView({ behavior: "smooth" })
						}
						whileTap={{ scale: 0.98 }}
					>
						Reservar
					</motion.button>
				</div>
			</motion.div>

			{/* 3. HERO */}
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
						className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2070&auto=format&fit=crop')] bg-center bg-cover opacity-80"
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

			{/* 4. CONFIGURATOR & LOGS */}
			<section
				className="relative z-20 border-[#d2d2d7]/30 border-t bg-white py-24"
				id="configurator"
			>
				<div className="mx-auto grid max-w-[1024px] grid-cols-1 items-start gap-16 px-6 md:grid-cols-2">
					{/* LEFT: Info & Logs */}
					<div className="space-y-8 self-start md:sticky md:top-32">
						<h3 className="mb-4 font-semibold text-[#1d1d1f] text-[40px] leading-[1.05] tracking-tight">
							Garanta seu lugar.
						</h3>

						{/* Estoque */}
						<div className="border-[#d2d2d7]/50 border-b pt-8 pb-8">
							<div className="mb-2 flex items-center justify-between">
								<span className="font-semibold text-[#1d1d1f] text-[14px]">
									Disponibilidade Global
								</span>
								<span
									className={`font-medium text-[12px] ${stock < 20 ? "text-[#bf4800]" : "text-[#0071E3]"}`}
								>
									{stock} unidades restantes
								</span>
							</div>
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E5E5]">
								<motion.div
									animate={{ width: `${(stock / 150) * 100}%` }}
									className={`h-full rounded-full ${stock < 20 ? "bg-[#bf4800]" : "bg-[#0071E3]"}`}
									initial={{ width: "100%" }}
								/>
							</div>
						</div>

						{/* LIVE LOGS */}
						<div className="pt-6">
							<h4 className="mb-4 font-semibold text-[#86868b] text-[12px] uppercase tracking-wider">
								Atualizações em Tempo Real
							</h4>
							<div className="relative min-h-[100px] space-y-3">
								<AnimatePresence initial={false} mode="popLayout">
									{logs.map((log) => (
										<motion.div
											animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
											className="flex items-center gap-3 text-[13px]"
											exit={{
												opacity: 0,
												y: 20,
												filter: "blur(6px)",
												transition: { duration: 0.6 },
											}}
											initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
											key={log.id}
											layout
										>
											<Activity className="h-3.5 w-3.5 text-[#0071E3]" />
											<span className="text-[#1d1d1f]">{log.text}</span>
											<span className="ml-auto text-[#86868b] text-[11px]">
												{log.time}
											</span>
										</motion.div>
									))}
								</AnimatePresence>
							</div>
						</div>
					</div>

					{/* RIGHT: Selection */}
					<div className="space-y-8">
						<div className="space-y-4">
							{TIERS.map((tier) => (
								<div
									className={`relative flex cursor-pointer items-center justify-between overflow-hidden rounded-[18px] border-2 p-6 transition-all duration-300 ${selectedTier === tier.id ? "border-[#0071E3] bg-white shadow-sm" : "border-[#d2d2d7] bg-white hover:border-[#86868b]"}
                  `}
									key={tier.id}
									onClick={() => setSelectedTier(tier.id)}
								>
									<div>
										<div className="mb-1 flex items-center gap-2">
											<span className="font-semibold text-[#1d1d1f] text-[17px] tracking-tight">
												{tier.name}
											</span>
											{tier.new && (
												<span className="rounded bg-[#fff0e6] px-1.5 py-0.5 font-medium text-[#bf4800] text-[10px]">
													Novo
												</span>
											)}
										</div>
										<p className="text-[#86868b] text-[12px]">{tier.desc}</p>
									</div>
									<div className="text-right">
										<span className="text-[#1d1d1f] text-[12px]">
											R$ {tier.price}
										</span>
									</div>
								</div>
							))}
						</div>

						<motion.div
							className="space-y-6 rounded-[22px] bg-[#F5F5F7] p-8"
							layout
						>
							<div className="flex items-center justify-between">
								<span className="font-semibold text-[#1d1d1f] text-[14px]">
									Quantidade
								</span>
								<div className="flex items-center gap-4 rounded-full border border-[#d2d2d7] bg-white p-1">
									<button
										className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F5F7]"
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
									>
										<Minus className="h-4 w-4" />
									</button>
									<span className="w-4 text-center font-semibold text-[14px]">
										{quantity}
									</span>
									<button
										className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F5F7]"
										onClick={() => setQuantity(Math.min(5, quantity + 1))}
									>
										<Plus className="h-4 w-4" />
									</button>
								</div>
							</div>

							<div className="space-y-4 pt-2 text-center">
								<div className="flex items-baseline justify-between">
									<span className="text-[#86868b] text-[14px]">
										Total a pagar
									</span>
									<span className="font-semibold text-[#1d1d1f] text-[32px] tracking-tight">
										R$ {totalPrice}
									</span>
								</div>

								<motion.button
									className={`flex h-[52px] w-full items-center justify-center rounded-[14px] font-normal text-[17px] text-white shadow-md transition-all ${stock === 0 ? "cursor-not-allowed bg-[#86868b]" : "bg-[#0071E3] hover:bg-[#0077ED]"}
                    `}
									disabled={stock === 0}
									onClick={openCheckout}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									{stock === 0 ? "Esgotado" : "Checkout Seguro"}
								</motion.button>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* 5. CHECKOUT MODAL (REFINED IOS) */}
			<AnimatePresence>
				{isModalOpen && (
					<>
						{/* Backdrop: Lighter Blur */}
						<motion.div
							animate={{ opacity: 1 }}
							className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
							exit={{ opacity: 0 }}
							initial={{ opacity: 0 }}
							onClick={closeModal}
						>
							{/* Modal Container */}
							<motion.div
								animate={{ scale: 1, opacity: 1 }}
								className="relative mx-auto w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-[0_40px_80px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
								exit={{ scale: 0.9, opacity: 0 }}
								initial={{ scale: 0.9, opacity: 0 }}
								layout
								onClick={(e) => e.stopPropagation()}
								style={{ borderRadius: 24 }}
								transition={IOS_SPRING}
							>
								{/* Adaptive Height Wrapper */}
								<motion.div
									className="bg-white p-6 md:p-8"
									layout
									transition={{ duration: 0.4, ease: IOS_EASE }}
								>
									<div className="mb-6 flex items-center justify-between">
										<div className="flex items-center gap-2">
											{modalStep !== "method" && modalStep !== "success" && (
												<button
													className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED]"
													onClick={() => navigateTo("method")}
												>
													<ArrowLeft className="h-4 w-4 text-[#1d1d1f]" />
												</button>
											)}
											<h3 className="font-semibold text-[#1d1d1f] text-[19px] tracking-tight">
												{modalStep === "method" && "Método de Pagamento"}
												{modalStep === "details" && "Detalhes do Pagamento"}
												{modalStep === "processing" && "Processando"}
												{modalStep === "success" && "Confirmado"}
											</h3>
										</div>
										<button
											className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED]"
											onClick={closeModal}
										>
											<X className="h-4 w-4 text-[#86868b]" />
										</button>
									</div>

									<div className="relative min-h-[200px] overflow-hidden">
										<AnimatePresence custom={direction} mode="popLayout">
											{/* STEP 1: METHOD */}
											{modalStep === "method" && (
												<motion.div
													animate="center"
													className="space-y-3"
													custom={direction}
													exit="exit"
													initial="enter"
													key="method"
													transition={{ duration: 0.4, ease: IOS_EASE }}
													variants={screenVariants}
												>
													<button
														className="group flex w-full items-center gap-4 rounded-[16px] border border-[#d2d2d7] p-4 transition-all hover:border-[#0071E3] hover:bg-[#F5F5F7] active:scale-[0.98]"
														onClick={() => handleSelectMethod("qr")}
													>
														<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F0FF] text-[#0071E3]">
															<QrCode className="h-5 w-5" />
														</div>
														<div className="text-left">
															<span className="block font-semibold text-[#1d1d1f] text-[15px]">
																Pix / QR Code
															</span>
															<span className="block text-[#86868b] text-[12px]">
																Aprovação imediata
															</span>
														</div>
														<ChevronRight className="ml-auto h-4 w-4 text-[#86868b] transition-transform group-hover:translate-x-1" />
													</button>

													<button
														className="group flex w-full items-center gap-4 rounded-[16px] border border-[#d2d2d7] p-4 transition-all hover:border-[#0071E3] hover:bg-[#F5F5F7] active:scale-[0.98]"
														onClick={() => handleSelectMethod("card")}
													>
														<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F0FF] text-[#0071E3]">
															<CreditCard className="h-5 w-5" />
														</div>
														<div className="text-left">
															<span className="block font-semibold text-[#1d1d1f] text-[15px]">
																Cartão de Crédito / Débito
															</span>
															<span className="block text-[#86868b] text-[12px]">
																Em até 12x no cartão
															</span>
														</div>
														<ChevronRight className="ml-auto h-4 w-4 text-[#86868b] transition-transform group-hover:translate-x-1" />
													</button>
												</motion.div>
											)}

											{/* STEP 2: DETAILS */}
											{modalStep === "details" && (
												<motion.div
													animate="center"
													className="space-y-6"
													custom={direction}
													exit="exit"
													initial="enter"
													key="details"
													transition={{ duration: 0.4, ease: IOS_EASE }}
													variants={screenVariants}
												>
													{paymentMethod === "qr" ? (
														<div className="py-4 text-center">
															<div className="relative mx-auto mb-4 flex h-48 w-48 items-center justify-center overflow-hidden rounded-xl bg-[#1d1d1f]">
																<QrCode className="relative z-10 h-24 w-24 text-white" />
																<div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent" />
															</div>
															<p className="text-[#86868b] text-[14px]">
																Escaneie para pagar R$ {totalPrice}
															</p>
														</div>
													) : (
														<div className="space-y-4">
															<input
																className="h-12 w-full rounded-[12px] border-none bg-[#F5F5F7] px-4 text-[#1d1d1f] transition-shadow placeholder:text-[#86868b] focus:ring-2 focus:ring-[#0071E3]"
																placeholder="Número do Cartão"
																type="text"
															/>
															<div className="flex gap-4">
																<input
																	className="h-12 w-1/2 rounded-[12px] border-none bg-[#F5F5F7] px-4 text-[#1d1d1f] transition-shadow placeholder:text-[#86868b] focus:ring-2 focus:ring-[#0071E3]"
																	placeholder="MM/AA"
																	type="text"
																/>
																<input
																	className="h-12 w-1/2 rounded-[12px] border-none bg-[#F5F5F7] px-4 text-[#1d1d1f] transition-shadow placeholder:text-[#86868b] focus:ring-2 focus:ring-[#0071E3]"
																	placeholder="CVC"
																	type="text"
																/>
															</div>
														</div>
													)}

													<button
														className="flex h-[48px] w-full items-center justify-center rounded-[12px] bg-[#0071E3] font-medium text-white shadow-blue-500/20 shadow-lg transition-colors hover:bg-[#0077ED] active:scale-[0.98]"
														onClick={handleConfirmPayment}
													>
														Confirmar Pagamento
													</button>
												</motion.div>
											)}

											{/* STEP 3: PROCESSING */}
											{modalStep === "processing" && (
												<motion.div
													animate="center"
													className="flex flex-col items-center justify-center py-12"
													custom={direction}
													exit="exit"
													initial="enter"
													key="processing"
													transition={{ duration: 0.4, ease: IOS_EASE }}
													variants={screenVariants}
												>
													<motion.div
														animate={{ rotate: 360 }}
														className="mb-4 h-12 w-12 rounded-full border-4 border-[#0071E3]/20 border-t-[#0071E3]"
														transition={{
															repeat: Number.POSITIVE_INFINITY,
															duration: 1,
															ease: "linear",
														}}
													/>
													<p className="font-medium text-[#1d1d1f] text-[15px]">
														Verificando transação...
													</p>
												</motion.div>
											)}

											{/* STEP 4: SUCCESS */}
											{modalStep === "success" && (
												<motion.div
													animate="center"
													className="py-8 text-center"
													custom={direction}
													exit="exit"
													initial="enter"
													key="success"
													transition={{ duration: 0.4, ease: IOS_EASE }}
													variants={screenVariants}
												>
													<motion.div
														animate={{ scale: 1 }}
														className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#E3F9E5]"
														initial={{ scale: 0 }}
														transition={{
															type: "spring",
															stiffness: 300,
															damping: 15,
															delay: 0.2,
														}}
													>
														<Check
															className="h-10 w-10 text-emerald-600"
															strokeWidth={3}
														/>
													</motion.div>
													<h4 className="mb-2 font-semibold text-[#1d1d1f] text-[24px]">
														Você vai ao evento!
													</h4>
													<p className="mx-auto mb-8 max-w-[260px] text-[#86868b] text-[15px]">
														Seus ingressos foram enviados para o seu e-mail. Nos
														vemos lá!
													</p>
													<button
														className="h-[48px] w-full rounded-[12px] bg-[#F5F5F7] font-medium text-[#1d1d1f] transition-colors hover:bg-[#E8E8ED]"
														onClick={closeModal}
													>
														Fechar
													</button>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</motion.div>
							</motion.div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* FOOTER */}
			<section className="mt-12 border-[#d2d2d7]/50 border-t bg-[#F5F5F7] px-6 py-20">
				<div className="mx-auto grid max-w-[1024px] grid-cols-2 gap-8 text-[#86868b] text-[12px] md:grid-cols-4">
					<div>
						<span className="mb-2 block font-semibold text-[#1d1d1f]">
							Status do Sistema
						</span>
						<ul className="space-y-1">
							<li>WebSocket: Ativo</li>
							<li>Latência: 12ms</li>
							<li>Criptografia: AES-256</li>
						</ul>
					</div>
					<div>
						<span className="mb-2 block font-semibold text-[#1d1d1f]">
							Detalhes do Evento
						</span>
						<ul className="space-y-1">
							<li>Data: 15 Julho, 2026</li>
							<li>Local: Estádio Monumental</li>
						</ul>
					</div>
				</div>
			</section>
		</div>
	);
}
