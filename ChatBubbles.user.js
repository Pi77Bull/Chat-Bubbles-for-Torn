// ==UserScript==
// @name         Chat Bubbles for Torn
// @namespace    https://github.com/Pi77Bull
// @version      1.0
// @description  Makes the chat look like an ordinary messenger app.
// @author       Pi77Bull [2082618]
// @match        https://www.torn.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

let targetNode = document.querySelector("html");

let config = {
    childList: true,
    subtree: true
};

let msgObserver = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.addedNodes.length && mutation.addedNodes[0].classList) {
            console.log(mutation);
            if (mutation.target.classList.contains("chat-box_Wjbn9")) { // chat maximized
                styleMessages(mutation.addedNodes[0].querySelectorAll(".message_oP8oM"));
                let viewport = mutation.addedNodes[0].querySelector(".viewport_1F0WI");
                viewport.scrollTo(0, viewport.scrollHeight);
                break;
            } else if (mutation.addedNodes[0].classList.contains("message_oP8oM")) { // new message
                styleMessages(mutation.addedNodes);
                break;
            } else if (mutation.target.classList.contains("chat-settings-opts_1p3VN")) { // settings maximized first time
                let div = document.createElement("div");
                div.innerHTML = `<div class="setting-header">Chat Bubbles Settings</div><div class="setting-item"><div class="chat-opt-label_1t2AS t-gray-9 bold">My messages BG color</div><div class="setting-value"><input type="text" id="meColorText" class="text-input" maxlength="7" value="${settings.meColor}"><input type="color" id="meColor" class="color-input" value="${settings.meColor}"></div></div><div class="setting-item"><div class="chat-opt-label_1t2AS t-gray-9 bold">Font-Size</div><div class="setting-value"><input type="range" id="fontSize" min="12" max="20" value="${settings.fontSize.slice(0, -2)}"></div></div><div class="setting-item"><div class="chat-opt-label_1t2AS t-gray-9 bold">Font-Family</div><div class="setting-value"><input type="text" class="text-input" value="${settings.fontFamily}" id="fontFamily"></div></div>`;
                div.id = "chatbubbles-settings";
                document.querySelector(".chat-box-settings_Ogzjk .overview_1MoPG").appendChild(div);
                let meColor = document.querySelector("#meColor");
                let meColorText = document.querySelector("#meColorText");
                meColor.addEventListener("input", () => {
                    settings.meColor = meColor.value;
                    meColorText.value = meColor.value;
                    localStorage.setItem("chatbubbles", JSON.stringify(settings));
                    setCSSVARS({
                        "meColor": settings.meColor
                    });
                });
                meColorText.addEventListener("input", () => {
                    settings.meColor = meColorText.value;
                    meColor.value = meColorText.value;
                    localStorage.setItem("chatbubbles", JSON.stringify(settings));
                    setCSSVARS({
                        "meColor": settings.meColor
                    });
                });

                let fontSize = document.querySelector("#fontSize");
                fontSize.addEventListener("input", () => {
                    settings.fontSize = fontSize.value + "px";
                    localStorage.setItem("chatbubbles", JSON.stringify(settings));
                    setCSSVARS({
                        "fontSize": settings.fontSize
                    });
                });

                let fontFamily = document.querySelector("#fontFamily");
                fontFamily.addEventListener("input", () => {
                    settings.fontFamily = fontFamily.value;
                    localStorage.setItem("chatbubbles", JSON.stringify(settings));
                    setCSSVARS({
                        "fontFamily": settings.fontFamily
                    });
                });
                break;
            }
        }
    }
});

let username;

let observer = new MutationObserver(() => {
    if (!username && document.querySelector("script[name]")) {
        username = document.querySelector("script[name]").getAttribute("name");
    }

    if (document.querySelector(".chat-box-wrap_20_R_")) {


        msgObserver.observe(document.querySelector(".chat-box-wrap_20_R_"), config);

        styleMessages(document.querySelectorAll(".message_oP8oM")); // chats already maximized
        document.querySelectorAll(".viewport_1F0WI").forEach((e, i) => { // scroll all maximized chats to bottom
            e.scrollTo(0, e.scrollHeight);
        });

        observer.disconnect();
    }
});
observer.observe(targetNode, config);

