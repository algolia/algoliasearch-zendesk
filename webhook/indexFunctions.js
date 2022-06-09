require('dotenv').config();

const algoliasearch = require('algoliasearch');
const zendesk = require('node-zendesk');

var packageJson = require('./package.json');

const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
algoliaClient.addAlgoliaAgent('node-zendesk', packageJson.dependencies.node-zendesk);

const zendeskArticleClient = zendesk.createClient({
    username:  process.env.ZENDESK_EMAIL,
    token:     process.env.ZENDESK_TOKEN,
    subdomain: process.env.ZENDESK_APP_NAME,
    helpcenter: true,
  });

const zendeskTicketClient = zendesk.createClient({
    username:  process.env.ZENDESK_EMAIL,
    token:     process.env.ZENDESK_TOKEN,
    subdomain: process.env.ZENDESK_APP_NAME,
});

async function indexItems(items, indexName, facets) {
    console.time("Index " + indexName);
    const fullName = process.env.ALGOLIA_INDEX_PREFIX + process.env.ZENDESK_APP_NAME + "_" + indexName;
    try {
        // set all of the keys as searchable
        let keys = Object.keys(items[0]);
        keys = keys.filter(key => key !== 'objectID');
        const index = algoliaClient.initIndex(fullName);
        const objectIds = await index.replaceAllObjects(items);
        await index.setSettings({
            searchableAttributes: keys,
            attributesForFaceting: facets
        });
        console.log(items.length + " " + fullName + " indexed");

    } catch (e) {
        console.error(e);
    }
    console.timeEnd("Index " + indexName);
}

async function indexArticles() {
    console.time("Articles");

    zendeskArticleClient.sections.sideLoad = ['categories'];
    zendeskArticleClient.articles.sideLoad = ['users'];

    try {
        let articles = [];
        const sectionData = await zendeskArticleClient.sections.list();
        let sections = {};
        sectionData.forEach(section => sections[section.id] = section);
        // console.log(sections);

        const articleData = await zendeskArticleClient.articles.list();
        for (var i = 0;i < articleData.length;i++) {
            const article = articleData[i];            
            const comments = await zendeskArticleClient.articlecomments.listByArticle(article.id);
            const commentsCount = comments[0].count;
            let lastCommentDate = '';
            if ( commentsCount > 0 ) {
                lastCommentDate = comments[0].comments[0].created_at;
            }
            const votes = await zendeskArticleClient.votes.listByArticle(article.id);
            const voteCount = (votes && votes.length > 0)? votes.length : 0;
            // console.log("Comments " + commentsCount + " vote " + voteCount);

            let alArticle = {
                objectID: article.id,
                name: article.name,
                body: article.body,
                created_at: article.created_at,
                updated_at: article.updated_at,
                labels: article.label_names,
                url: article.html_url,
                author: article.user.name,
                comments_count: commentsCount,
                vote_count: voteCount,
                last_comment_date: lastCommentDate
            }

            if ( article.section_id ) {
                let section = sections[article.section_id];
                let category = section.category;
                alArticle['section'] = section.name;
                alArticle['category'] = category.name;
            }
            articles.push(alArticle);
        }
        // console.log(articles);
        console.timeEnd("Articles");
        indexItems(articles, "articles", ["category","section"]);

    } catch (e) {
        console.error(e);
    }
};

function indexSingleTicket(ticketId) {
    // get the ticket so I can get the types
    zendeskTicketClient.tickets.sideLoad = ['users'];
    zendeskTicketClient.tickets.show(parseInt(ticketId)).then(function(ticket) {
        alTicket = buildTicketData(ticket);

        const fullName = process.env.ALGOLIA_INDEX_PREFIX + process.env.ZENDESK_APP_NAME + "_tickets";
        const index = algoliaClient.initIndex(fullName);

        index.saveObjects([alTicket]).then(res => {
            console.log("Index updated ", res);
        }).catch(err => {
            console.log("An error occurred ", err);
        });

    });
}

async function getAuthor(commentData) {
    const author = await zendeskTicketClient.users.show(commentData.author_id);
    // console.log("Author", author);
    return author;
}

