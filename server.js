import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import itemRoutes from './routes/itemRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes.js';
import proformaRoutes from './routes/proformaRoutes.js';
import deliveryChalanRoutes from './routes/deliveryChalanRoutes.js';
import creditNoteRoutes from './routes/creditNoteRoutes.js';
import debitNoteRoutes from './routes/debitNoteRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import clientContactRoutes from './routes/clientContactRoutes.js';
import vendorContactRoutes from './routes/vendorContactRoutes.js';
import paymentDetailRoutes from './routes/paymentDetailRoutes.js';
import bankDetailRoutes from './routes/bankDetailRoutes.js';
import errorHandler from './middleware/errorHandler.js';




dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.send('API running'));
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/proformas', proformaRoutes);
app.use('/api/delivery-chalans', deliveryChalanRoutes);
app.use('/api/credit-notes', creditNoteRoutes);
app.use('/api/debit-notes', debitNoteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/client-contacts', clientContactRoutes);
app.use('/api/vendor-contacts', vendorContactRoutes);
app.use('/api/payment-details', paymentDetailRoutes);
app.use('/api/bank-details', bankDetailRoutes);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
