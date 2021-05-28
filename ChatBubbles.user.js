// ==UserScript==
// @name          Chat Bubbles for Torn
// @namespace     https://github.com/Pi77Bull
// @match         https://www.torn.com/*
// @grant         GM_addStyle
// @grant         GM_getValue
// @grant         GM_setValue
// @version       2.0.0
// @author        Pi77Bull [2082618]
// @run-at        document-start
// @inject-into   content
// ==/UserScript==

/* Change false to true in the line below to edit the settings: */
const edit = false;
/* Don't forget to reset it to false again after you're finished. */

/* Change the values below to your preferences. */
if (edit) {
	GM_setValue('config', {
		bubbleColor: '#dddddd',
		bubbleColorDarkMode: '#454545',

		meBubbleColor: '#2162a7',
		meBubbleColorDarkMode: '#37464f',

		fontSize: '1.3em',
		fontFamily: 'Ubuntu, Segoe UI',
	});
}

const WAIT_FOR = (selector, config = { attributes: true, childList: true, subtree: true }, parent = document) => {
	return new Promise((resolve) =>
		new MutationObserver((mutations, observer) => {
			let selectedNode = parent.querySelector(selector);
			if (selectedNode) {
				resolve(selectedNode);
				observer.disconnect;
			}
		}).observe(document.documentElement, config)
	);
};

const config = { childList: true, subtree: true };

const observer = new MutationObserver((mutationsList) => {
	mutationsList.forEach((mutation) => {
		for (let node of mutation.addedNodes) {
			const classList = [...node.classList];
			if (classList.some((className) => className.startsWith('message_'))) {
				// new message
				classifyMessages([node]);
			} else if (
				classList.some((className) => className.startsWith('chat-box-content_')) &&
				![...mutation.target.classList].some((className) => className.startsWith('chat-box-settings_'))
			) {
				// chat maximized
				classifyMessages(node.querySelectorAll('[class^="message_"], [class*=" message_"]'));
				break;
			}
		}
	});
});

let userid;
let username;
WAIT_FOR('[class^="chat-box-wrap_"], [class*=" chat-box-wrap_"]', config).then((element) => {
	const userElement = document.body.querySelector('script[uid]');
	userid = userElement.getAttribute('uid');
	username = userElement.getAttribute('name');
	classifyMessages(document.querySelectorAll('[class^="message_"], [class*=" message_"]'));
	observer.observe(element, config);
});

function classifyMessages(messageElements) {
	messageElements.forEach((messageElement) => {
		messageElement.classList.add('bubbleend');
		messageElement.querySelector('a').textContent = messageElement.querySelector('a').textContent.replace(':', '');

		console.log(username);
		if (messageElement.querySelector('a').href.endsWith(userid)) {
			messageElement.classList.add('me');
		} else if (messageElement.querySelector('span').innerText.includes(username)) {
			messageElement.classList.add('mention');
		}

		if (messageElement.previousElementSibling?.querySelector('a').href === messageElement.querySelector('a').href) {
			messageElement.previousElementSibling.classList.remove('bubbleend');
			messageElement.classList.add('samesender');
		}
	});
}

const settings = GM_getValue('config', {
	bubbleColor: '#dddddd',
	bubbleColorDarkMode: '#454545',

	meBubbleColor: '#2162a7',
	meBubbleColorDarkMode: '#37464f',

	fontSize: '1.3em',
	fontFamily: 'Ubuntu, Segoe UI',
});

const lightColor = '#ffffff';
const darkColor = '#333333';

const fontColor = getBrightness(settings.bubbleColor) > 127.5 ? darkColor : lightColor;
const fontColorDarkMode = getBrightness(settings.bubbleColorDarkMode) > 127.5 ? darkColor : lightColor;
const meFontColor = getBrightness(settings.meBubbleColor) > 127.5 ? darkColor : lightColor;
const meFontColorDarkMode = getBrightness(settings.meBubbleColorDarkMode) > 127.5 ? darkColor : lightColor;

