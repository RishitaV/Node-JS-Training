const express = require('express');
const timeout = require('connect-timeout');
const app = express();
const port = 8070;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const loggingMiddleware = (req, res, next) => {
    const timestamp = new Date().toLocaleString();
    const method = req.method;
    const url = req.url;
    console.log(`[${timestamp}] ${method} ${url}`);
    next();
};

app.use(loggingMiddleware);

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const authenticationMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || token !== 'myAuthToken') {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

const errorHandlingMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
};

app.use('/slow-route', timeout('5s'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/protected-resource', authenticationMiddleware, (req, res) => {
    res.json({ message: 'Access granted' });
});

app.get('/slow-route', (req, res) => {
    setTimeout(() => {
        res.json({ message: 'Slow response completed' });
    }, 6000);
});

app.use(errorHandlingMiddleware);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
