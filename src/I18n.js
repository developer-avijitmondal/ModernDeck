/*
	TweetDeck i18n v2
	Copyright (c) 2018-2020 dangered wolf, et al.
	Released under the MIT license
*/


let displayWarning = false;
let tweetDeckTranslateInitial;

// ModernDeck specific import, dummy function in tweetdeck-i18n
import { getPref } from "./StoragePreferences.js";
// Import the language data (common to tweetdeck-i18n and ModernDeck)
import languageData from "./DataI18n.js";

let langFull;
let langRoot;

// ModernDeck specific code, safe to ignore within tweetdeck-i18n
if (window.ModernDeck) {
	langFull = getPref("mtd_lang");
	langRoot = langFull.substring(0,2);
} else {
	langFull = navigator.language.replace("-","_");
	langRoot = navigator.language.substring(0,2);
}

export const getFullLanguage = () => langFull;
export const getMainLanguage = () => langRoot;
export const getFallbackLanguage = () => "en";


const mustachePatches = {
	"keyboard_shortcut_list.mustache":{
		"Open Navigation Drawer/Menu":1,
		"Command palette — <b>NEW!</b>":1,
		"Cmd &#8984;":1,
		"Like":1,
		"Add Column":1,
		"Actions":1,
		"Reply":1,
		"Retweet":1,
		"New Tweet":1,
		"Direct Message":1,
		"View user profile":1,
		"View Tweet details":1,
		"Close Tweet details":1,
		"Send Tweet":1,
		"Enter":1,
		"Backspace":1,
		"Ctrl":1,
		"Add column":1,
		"This menu":1,
		"Right":1,
		"Left":1,
		"Down":1,
		"Up":1,
		"Navigation":1,
		"Column 1－9":1,
		"Final column":1,
		"Expand/Collapse navigation":1,
		"Search":1,
		"Return":1
	},
	"twitter_profile_social_proof.mustache":{
		"and":1
	},
}

export const I18n = function(a, b, c, d, e, f) {

	if (!a) {
		console.warn("The I18n function was supposed to receive data but didn't. Here's some other information, if they aren't undefined: ", a, b, c, d, e);
		return "";
	}

	if ((a.includes("{{{") || a.includes("{{")) && !f){
		let hmm = I18n(a, b, c, d, e, 1);
		let no = I18n(hmm, b, c, d, e, 2);
		return no;
	}

	if (a.includes("{{{") && f === 2) {
		for (const key in b) {
			const replaceMe = b[key][getFullLanguage()] || b[key][getMainLanguage()] || b[key][getFallbackLanguage()];

			a = a.replace(/\{\{\{"+key+"\}\}\}/g,"\{\{\{"+replaceMe+"\}\}\}");
		}
		return a;
	}

	if (a.includes("{{") && f === 2) {
		return tweetDeckTranslateInitial(a, b, c, d, e);
	}

	if (a.substr(0,6) === "From @") { // 2020-05-04: I don't remember if this edge case is still necessary
		return I18n(a.substr(0,4)) + " @" + a.substr(6);
	}

	if (!b || f === 1) {
		if (languageData[a]) {
			return languageData[a][getFullLanguage()]||languageData[a][getMainLanguage()]||languageData[a][getFallbackLanguage()];
		} else {
			console.warn("Missing string translation: " + a);
			return (displayWarning ? "⚠" : "") + a;
		}
	} else {
		for (const key in b) {
			a = a.replace("{{" + key + "}}", b[key]);
		}
		return a;
	}

}

function patchColumnTitle() {
	if (TD && mR) {
		var columnData = mR.findFunction("getColumnTitleArgs")[0].columnMetaTypeToTitleTemplateData;
		for (var key in columnData) {
			columnData[key].title = I18n(columnData[key].title);
		}
	} else {
		console.log("Waiting for mR to be ready...");
		setTimeout(patchColumnTitle,10);
		return;
	}
}

function patchButtonText() {
	if (TD && mR) {
		let buttonData = mR.findFunction("tooltipText");

		for (let i = 0; i < buttonData.length; i++) {
			if (buttonData[i]) {
				if (buttonData[i].buttonText) {
					for (const key in buttonData[i].buttonText) {
						buttonData[i].buttonText[key] = I18n(buttonData[i].buttonText[key]);
					}
				}
				if (buttonData[i].tooltipText) {
					for (const key in buttonData[i].tooltipText) {
						buttonData[i].tooltipText[key] = I18n(buttonData[i].tooltipText[key]);
					}
				}
			}
		}
	} else {
		console.log("Waiting for mR to be ready...");
		setTimeout(patchButtonText, 10);
		return;
	}
}