function getBrightness(colorString) {
	// https://awik.io/determine-color-bright-dark-using-javascript/
	// https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
	const el = document.createElement('xyz');
	el.style.backgroundColor = colorString;
	const [, r, g, b, a] = el.style.backgroundColor.match(/^rgba?\((\d+), (\d+), (\d+)(?:, (\d+(?:\.\d+)))?\)$/);
	const brightness = Math.sqrt(0.299 * r ** 2 + 0.587 * g ** 2 + 0.114 * b ** 2);
	el.remove();
	return brightness;
}

GM_addStyle(`
	#chatRoot {
		--bubbleColor: ${settings.bubbleColor};
		--bubbleColorDarkMode: ${settings.bubbleColorDarkMode};

		--meBubbleColor: ${settings.meBubbleColor};
		--meBubbleColorDarkMode: ${settings.meBubbleColorDarkMode};

		--fontSize: ${settings.fontSize};
		--fontFamily: ${settings.fontFamily};
		
		--fontColor: ${fontColor};
		--fontColorDarkMode: ${fontColorDarkMode};
		--meFontColor: ${meFontColor};
		--meFontColorDarkMode: ${meFontColorDarkMode};
	}
`);

GM_addStyle(`
	[class^='overview_'],
	[class*=' overview_'] {
		display: flex !important;
		flex-direction: column !important;
		height: 100%;
		box-sizing: border-box;
	}

	[class^='message_'],
	[class*=' message_'] {
		display: flex;
		flex-direction: column;
		border-top-left-radius: 0.25em;
		border-bottom-left-radius: 0.25em;
		border-top-right-radius: 1em;
		border-bottom-right-radius: 1em;
		background-color: var(--bubbleColor);
		border: 1px solid transparent;
		padding: 4px 6px 6px 6px !important;
		margin: 4px;
		width: max-content;
		max-width: calc(100% - 22px);
		box-shadow: 0px 2px 2px 0px rgba(50, 50, 50, 0.3);
		line-height: 1em !important;
		font-size: var(--fontSize);
		font-family: var(--fontFamily);
	}

	.dark-mode [class^='message_'],
	.dark-mode [class*=' message_'] {
		background-color: var(--bubbleColorDarkMode);
	}

	[class^='message_']:first-of-type,
	[class*=' message_']:first-of-type {
		margin-top: 0;
	}

	[class^='message_'] > a,
	[class*=' message_'] > a {
		width: max-content;
	}

	[class^='message_'] a,
	[class*=' message_'] a {
		color: inherit !important;
	}

	[class^='message_'].me,
	[class*=' message_'].me {
		align-self: flex-end;
		border-top-left-radius: 1em;
		border-bottom-left-radius: 1em;
		border-top-right-radius: 0.25em;
		border-bottom-right-radius: 0.25em;
		background-color: var(--meBubbleColor);
		color: var(--meFontColor);
	}

	[class^='message_'].me > a,
	[class*=' message_'].me > a {
		display: none;
	}

	.dark-mode [class^='message_'].me,
	.dark-mode [class*=' message_'].me {
		background-color: var(--meBubbleColorDarkMode);
		color: var(--meFontColorDarkMode);
	}

	[class^='message_'].bubbleend,
	[class*=' message_'].bubbleend {
		border-bottom-left-radius: 1em;
		border-bottom-right-radius: 1em;
	}

	[class^='message_'].samesender,
	[class*=' message_'].samesender {
		margin-top: 0;
	}

	[class^='message_'].samesender > a,
	[class*=' message_'].samesender > a {
		display: none;
	}

	[class^='message_'].mention,
	[class*=' message_'].mention {
		border: 1px solid;
	}

	[class^='chat-box-content_'],
	[class*=' chat-box-content_'] {
		color: var(--fontColor) !important;
	}

	.dark-mode [class^='chat-box-content_'],
	.dark-mode [class*=' chat-box-content_'] {
		color: var(--fontColorDarkMode) !important;
	}

	[class^='chat-last-message-label_'],
	[class*=' chat-last-message-label_'] {
		margin-top: auto !important;
	}
`);
