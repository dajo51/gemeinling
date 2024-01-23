import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const currentPlayerName = writable(browser && localStorage.getItem('currentPlayerName'));
currentPlayerName.subscribe((value) => {
	if (browser) return localStorage.setItem('currentPlayerName', value);
});