function styleMessages(messages) {
    for (let m of messages) {
        let nodes = m.parentNode.childNodes;
        let i = Array.prototype.indexOf.call(nodes, m);
        let sender = nodes[i].querySelector("a").innerText.trim().replace(":", "");
        /*
                if (messages.length == 1) {
                    nodes[i].classList.add("animate");
                }
        */
        if (i > 0 && nodes[i - 1].querySelector("a").innerText.trim().replace(":", "") == sender) {
            nodes[i - 1].classList.remove("bubbleend");
            nodes[i].classList.add("bubbleend", "samesender");
        } else {
            nodes[i].classList.add("bubbleend", "bubblestart");
        }

        if (nodes[i].querySelector("a").innerText.trim().replace(":", "") == username) {
            nodes[i].classList.add("me");
        }

        if (nodes[i].querySelector("span").innerText.includes(username)) {
            nodes[i].classList.add("mention");
        }

        nodes[i].querySelector("a").innerText = nodes[i].querySelector("a").innerText.trim().replace(":", "");
    }
}

function setCSSVARS(obj) {
    for (let cssVar in obj) {
        document.documentElement.style.setProperty(`--${cssVar}`, obj[cssVar]);
    }
}


let defaults = {
    meColor: "#9fddf9",
    fontSize: "16px",
    fontFamily: "Arial"
};
let settings = JSON.parse(localStorage.getItem("chatbubbles"));

if (!settings) { // settings don't exist
    settings = defaults;
} else { // settings exist
    for (let e in defaults) {
        if (!settings.hasOwnProperty(e)) { // fill settings with missing defaults
            settings[e] = defaults[e];
        }
    }
}
localStorage.setItem("chatbubbles", JSON.stringify(settings));

setCSSVARS(settings);





GM_addStyle(`
.viewport_1F0WI {
    overflow-x: hidden;
    position: relative;
}

.chat-box_Wjbn9 .error_22pJp,
.chat-box_Wjbn9 .overview_1MoPG>div:last-child {
    clear: both;
    text-align: center;
}

.message_oP8oM {
    float: left;
    clear: both;
    border-top-left-radius: 4px;
    border-top-right-radius: 16px;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 16px;
    border: 1px solid transparent;
    width: auto;
    min-width: 1.2em;
    max-width: 95%;
    padding: 0 !important;
    margin: 2px 2px;
    background: white;
    box-shadow: 0px 2px 2px 0px rgba(50, 50, 50, 0.3);
    font-size: var(--fontSize);
    font-family: var(--fontFamily);
}

.message_oP8oM>a {
    display: block;
    margin: 0.2em 0.4em -0.2em 0.4em;
}

.message_oP8oM>span {
    margin: 0.2em 0.4em 0.2em 0.4em;
    display: block;
}

.message_oP8oM.me {
    float: right;
    border-top-left-radius: 16px;
    border-top-right-radius: 4px;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 4px;
    background: var(--meColor);
}

.message_oP8oM.bubbleend,
.message_oP8oM.bubbleend.me {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
}

.message_oP8oM:not(.bubblestart) {
    margin-top: 0;
}

.message_oP8oM.me>a,
.message_oP8oM.samesender>a {
    display: none;
}

.mention {
    background: lightgreen;
}

.staff_1NUHz>a::after {
    content: "Staff";
    float: right;
    font-size: 0.6em;
    font-family: monospace;
    color: #d83500;
    text-transform: uppercase;
}

.chat-box-content_2C5UJ .chat-opt-label_1t2AS {
    width: auto !important;
}

.setting-header {
    margin: 5px;
    text-decoration: underline;
    font-size: 14px;
    font-weight: bold;
    color: #999999;
}

.setting-item {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 5px;
}

.setting-value {
    margin-left: auto;
    min-width: 150px;
    display: flex;
    align-items: center;
}

.text-input {
    height: 2em;
    width: 60px;
    text-align: center;
    font-family: monospace !important;
    border: 1px solid black;
    flex-grow: 1;
}

.color-input {
    padding: 0;
    width: 32px;
    height: 32px;
}
`)