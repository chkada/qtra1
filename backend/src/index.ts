
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import bookingsRouter from './routes/bookings';
import proxyRouter from './routes/proxy';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/bookings', bookingsRouter);
app.use('/api/proxy', proxyRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
