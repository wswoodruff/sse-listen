# sse-listen

Use this `schmervice` service to listen to an sse stream in Node

## sseService
### listen({ url, events, onOpen, onClose, onError })
- `url` link that will respond with an SSE connection
- `events`
Custom event handlers to listen for on the SSE connection.
It sometimes makes sense to send down events with a name/label from an SSE endpoint.
  - Ex: `status` seen in [txt-me](https://github.com/wswoodruff/txt-me/blob/master/lib/expose/commands.js#L32-L53)
