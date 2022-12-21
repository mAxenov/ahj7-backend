const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('koa-cors');
const moment = require('moment')
const fs = require("fs");
const uuid = require('uuid');

const app = new Koa();
let dbData;
let data;
let id;

app.use(cors({
    allowMethods: ['GET', 'POST', 'DELETE', 'PATCH'],
}));

app.use(koaBody({
    urlencoded: true,
    multipart: true,
    json: true
}));

app.use(ctx => {
    const { method } = ctx.request.query;
    console.log(method);
    switch (method) {
        case 'allTickets':
            const body = fs.readFileSync('./bd/tickets.json', 'utf8');
            ctx.response.body = JSON.parse(body);
            return;
        case 'ticketById':
            ({ id } = ctx.request.query);
            console.log(id)
            dbData = JSON.parse(fs.readFileSync('./bd/tickets.json', (err, data) => (data)));
            ctx.response.body = dbData.find(item => item.id === id);
            return;
        case 'createTicket':
            data = ctx.request.body;
            data.created = moment().format('DD.MM.YY HH:mm');
            dbData = JSON.parse(fs.readFileSync('./bd/tickets.json', (err, data) => (data)));
            if (data.id !== "null") {
                dbData = dbData.map(item => {
                    if (item.id === data.id) {
                        console.log(data.id)
                        return data;
                    }
                    return item;
                });
            } else {
                data.id = uuid.v4();
                dbData.push(data);
            }
            fs.writeFileSync('./bd/tickets.json', JSON.stringify(dbData));
            ctx.response.body = data;
            return;
        case 'deleteTicket':
            ({ id } = ctx.request.query);
            dbData = JSON.parse(fs.readFileSync('./bd/tickets.json', (err, data) => (data)));
            dbData = dbData.filter(item => item.id !== id);
            fs.writeFileSync('./bd/tickets.json', JSON.stringify(dbData));
            ctx.response.body = { status: true };
            return;
        case 'updateTicket':
            data = ctx.request.body;
            data.created = moment().format('DD.MM.YY HH:mm');
            dbData = JSON.parse(fs.readFileSync('./bd/tickets.json', (err, data) => (data)));
            dbData = dbData.map(item => {
                if (item.id === data.id) {
                    console.log(data.id)
                    return data;
                }
                return item;
            });
            fs.writeFileSync('./bd/tickets.json', JSON.stringify(dbData));
            ctx.response.body = data;
            return;
        default:
            ctx.response.body = '404';
            ctx.response.status = 404;
            return;
    }
});

// app.use((ctx) => {
//     console.log('i am a second middleware');
// });

const server = http.createServer(app.callback());

const port = 7070;

server.listen(port, (err) => {
    if (err) {
        console.log(err);

        return;
    }

    console.log('Server is listening to ' + port);
});
