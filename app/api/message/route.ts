import { chatbotPrompt } from "@/app/helpers/constants/chatbot-prompt";
import {
	ChatGPTMessage,
	OpenAIStream,
	OpenAIStreamPayload,
} from "@/app/lib/openai-stream";
import { MessageArraySchema } from "@/app/lib/validators/message";

export async function POST(req: Request) {
	const { messages } = await req.json();

	//console.log("Received Messages:", messages);

	const parsedMessages = MessageArraySchema.parse(messages);

	const outboundMessages: ChatGPTMessage[] =
		parsedMessages.map((message) => ({
			role: message.isUserMessage ? "user" : "system",
			content: message.text,
		}));

	outboundMessages.unshift({
		role: "system",
		content: chatbotPrompt,
	});

	const payload: OpenAIStreamPayload = {
		model: "gpt-3.5-turbo",
		messages: outboundMessages,
		temperature: 0.9,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
		max_tokens: 500,
		stream: true,
		n: 1,
	};

	const stream = await OpenAIStream(payload);

	return new Response(stream);
}
