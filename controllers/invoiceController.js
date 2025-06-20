import prisma from '../config/prismaClient.js';

export const createInvoice = async (req, res) => {
  const {
    clientId,
    invoiceNo,
    poNo,
    invoiceDate,
    poDate,
    dueDate,
    paymentTerms,
    shippingCharges,
    subtotal,
    tax,
    amount,
    balance,
    drCr,
    termsConditions,
    paymentDate,
    items // array of { itemId, unit, quantity, price, discountPercent, total, description }
  } = req.body;

  if (!clientId || !invoiceNo || !invoiceDate || !dueDate || !amount || !items || items.length === 0) {
    return res.status(400).json({ message: 'Missing required fields or empty item list' });
  }

  try {
    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        invoiceNo,
        poNo,
        invoiceDate: new Date(invoiceDate),
        poDate: poDate ? new Date(poDate) : null,
        dueDate: new Date(dueDate),
        paymentTerms,
        shippingCharges: parseFloat(shippingCharges || 0),
        subtotal: parseFloat(subtotal || 0),
        tax: parseFloat(tax || 0),
        amount: parseFloat(amount),
        balance: parseFloat(balance || 0),
        drCr,
        termsConditions,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        invoiceItems: {
          create: items.map((item) => ({
            itemId: item.itemId,
            unit: item.unit,
            quantity: parseFloat(item.quantity),
            price: parseFloat(item.price),
            discountPercent: parseFloat(item.discountPercent || 0),
            total: parseFloat(item.total),
            description: item.description,
          })),
        },
      },
      include: {
        invoiceItems: true
      }
    });

    res.status(201).json({ message: 'Invoice created', invoice });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Failed to create invoice' });
  }
};

export const getAllInvoices = async (req, res) => {
    try {
      const invoices = await prisma.invoice.findMany({
        orderBy: { invoiceDate: 'desc' },
        include: {
          client: true,
          invoiceItems: {
            include: {
              item: true
            }
          }
        }
      });
      res.status(200).json(invoices);
    } catch (error) {
      console.error('Get invoices error:', error);
      res.status(500).json({ message: 'Failed to fetch invoices' });
    }
  };
  
  export const getInvoiceById = async (req, res) => {
    const invoiceId = parseInt(req.params.id);
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          client: true,
          invoiceItems: {
            include: {
              item: true
            }
          }
        }
      });
  
      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  
      res.status(200).json(invoice);
    } catch (error) {
      console.error('Get invoice by ID error:', error);
      res.status(500).json({ message: 'Failed to fetch invoice' });
    }
  };
  
  export const updateInvoice = async (req, res) => {
    const invoiceId = parseInt(req.params.id);
    const {
      invoiceNo,
      poNo,
      invoiceDate,
      poDate,
      dueDate,
      paymentTerms,
      shippingCharges,
      subtotal,
      tax,
      amount,
      balance,
      drCr,
      termsConditions,
      paymentDate
    } = req.body;
  
    try {
      const invoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          invoiceNo,
          poNo,
          invoiceDate: new Date(invoiceDate),
          poDate: poDate ? new Date(poDate) : null,
          dueDate: new Date(dueDate),
          paymentTerms,
          shippingCharges: parseFloat(shippingCharges),
          subtotal: parseFloat(subtotal),
          tax: parseFloat(tax),
          amount: parseFloat(amount),
          balance: parseFloat(balance),
          drCr,
          termsConditions,
          paymentDate: paymentDate ? new Date(paymentDate) : null
        }
      });
  
      res.status(200).json({ message: 'Invoice updated', invoice });
    } catch (error) {
      console.error('Update invoice error:', error);
      res.status(500).json({ message: 'Failed to update invoice' });
    }
  };
  
  export const deleteInvoice = async (req, res) => {
    const invoiceId = parseInt(req.params.id);
  
    try {
      await prisma.invoice.delete({ where: { id: invoiceId } });
      res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
      console.error('Delete invoice error:', error);
      res.status(500).json({ message: 'Failed to delete invoice' });
    }
  };
  