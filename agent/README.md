# Zendesk ticket, users and organizations search

This demo is not supposed to be run standalone. It is supposed
to be loaded inside an iframe of someone's zendesk app.

## Why are we better than the current implementation ?

Zendesk already has a research. But :
- kind of long (half a second for a request)
- no typo tolerance
- no facetting
- no fast-search bar (you have to go to a full results page)

Our advantages :
- we index a lot more things than them (e.g. comments of a ticket)
- ...
