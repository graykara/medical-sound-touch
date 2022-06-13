import { writable } from 'svelte/store';

export let langCode = writable('1');
export let langText = writable('한국어');
export let volumeEnable = writable(true);
export let audio = new Audio();

let source = document.createElement('source');
source.type = "audio/mpeg";
audio.appendChild(source);
