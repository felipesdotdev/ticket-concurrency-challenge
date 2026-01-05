export default function DesignPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-[#1c1c1c] p-4 font-sans text-[#1c1c1c]">
			<div className="relative w-full max-w-[380px] overflow-hidden rounded-3xl bg-white shadow-2xl">
				{/* Top Section */}
				<div className="px-8 pt-8 pb-6">
					{/* Header - Route Visual */}
					<div className="mb-2 flex items-center justify-between">
						<div className="flex items-center gap-2 font-medium text-gray-400 text-xs tracking-wide">
							<span>FROM</span>
							<div className="h-2 w-2 rounded-full border-[1.5px] border-gray-400" />
						</div>

						<div className="relative mx-2 flex-1 border-gray-300 border-t-[1.5px] border-dashed">
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
								<svg
									className="rotate-90 text-black"
									fill="currentColor"
									height="20"
									viewBox="0 0 24 24"
									width="20"
								>
									<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
								</svg>
							</div>
						</div>
						<div className="flex items-center gap-2 font-medium text-gray-400 text-xs tracking-wide">
							<div className="h-2 w-2 rounded-full bg-gray-500" />
							<span>TO</span>
						</div>
					</div>
					{/* Airport Codes */}
					<div className="mb-1 flex items-start justify-between">
						<div className="flex flex-col">
							<span className="font-bold text-4xl tracking-tight">CDG</span>
						</div>

						<div className="mt-2 flex flex-col items-center">
							<span className="mb-1 font-bold text-[10px] text-gray-500">
								1 hour 45 minutes
							</span>
							<span className="rounded-full bg-black px-3 py-1 font-bold text-[10px] text-white">
								Direct
							</span>
						</div>
						<div className="flex flex-col text-right">
							<span className="font-bold text-4xl tracking-tight">FLR</span>
						</div>
					</div>
					{/* Airport Names */}
					<div className="mb-6 flex items-start justify-between text-gray-500 text-xs leading-tight">
						<div className="w-24">Paris Charles de Gaulle Airport</div>
						<div className="w-24 text-right">Florence Peretola Airport</div>
					</div>
					{/* Times */}
					<div className="mb-6 flex items-end justify-between">
						<div className="flex flex-col">
							<span className="font-bold text-lg">09:30 AM</span>
							<span className="text-gray-500 text-xs">Jan 18, Sun</span>
						</div>
						<div className="flex flex-col text-right">
							<span className="font-bold text-lg">11:15 AM</span>
							<span className="text-gray-500 text-xs">Jan 18, Sun</span>
						</div>
					</div>
					{/* Blue Info Box */}
					<div className="mb-6 flex items-center justify-between rounded-2xl bg-[#aebcd6] p-4">
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-gray-600">
								Boarding time
							</span>
							<span className="font-bold text-sm">09:00 AM</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-gray-600">
								Terminal
							</span>
							<span className="font-bold text-sm">2E</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-gray-600">
								Gate
							</span>
							<span className="font-bold text-sm">C21</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-gray-600">
								Flight
							</span>
							<span className="font-bold text-sm">AF1234</span>
						</div>
					</div>
					{/* Passenger Info */}
					<div className="flex items-center justify-between">
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-gray-500">
								Passenger
							</span>
							<span className="font-bold text-base text-black">John Smith</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-gray-500">
								Seat
							</span>
							<span className="font-bold text-base text-black">15C</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-gray-500">
								Class
							</span>
							<span className="font-bold text-base text-black">Economy</span>
						</div>
					</div>
				</div>
				{/* Divider Area with Cutouts */}
				<div className="relative flex h-12 w-full items-center justify-center">
					{/* Left Cutout */}
					<div className="absolute left-[-20px] h-10 w-10 rounded-full bg-[#1c1c1c]" />
					{/* Right Cutout */}
					<div className="absolute right-[-20px] h-10 w-10 rounded-full bg-[#1c1c1c]" />
					{/* Dashed Line */}
					<div className="w-[82%] border-gray-300 border-t-2 border-dashed" />
				</div>
				{/* Barcode Section */}
				<div className="px-8 pt-2 pb-8">
					<div className="flex h-16 select-none items-stretch justify-between overflow-hidden">
						{/* Simulate Barcode with many divs of varying widths */}
						{[...Array(45)].map((_, i) => (
							<div
								className={`h-full bg-black ${Math.random() > 0.5 ? "w-1" : "w-[2px]"} ${Math.random() > 0.7 ? "mx-[1px]" : "mx-0"}`}
								key={i}
							/>
						))}
						{/* Add some thicker bars for realism */}
						<div className="h-full w-2 bg-black" />
						<div className="mx-[1px] h-full w-1 bg-black" />
						<div className="mx-[1px] h-full w-3 bg-black" />
						{[...Array(10)].map((_, i) => (
							<div
								className={`h-full bg-black ${Math.random() > 0.5 ? "w-1.5" : "w-[3px]"} mx-[1px]`}
								key={`end-${i}`}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
