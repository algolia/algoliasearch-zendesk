# Related Articles

This is the Zendesk Ticket app.  It has 2 views:
* ticket sidebar - displays related articles in relation to the ticket.  The relation is matched with configurable attributes that are either tags, author, or subject
* nav bar - displays as an icon on the left of the ticket section, and displays all articles that are searchable and also has autocomplete

The app is configurable with settings that can be changed in the admin section of the app.

## Development

* First, install the zendesk App Tools (zat) [Zendesk Install](https://developer.zendesk.com/documentation/apps/zendesk-app-tools-zat/installing-and-using-the-zendesk-apps-tools/)

Once that's installed, go to the ZendeskClientApp folder in you terminal
```
cd ZendeskClientApp
```
Assuming you haven't installed this app in your Zendesk environment, you'll first do zat create
```
zat create
```
There are parameters in the manifest file that will prompt you for the correct values.

For updating the app after making any changes, do zat update
```
zat update
```
