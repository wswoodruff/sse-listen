'use strict';

const Schmervice = require('schmervice');
const Toys = require('toys');
const EventSource = require('eventsource');

const internals = {};

module.exports = class SseService extends Schmervice.Service {

    async listen({ url, events, onOpen, onClose, onError }) {

        if (!url || !onOpen) {
            throw new Error('"url" and "onOpen" are required');
        }

        onClose = onClose || (() => console.log('SSE connection closed.'));
        onError = onError || ((err) => console.log('SSE Error:\n', err));

        if (events && String(events) !== '[object Object]') {
            throw new Error('"events" must be an object');
        }

        const es = new EventSource(url);

        es.on('open', onOpen);
        es.on('error', onError);

        const cleanupEvents = { open: onOpen, error: onError };

        // If there are events, let's register them for listening and for cleanup
        if (events) {
            Object.entries(events).forEach(([eventName, func]) => {

                const evtHandler = (evt) => {

                    // Send events after open event
                    // This condition comes from the SSE server
                    // sending down the open event under the 'eventName'.
                    // If the server doesn't send it down as that then
                    // there's no need for this.
                    // At any rate, this is here for convenience.
                    if (evt.data !== 'open') {
                        func(evt);
                    }
                };

                es.on(eventName, evtHandler);
                cleanupEvents[eventName] = evtHandler;
            });
        }

        // await until end
        try {
            await Toys.event(es, 'end');
        }
        catch (err) {
            await onError(err);
        }

        // Ensure connection to server is closed
        es.close();

        // Cleanup
        Object.entries(cleanupEvents).forEach(([eventName, func]) => {

            es.removeEventListener(eventName, func);
        });

        await onClose();

        return true;
    }
};
