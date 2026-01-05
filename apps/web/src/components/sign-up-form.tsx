"use client";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<h1 className="mb-4 text-2xl">Sign Up (Placeholder)</h1>
			<button className="text-blue-500 underline" onClick={onSwitchToSignIn}>
				Switch to Sign In
			</button>
		</div>
	);
}
