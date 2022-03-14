import express from "express";

const app = express();
const PORT = 3000;

const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);

app.listen(3000, handleListen);
