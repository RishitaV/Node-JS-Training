const http = require('http');
const url = require('url');

const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' },
];

function loggingMiddleware(req, res, next) {
    const dateToday = new Date().toUTCString();
    const method = req.method;
    const url = req.url;
    console.log(`[${dateToday}] ${method} ${url}`);
    next();
}

function requestTimeoutMiddleware(timeoutMs) {
    return function (req, res) {
        const timeoutId = setTimeout(() => {
            res.writeHead(408, { 'Content-Type': 'text/plain' });
            res.end('Request Timeout\n');
        }, timeoutMs);
        req.on('close', () => {
            clearTimeout(timeoutId);
        });
    };
}

function authenticationMiddleware(req, res, next) {
    const parsedUrl = url.parse(req.url, true);
    const { username, password } = parsedUrl.query;
    const authenticatedUser = users.find(
        (user) => user.username === username && user.password === password
    );
    if (authenticatedUser) {
        req.user = authenticatedUser;
        next();
    } else {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end('Unauthorized');
    }
}

function errorHandlerMiddleware(err, req, res, next) {
    console.error(`Error: ${err.message}`);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error\n');
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (req.method === 'GET' && parsedUrl.pathname === '/') {
        loggingMiddleware(req, res, () => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello, World!\n');
        });
    }
    else if (req.method === 'GET' && req.url === '/secure') {
        authenticationMiddleware(req, res, () => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`Hello, ${req.user.username}! (Authenticated)\n`);
        });
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/post') {
        let requestBody = '';
        req.on('data', (chunk) => {
            requestBody += chunk.toString();
        });
        req.on('end', () => {
            try {
                const jsonData = JSON.parse(requestBody);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(jsonData));
            } catch (error) {
                errorHandlerMiddleware(err, req, res);
            }
        });

    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found\n');
    }
});

const PORT = 8070;
const hostname = 'localhost';

server.on('request', requestTimeoutMiddleware(5000));

server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
});