async function getTicketComments(ticketId) {
    zendeskTicketClient.requests.sideLoad = ['users'];
    const ticketComments = await zendeskTicketClient.requests.listComments(ticketId);
    const comments = ticketComments[0].comments;
    for (var i = 0;i < comments.length;i++) {
        const comment = comments[i];
        const author = await getAuthor(comment);
        comment.author = author;
    }
    // console.log(comments);
    return comments;

}

function getCustomFields() {
    const customFieldsString = process.env.CUSTOM_FIELDS;
    if ( customFieldsString ) {
        const customFieldsArray = customFieldsString.split("|");
        const customFields = [];
        for (var i = 0;i < customFieldsArray.length;i++) {
            const customFieldData = customFieldsArray[i].split(",");
            customFields.push({"id":customFieldData[0], "name":customFieldData[1]});
        }
        return customFields;
    }
    return [];
}

async function buildTicketData(ticket) {
    const customFields = getCustomFields();
    const ticketComments = await getTicketComments(ticket.id);
    let alTicket = {};
    if ( ticketComments.length > 0 ) {
        for (var k = 0;k < ticketComments.length;k++) {
            const comment = ticketComments[k];
            alTicket = {
                objectID: `${ticket.id}_${comment.id}`,
                subject: ticket.subject,
                plain_body: comment.plain_body,
                ticketCreatedAt: ticket.created_at,
                ticketUpdatedAt: ticket.updated_at,
                commentCreatedAt: comment.created_at,
                ticketId: ticket.id,
                requester: {name: ticket.requester.name, email: ticket.requester.email},
                submitter: {name: ticket.submitter.name, email: ticket.submitter.email},
                assignee: {name: ticket.assignee.name, email: ticket.assignee.email},
                author: {name: comment.author.name, email: comment.author.email},
                ticketUrl: `https://${process.env.ZENDESK_APP_NAME}.zendesk.com/agent/tickets/${ticket.id}`,
                status: ticket.status,
                type: ticket.type,
                channel: ticket.via.channel,
            }
        }
    } else {
        alTicket = {
            objectID: `${ticket.id}`,
            subject: ticket.subject,
            plain_body: ticket.description,
            ticketCreatedAt: ticket.created_at,
            ticketUpdatedAt: ticket.updated_at,
            ticketId: ticket.id,
            requester: {name: ticket.requester.name, email: ticket.requester.email},
            submitter: {name: ticket.submitter.name, email: ticket.submitter.email},
            assignee: {name: ticket.assignee.name, email: ticket.assignee.email},
            ticketUrl: `https://${process.env.ZENDESK_APP_NAME}.zendesk.com/agent/tickets/${ticket.id}`,
            status: ticket.status,
            type: ticket.type,
            channel: ticket.via.channel,
        }
    }

    for (var i = 0;i < customFields.length;i++) {
        // [ { id: 6656901144205, value: null } ]
        const customFieldsInTicket = ticket.custom_fields;
        for (var k = 0;k < customFieldsInTicket.length;k++) {
            if ( customFields[i].id == customFieldsInTicket[k].id ) {
                console.log("Found field " + customFields[i].name + "=" + customFieldsInTicket[k].value);
                alTicket[customFields[i].name] = customFieldsInTicket[k].value;
            }
        }
    }
    // console.log(alTicket);
    return alTicket;
}

async function indexTickets() {
    
    // index tickets
    console.time("Tickets");
    zendeskTicketClient.tickets.sideLoad = ['users'];

    try {
        let tickets = [];
        const ticketData = await zendeskTicketClient.tickets.list();
        for ( var i = 0;i < ticketData.length;i++) {
            const ticket = ticketData[i];
            const alTicket = await buildTicketData(ticket);
            tickets.push(alTicket);
        }
        // console.log(tickets);
        console.timeEnd("Tickets");
        indexItems(tickets, "tickets", ['channel','type','status']);

    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    indexTicket: indexSingleTicket,
    indexArticles: indexArticles,
    indexTickets: indexTickets
}


