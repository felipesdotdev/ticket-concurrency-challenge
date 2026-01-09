"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	CheckoutModal,
	type ModalStep,
	type PaymentMethod,
} from "../components/landing/checkout-modal";
import { Hero } from "../components/landing/hero";
import { Navbar } from "../components/landing/navbar";
import { OrderSummary } from "../components/landing/order-summary";
import { StickyHeader } from "../components/landing/sticky-header";
import { StockMonitor } from "../components/landing/stock-monitor";
import { TicketGrid } from "../components/landing/ticket-grid";
import { getTickets, purchaseTicket } from "../lib/api";
import { useSocket } from "../providers/socket-provider";

/**
 * @name TicketStormCupertinoPaymentRefined
 * @description Sistema com animações de navegação bidirecional (Push/Pop) estilo iOS.
 * - Traduzido para Português do Brasil.
 * - Refatorado para melhor manutenibilidade.
 */

const TIERS_SKELETON = [
	{
		id: "skeleton-1",
		name: "Carregando...",
		price: 0,
		desc: "Buscando ingressos...",
		features: [],
		availableQuantity: 0,
	},
];

const STEP_ORDER = {
	method: 0,
	details: 1,
	processing: 2,
	success: 3,
};

export default function App() {
	// System State
	const { lastEvent, userId } = useSocket();
	const [tiers, setTiers] = useState<any[]>(TIERS_SKELETON);
	const [selectedTier, setSelectedTier] = useState<string | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [stock, setStock] = useState(0);
	const [totalStock, setTotalStock] = useState(0);
	const [logs, setLogs] = useState<
		{ id: number; text: string; time: string }[]
	>([]);
	const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

	// Modal State & Navigation Logic
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalStep, setModalStep] = useState<ModalStep>("method");
	const [direction, setDirection] = useState(0); // -1 (back), 1 (forward)
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);

	// Initial Data Fetch
	useEffect(() => {
		getTickets()
			.then((data) => {
				const formatted = data.map((t) => ({
					id: t.id,
					name: t.name,
					price: t.price / 100,
					desc: t.description,
					features: ["Ingresso Oficial", "Acesso Garantido"],
					availableQuantity: t.availableQuantity,
					totalQuantity: t.totalQuantity,
				}));
				setTiers(formatted);
				if (formatted.length > 0) {
					setSelectedTier(formatted[0].id);
					setStock(formatted[0].availableQuantity);
					setTotalStock(formatted[0].totalQuantity);
				}
			})
			.catch((err) => console.error("Failed to fetch tickets", err));
	}, []);

	// Real-time Ticket Updates
	useEffect(() => {
		if (lastEvent?.type === "TICKET_UPDATE") {
			const { ticketId, availableQuantity: newQuantity } = lastEvent.data;

			// Add to logs
			setLogs((prev) =>
				[
					{
						id: Date.now(),
						text: `Nova compra detectada! Restam ${newQuantity} unidades.`,
						time: new Date().toLocaleTimeString(),
					},
					...prev,
				].slice(0, 5)
			);

			// Update local state for immediate feedback
			setTiers((prev) =>
				prev.map((t) =>
					t.id === ticketId ? { ...t, availableQuantity: newQuantity } : t
				)
			);

			// Update large stock number if it's the selected tier
			if (ticketId === selectedTier) {
				setStock(newQuantity);
				// Auto-adjust quantity if it exceeds new stock
				if (quantity > newQuantity) {
					setQuantity(Math.max(1, newQuantity));
				}
			}
		}
	}, [lastEvent, selectedTier, quantity]);

	// Update stock when selection changes
	useEffect(() => {
		if (selectedTier) {
			const t = tiers.find((tier) => tier.id === selectedTier);
			if (t && typeof t.availableQuantity === "number") {
				setStock(t.availableQuantity);
				setTotalStock(t.totalQuantity);
			}
		}
	}, [selectedTier, tiers]);

	// Navigation Helper
	const navigateTo = (newStep: ModalStep) => {
		const newIndex = STEP_ORDER[newStep];
		const oldIndex = STEP_ORDER[modalStep];
		setDirection(newIndex > oldIndex ? 1 : -1);
		setModalStep(newStep);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setTimeout(() => {
			setModalStep("method");
			setPaymentMethod(null);
			setDirection(0);
		}, 300);
	};

	// Real-time Order Updates - Action Handler
	useEffect(() => {
		if (lastEvent?.type === "ORDER_UPDATE" && currentOrderId) {
			const { orderId, status, message } = lastEvent.data;

			if (orderId === currentOrderId) {
				if (status === "COMPLETED") {
					navigateTo("success");
					toast.custom(
						(t) => (
							<div className="flex w-[350px] items-center gap-4 rounded-2xl border border-white/20 bg-white/80 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34C759] text-white shadow-sm">
									<Check className="h-5 w-5" />
								</div>
								<div>
									<h4 className="font-semibold text-[#1d1d1f] text-sm tracking-tight">
										Pedido Confirmado
									</h4>
									<p className="text-[#86868b] text-xs">
										Seus ingressos estão garantidos.
									</p>
								</div>
							</div>
						),
						{ duration: 5000, position: "top-right" }
					);
				} else {
					toast.error(`Falha: ${message}`);
					closeModal();
				}
				setCurrentOrderId(null);
			}
		}
	}, [lastEvent, currentOrderId]);

	const currentTierData = tiers.find((t) => t.id === selectedTier);
	const totalPrice = (currentTierData?.price || 0) * quantity;

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
		if (!selectedTier) return;
		navigateTo("processing");

		try {
			const response = await purchaseTicket({
				ticketId: selectedTier,
				userId: userId || "anon",
				idempotencyKey: crypto.randomUUID(),
				quantity,
			});

			setCurrentOrderId(response.id);
		} catch (error) {
			console.error("Payment failed", error);
			toast.error("Erro ao enviar pedido. Tente novamente.");
			closeModal();
		}
	};

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#F5F5F7] pb-32 font-sans text-[#1D1D1F] selection:bg-[#0071E3] selection:text-white">
			<Navbar />
			<StickyHeader />
			<Hero />

			<section
				className="relative z-20 border-[#d2d2d7]/30 border-t bg-white py-24"
				id="configurator"
			>
				<div className="mx-auto grid max-w-[1024px] grid-cols-1 items-start gap-16 px-6 md:grid-cols-2">
					<StockMonitor logs={logs} stock={stock} totalStock={totalStock} />

					<div className="space-y-8">
						<TicketGrid
							onSelectTier={setSelectedTier}
							selectedTier={selectedTier}
							tiers={tiers}
						/>

						<OrderSummary
							onCheckout={openCheckout}
							quantity={quantity}
							setQuantity={setQuantity}
							stock={stock}
							totalPrice={totalPrice}
						/>
					</div>
				</div>
			</section>

			<CheckoutModal
				direction={direction}
				isOpen={isModalOpen}
				onClose={closeModal}
				onConfirm={handleConfirmPayment}
				onNavigateBack={() => navigateTo("method")}
				onSelectMethod={handleSelectMethod}
				paymentMethod={paymentMethod}
				step={modalStep}
				totalPrice={totalPrice}
			/>
		</div>
	);
}
