"use client"; //interactivity

import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import AiLogo from "public/favicon-32x32.png";

export default function Nav({ user }: Session) {
	return (
		<nav className="flex justify-between items-center py-8 w-full px-8">
			<div>
				<Image
					src={AiLogo}
					alt="AI Logo"
					width={48}
					height={48}
				/>
			</div>
			<ul className="flex items-center gap-12">
				{!user && (
					<li className="bg-teal-950 text-white py-2 px-4 rounded-md">
						<button onClick={() => signIn()}>
							Sign In
						</button>
					</li>
				)}
				{user && (
					<div className="flex justify-between gap-4 items-center">
						<li className="bg-teal-200 text-white py-2 px-4 rounded-md ">
							<button onClick={() => signOut()}>
								Sign Out
							</button>
						</li>
						<li>
							<Image
								src={user?.image as string}
								alt={user?.name as string}
								width={48}
								height={48}
								className="rounded-full"
							/>
						</li>
					</div>
				)}
			</ul>
		</nav>
	);
}
