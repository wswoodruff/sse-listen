'use strict';

const Schmervice = require('schmervice');
const Toys = require('toys');
const EventSource = require('eventsource');

const internals = {};

module.exports = class SseService extends Schmervice.Service {

    async listen({ url, events, onOpen, onClose, onError }) {

        if (!url) {
            throw new Error('"url" is required');
        }

        onOpen = onOpen || (() => console.log('SSE connection opened.'));
        onClose = onClose || (() => console.log('SSE connection closed.'));
        onError = onError || ((err) => console.log('SSE Error:\n', err));

        if (events && String(events) !== '[object Object]') {
            throw new Error('"events" must be an object');
        }

        const es = new EventSource(url);

        es.on('open', onOpen);
        es.on('error', onError);

        // Init cleanup
        const cleanupEvents = { open: onOpen, error: onError };

        // If there are events, let's register them for listening and for cleanup
        if (events) {
            Object.entries(events).forEach(([eventName, func]) => {

                const evtHandler = (evt) => {

                    // Send events after open event
                    // This condition comes from the SSE server
                    // sending down the 'open' event under the 'eventName'.
                    // If the server doesn't do that then
                    // there's no need for this.
                    // At any rate, this is here for convenience and won't
                    // affect users who don't practice this.
                    if (evt.data !== 'open') {
                        func(evt);
                    }
                };

                es.on(eventName, evtHandler);
                cleanupEvents[eventName] = evtHandler;
            });
        }

        // await until the end
        try {
            await Toys.event(es, 'end');
        }
        catch (err) {
            await onError(err);

            if (String(err.message) === 'undefined') {
                console.log('\nNOTE: An undefined error message is normally due to a timeout. Probably from nginx or the sse server\n');
            }
        }

        // Ensure connection to server is closed
        es.close();

        // Cleanup
        Object.entries(cleanupEvents).forEach(([eventName, func]) => {

            es.removeEventListener(eventName, func);
        });

        // Call 'onClose' after closing es connection and cleanup
        await onClose();

        return true;
    }
};
