"use client";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<h1 className="mb-4 text-2xl">Sign In (Placeholder)</h1>
			<button className="text-blue-500 underline" onClick={onSwitchToSignUp}>
				Switch to Sign Up
			</button>
		</div>
	);
}