function patchColumnTitleAddColumn() {
	if (TD && TD.controller && TD.controller.columnManager && TD.controller.columnManager.DISPLAY_ORDER) {
		let columnData = TD.controller.columnManager.DISPLAY_ORDER;

		for (const key in columnData) {
			columnData[key].title = I18n(columnData[key].title);
			if (columnData[key].attribution) {
				columnData[key].attribution = I18n(columnData[key].attribution);
			}
		}
	} else {
		console.log("Waiting for DISPLAY_ORDER and etc to be ready...");
		setTimeout(patchColumnTitleAddColumn,10);
		return;
	}
}

function patchMustaches() {
	if (TD_mustaches) {
		for (const key in mustachePatches) {
			if (TD_mustaches[key]) {
				for (const key2 in mustachePatches[key]) {
					try {
						TD_mustaches[key] = TD_mustaches[key].replace(new RegExp(key2, "g"), I18n(key2))
					} catch(e) {
						console.error("An error occurred while replacing mustache " + key2 + " in " + key);
						console.error(e);
					}
				}
			} else {
				console.warn("Mustache "+key+" was specified but was not found");
			}
		}
	} else {
		console.log("Waiting on TD_mustaches...");
		setTimeout(patchMustaches,10);
		return;
	}
}

function patchMiscStrings() {
	if (TD && TD.constants && TD.constants.TDApi) {
		for (const key2 in TD.constants.TDApi) {
			TD.constants.TDApi[key2] = I18n(key2);
		}
	} else {
		console.log("Waiting on TDApi...");
		setTimeout(patchMiscStrings,10);
		return;
	}
	if (TD && TD.controller && TD.controller.columnManager && TD.controller.columnManager.DISPLAY_ORDER_PROFILE) {
		for (const key2 in TD.controller.columnManager.DISPLAY_ORDER_PROFILE) {
			let prof = TD.controller.columnManager.DISPLAY_ORDER_PROFILE[key2];
			prof.title = I18n(prof.title);
		}
	} else {
		console.log("Waiting on TDApi...");
		setTimeout(patchMiscStrings,10);
		return;
	}
	if (TD && TD.controller && TD.controller.columnManager && TD.controller.columnManager.MENU_TITLE) {
		for (const key2 in TD.controller.columnManager.MENU_TITLE) {
			TD.controller.columnManager.MENU_TITLE[key2] = I18n(TD.controller.columnManager.MENU_TITLE[key2]);
		}
	} else {
		console.log("Waiting on TDApi...");
		setTimeout(patchMiscStrings,10);
		return;
	}
	if (TD && TD.controller && TD.controller.columnManager && TD.controller.columnManager.MENU_ATTRIBUTION) {
		for (const key2 in TD.controller.columnManager.MENU_ATTRIBUTION) {
			TD.controller.columnManager.MENU_ATTRIBUTION[key2] = I18n(TD.controller.columnManager.MENU_ATTRIBUTION[key2]);
		}
	} else {
		console.log("Waiting on TDApi...");
		setTimeout(patchMiscStrings,10);
		return;
	}
	if (TD && TD.controller && TD.controller.columnManager && TD.controller.columnManager.MODAL_TITLE) {
		for (const key2 in TD.controller.columnManager.MODAL_TITLE) {
			TD.controller.columnManager.MODAL_TITLE[key2] =
			I18n(TD.controller.columnManager.MODAL_TITLE[key2]);
		}
	} else {
		console.log("Waiting on TDApi...");
		setTimeout(patchMiscStrings,10);
		return;
	}
}

function patchTDTranslateFunction() {
	if (mR && mR.findFunction && mR.findFunction("en-x-psaccent")[0]) {
		tweetDeckTranslateInitial = mR.findFunction("en-x-psaccent")[0].default;
		mR.findFunction("en-x-psaccent")[0].default = function(a,b,c,d,e,f){ return I18n(a,b,c,d,e,f)}
	} else {
		setTimeout(patchTDTranslateFunction,10);
	}
}

export function startI18nEngine() {
	// Developer helper function to find strings within the mustache cluster
	window.findMustache = (str) => {
		let results = {};
		for (let mustache in TD_mustaches) {
			if (TD_mustaches[mustache].match(str)) {
				results[mustache] = TD_mustaches[mustache];
			}
		}
		return results;
	}

	patchTDTranslateFunction();
	patchMiscStrings();
	patchColumnTitle();
	patchButtonText();
	patchColumnTitleAddColumn();
	patchMustaches();
}

// In ModernDeck, the function is executed via mtdInject.js
if (!window.ModernDeck) {
	startI18nEngine();
}
