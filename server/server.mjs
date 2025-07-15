import PocketBase from 'pocketbase';
import express from 'express';
import http from 'http';
import { exec } from 'child_process';

const app = express();
const server = http.createServer(app);

const pb = new PocketBase();

// Start PocketBase
const pocketbase = exec('./pocketbase serve', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

app.use('/pb_public', express.static('pb_public'));

app.get('*', (req, res) => {
  res.send('PocketBase is running!');
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});