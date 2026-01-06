"use client";

interface Tier {
	id: string;
	name: string;
	price: number;
	desc: string;
	availableQuantity: number;
}

interface TicketGridProps {
	tiers: Tier[];
	selectedTier: string | null;
	onSelectTier: (id: string) => void;
}

export function TicketGrid({
	tiers,
	selectedTier,
	onSelectTier,
}: TicketGridProps) {
	return (
		<div className="space-y-4">
			{tiers.map((tier) => (
				<div
					className={`relative flex cursor-pointer items-center justify-between overflow-hidden rounded-[18px] border-2 p-6 transition-all duration-300 ${
						selectedTier === tier.id
							? "border-[#0071E3] bg-white shadow-sm"
							: "border-[#d2d2d7] bg-white hover:border-[#86868b]"
					}`}
					key={tier.id}
					onClick={() => onSelectTier(tier.id)}
				>
					<div>
						<div className="mb-1 flex items-center gap-2">
							<span className="font-semibold text-[#1d1d1f] text-[17px] tracking-tight">
								{tier.name}
							</span>
						</div>
						<p className="text-[#86868b] text-[12px]">{tier.desc}</p>
					</div>
					<div className="text-right">
						<span className="text-[#1d1d1f] text-[12px]">R$ {tier.price}</span>
					</div>
				</div>
			))}
		</div>
	);
}
