import React from "react";
import Link from "next/link";

const MarkdownLite = ({ text }) => {
	const linkRegex = /\[(.+?)\]\((.+?)\)/g;
	const boldRegex = /\*\*(.+?)\*\*/g;
	const italicRegex = /\*(.+?)\*/g;

	const processSubString = (subStr) => {
		let formattedStr = subStr;
		formattedStr = formattedStr.replace(
			boldRegex,
			"<strong>$1</strong>"
		);
		formattedStr = formattedStr.replace(
			italicRegex,
			"<em>$1</em>"
		);
		return (
			<span
				dangerouslySetInnerHTML={{ __html: formattedStr }}
			/>
		);
	};

	// Split the text into paragraphs
	const paragraphs = text.split("\n\n");

	// First paragraph as summary
	const summary = paragraphs[0];

	return (
		<div>
			{/* <h2>Summary:</h2>
			<p>{processSubString(summary)}</p> */}

			{/* <h2>Content:</h2> */}
			{paragraphs.map(
				(
					paragraph: string | any[],
					i: React.Key | null | undefined
				) => {
					const parts = [];
					let lastIndex = 0;
					let match;

					while (
						(match = linkRegex.exec(paragraph)) !== null
					) {
						const [fullMatch, linkText, linkUrl] = match;
						const matchStart = match.index;
						const matchEnd = matchStart + fullMatch.length;

						if (lastIndex < matchStart) {
							parts.push(
								processSubString(
									paragraph.slice(lastIndex, matchStart)
								)
							);
						}

						parts.push(
							<Link
								target="_blank"
								rel="noopener noreferrer"
								className="break-words underline underline-offset-2 text-blue-600"
								key={linkUrl}
								href={linkUrl}>
								{linkText}
							</Link>
						);

						lastIndex = matchEnd;
					}

					if (lastIndex < paragraph.length) {
						parts.push(
							processSubString(paragraph.slice(lastIndex))
						);
					}

					return (
						<p className="py-2" key={i}>
							{parts.map((part, j) => (
								<React.Fragment key={j}>
									{part}
								</React.Fragment>
							))}
						</p>
					);
				}
			)}
		</div>
	);
};

export default MarkdownLite;
