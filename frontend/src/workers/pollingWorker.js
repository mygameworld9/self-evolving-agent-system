/* eslint-disable no-restricted-globals */
// Web Worker to handle polling timer in the background
// Browsers throttle setInterval in background tabs, but Workers are generally not throttled.

let intervalId = null;

self.onmessage = (e) => {
    const { type, interval } = e.data;

    if (type === 'START') {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => {
            self.postMessage({ type: 'TICK' });
        }, interval || 2000);
    } else if (type === 'STOP') {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
    }
};
