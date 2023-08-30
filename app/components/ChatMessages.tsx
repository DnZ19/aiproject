"use client";

import { FC, HTMLAttributes, useContext } from "react";
import { MessagesContext } from "../context/messages";
import { cn } from "../lib/utils";
import Markdown from "./Markdown";

interface ChatMessageProps
	extends HTMLAttributes<HTMLDivElement> {}

const ChatMessages: FC<ChatMessageProps> = ({
	className,
	...props
}) => {
	const { messages } = useContext(MessagesContext);
	const inverseMessages = [...messages].reverse();

	return (
		<div
			{...props}
			className={cn(
				"flex flex-col-reverse gap-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch",
				className
			)}>
			<div className="flex-1 flex-grow" />
			{inverseMessages.map((message) => (
				<div key={message.id} className="chat-message">
					<div
						className={cn("flex items-end", {
							"justify-end": message.isUserMessage,
						})}>
						<div
							className={cn(
								"flex flex-col space-y-2 text-sm max-w-xs mx-2 overflow-hidden",
								{
									"bg-blue-300 text-gray-900 px-4 py-1 rounded-md w-40":
										message.isUserMessage,
									"bg-gray-200 text-gray-900 px-4 py-1 mt-4 rounded-md":
										!message.isUserMessage,
								}
							)}>
							<Markdown text={message.text} />
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default ChatMessages;
