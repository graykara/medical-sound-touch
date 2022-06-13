import { writable } from 'svelte/store';
import { getStoredPosts, saveState } from './storage';

export const lists = writable([]);

lists.subscribe((val) => {
	if (val.length !== 0) {
		saveState(JSON.stringify(val, null, 2));
	}
});

export function getListStore() {
  const { subscribe, set } = writable([]);

  return {
    subscribe,
    set: (data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          saveState(JSON.stringify(data, null, 2));
          resolve();
        }, 100);
      });
    },

    init: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          getStoredPosts().then((res) => {
            console.log('# RES', res)

            lists.set(res);
            set(res);
          });
          resolve();
        }, 100);
      });
    }
  }
}

export const list_store = getListStore();
