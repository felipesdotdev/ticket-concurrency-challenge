"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

interface OrderSummaryProps {
	quantity: number;
	setQuantity: (q: number) => void;
	stock: number;
	totalPrice: number;
	onCheckout: () => void;
	maxQuantity?: number;
}

export function OrderSummary({
	quantity,
	setQuantity,
	stock,
	totalPrice,
	onCheckout,
	maxQuantity = 5,
}: OrderSummaryProps) {
	const handleIncrement = () =>
		setQuantity(Math.min(stock, maxQuantity, quantity + 1));
	const handleDecrement = () => setQuantity(Math.max(1, quantity - 1));

	return (
		<motion.div className="space-y-6 rounded-[22px] bg-[#F5F5F7] p-8" layout>
			<div className="flex items-center justify-between">
				<span className="font-semibold text-[#1d1d1f] text-[14px]">
					Quantidade
				</span>
				<div className="flex items-center gap-4 rounded-full border border-[#d2d2d7] bg-white p-1">
					<button
						className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F5F7]"
						onClick={handleDecrement}
					>
						<Minus className="h-4 w-4" />
					</button>
					<span className="w-4 text-center font-semibold text-[14px]">
						{quantity}
					</span>
					<button
						className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F5F7] disabled:opacity-50"
						disabled={quantity >= stock || quantity >= maxQuantity}
						onClick={handleIncrement}
					>
						<Plus className="h-4 w-4" />
					</button>
				</div>
			</div>

			<div className="space-y-4 pt-2 text-center">
				<div className="flex items-baseline justify-between">
					<span className="text-[#86868b] text-[14px]">Total a pagar</span>
					<span className="font-semibold text-[#1d1d1f] text-[32px] tracking-tight">
						R$ {totalPrice}
					</span>
				</div>

				<motion.button
					className={`flex h-[52px] w-full items-center justify-center rounded-[14px] font-normal text-[17px] text-white shadow-md transition-all ${
						stock === 0
							? "cursor-not-allowed bg-[#86868b]"
							: "bg-[#0071E3] hover:bg-[#0077ED]"
					}`}
					disabled={stock === 0}
					onClick={onCheckout}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					{stock === 0 ? "Esgotado" : "Checkout Seguro"}
				</motion.button>
			</div>
		</motion.div>
	);
}
