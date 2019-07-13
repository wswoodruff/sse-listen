# sse-listen

Use this `schmervice` service to listen to an sse stream in Node

## sseService
### listen({ url, events, onOpen, onClose, onError })
- `url`: link that responds with an SSE connection
- `events`:
Custom event handlers to listen for on the SSE connection.
Listening on named events is currently the only supported way to listen for events.
  - Ex: `status` seen in [txt-me](https://github.com/wswoodruff/txt-me/blob/master/lib/expose/commands.js#L32-L53)
