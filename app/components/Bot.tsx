"use client";

import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "react-hot-toast";
import { CornerDownLeft, Loader2 } from "lucide-react";

import {
	HTMLAttributes,
	useState,
	FC,
	useRef,
	useContext,
} from "react";

import { useMutation } from "react-query";
import { nanoid } from "nanoid";
import { Message } from "../lib/validators/message";
import ChatMessages from "./ChatMessages";
import { MessagesContext } from "../context/messages";

interface BotProps
	extends FC<HTMLAttributes<HTMLDivElement>> {}

export default function Bot({ user }: Session) {
	const textareaRef = useRef<HTMLTextAreaElement | null>(
		null
	);

	const [input, setInput] = useState<string>("");
	const {
		messages,
		addMessage,
		removeMessage,
		updateMessage,
		setIsMessageUpdating,
	} = useContext(MessagesContext);

	const { mutate: sendMessage, isLoading } = useMutation({
		mutationFn: async (message: Message) => {
			const response = await fetch("/api/message", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ messages: [message] }),
			});

			if (!response.ok) {
				throw new Error();
			}

			return response.body;
		},

		onMutate: (message) => {
			addMessage(message);
		},

		onSuccess: async (stream) => {
			if (!stream) throw new Error("No stream");

			// construct new message to add
			const id = nanoid();
			const responseMessage: Message = {
				id,
				isUserMessage: false,
				text: "",
			};

			addMessage(responseMessage);
			setIsMessageUpdating(true);

			const reader = stream.getReader();
			const decoder = new TextDecoder();
			let done = false;

			while (!done) {
				const { value, done: doneReading } =
					await reader.read();
				done = doneReading;
				const chunkValue = decoder.decode(value);
				updateMessage(id, (prev) => prev + chunkValue);
			}
			//clean up

			setIsMessageUpdating(false);
			setInput("");

			setTimeout(() => {
				textareaRef.current?.focus();
			}, 10);
		},

		onError: (_, message) => {
			toast.error(
				"Something went wrong. Please try again."
			);
			removeMessage(message.id);
			textareaRef.current?.focus();
		},
	});

	const handleClick = () => {
		// If the input is empty, don't send a message
		if (input.trim() === "") return;

		// Create a new message object
		const message: Message = {
			id: nanoid(),
			isUserMessage: true,
			text: input,
		};

		sendMessage(message);
	};

	const resetClick = () => {
		messages.slice(1).forEach((message) => {
			removeMessage(message.id);
		});

		setInput("");

		setTimeout(() => {
			textareaRef.current?.focus();
		}, 10);
	};

	return (
		<div className="flex flex-col items-center mt-8 w-auto">
			{!user && (
				<div className="flex flex-col items-start max-w-md">
					<p className="bg-zinc-200 text-gray-900 px-4 rounded-md mx-8 py-8 pb-12 border-2 border-black border-opacity-30">
						Hi, I am Scrumbles! I am a simple Chatbot that
						can answer Scrum Master questions.
						<br />
						<br />
						Please login with Google to make use of my
						service...
					</p>

					<div className="bg-teal-950 text-white py-2 px-4 rounded-md mt-8 mx-8">
						<button onClick={() => signIn()}>Login</button>
					</div>
				</div>
			)}
			{user && (
				<div className="flex flex-col items-center py-8 max-h-screen overflow-y-auto">
					<div className="flex flex-col gap-2 justify-center items-center py-8x bg-transparent w-full max-w-8xl px-4 py-4">
						<ChatMessages className="px-2 py-3 flex-1 bg-zinc-300 max-h-[calc(80vh-12rem)] overflow-y-auto border-2 border-black border-opacity-30 rounded-md" />
						<div className="relative mt-4 flex-1 overflow-hidden rounded-md border-none outline-none w-full">
							<TextareaAutosize
								ref={textareaRef}
								rows={2}
								maxRows={4}
								disabled={isLoading}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();

										const message: Message = {
											id: nanoid(),
											isUserMessage: true,
											text: input,
										};
										sendMessage(message);
									}
								}}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								autoFocus
								placeholder="Ask me something...."
								className="peer disabled:opacity-50 pr-14 pl-4 resize-none block w-full border-0 bg-zinc-200 py-1.5 text-gray-900 focus: ring-0 text-sm sm:leading-6 z-40"
							/>
							<div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
								<kbd
									onClick={handleClick}
									className="inline-flex items-center rounded border bg-white border-gray-200 px-1 font-sans text-xs text-gray-400 cursor-pointer">
									{isLoading ? (
										<Loader2 className="w-3 h-3 animate-spin" />
									) : (
										<CornerDownLeft className="w-3 h-3" />
									)}
								</kbd>
							</div>

							<div
								className="absolute inset-x-0 bottom-0 border-t border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-600 z-40"
								aria-hidden="true"
							/>
						</div>
						<div className="flex items-center justify-between gap-12">
							<button
								onClick={resetClick}
								className="mt-4 bg-gray-500 text-gray-200 px-4 py-1 rounded-md">
								Reset Conversation
							</button>
							<button
								onClick={handleClick}
								className="mt-4 bg-gray-200 text-gray-900 px-4 py-1 rounded-md">
								Ask!
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
