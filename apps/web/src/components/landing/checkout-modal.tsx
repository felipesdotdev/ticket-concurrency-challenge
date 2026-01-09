"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	Check,
	ChevronRight,
	CreditCard,
	QrCode,
	X,
} from "lucide-react";

export type ModalStep = "method" | "details" | "processing" | "success";
export type PaymentMethod = "card" | "qr" | null;

interface CheckoutModalProps {
	isOpen: boolean;
	onClose: () => void;
	step: ModalStep;
	paymentMethod: PaymentMethod;
	onSelectMethod: (method: "card" | "qr") => void;
	onConfirm: () => void;
	onNavigateBack: () => void;
	direction: number;
	totalPrice: number;
}

const IOS_SPRING = {
	type: "spring",
	mass: 0.8,
	stiffness: 250,
	damping: 25,
} as const;
const IOS_EASE = [0.19, 1, 0.22, 1] as const;

const screenVariants = {
	enter: (direction: number) => ({
		x: direction > 0 ? 50 : -50,
		opacity: 0,
		filter: "blur(8px)",
	}),
	center: {
		zIndex: 1,
		x: 0,
		opacity: 1,
		filter: "blur(0px)",
	},
	exit: (direction: number) => ({
		zIndex: 0,
		x: direction < 0 ? 50 : -50,
		opacity: 0,
		filter: "blur(8px)",
	}),
};

export function CheckoutModal({
	isOpen,
	onClose,
	step,
	paymentMethod,
	onSelectMethod,
	onConfirm,
	onNavigateBack,
	direction,
	totalPrice,
}: CheckoutModalProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={onClose}
					>
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
							<motion.div
								className="bg-white p-6 md:p-8"
								layout
								transition={{ duration: 0.4, ease: IOS_EASE }}
							>
								<div className="mb-6 flex items-center justify-between">
									<div className="flex items-center gap-2">
										{step !== "method" && step !== "success" && (
											<button
												className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED]"
												onClick={onNavigateBack}
											>
												<ArrowLeft className="h-4 w-4 text-[#1d1d1f]" />
											</button>
										)}
										<h3 className="font-semibold text-[#1d1d1f] text-[19px] tracking-tight">
											{step === "method" && "Método de Pagamento"}
											{step === "details" && "Detalhes do Pagamento"}
											{step === "processing" && "Processando"}
											{step === "success" && "Confirmado"}
										</h3>
									</div>
									<button
										className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED]"
										onClick={onClose}
									>
										<X className="h-4 w-4 text-[#86868b]" />
									</button>
								</div>

								<div className="relative min-h-[200px] overflow-hidden">
									<AnimatePresence custom={direction} mode="popLayout">
										{step === "method" && (
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
													onClick={() => onSelectMethod("qr")}
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
													onClick={() => onSelectMethod("card")}
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

										{step === "details" && (
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
													onClick={onConfirm}
												>
													Confirmar Pagamento
												</button>
											</motion.div>
										)}

										{step === "processing" && (
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

										{step === "success" && (
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
													onClick={onClose}
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
	);
}
