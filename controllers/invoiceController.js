import prisma from '../config/prismaClient.js';
import { getFinancialYearCode, generateDocumentNumber } from '../utils/helpers.js';

export const createInvoice = async (req, res) => {
  const {
    clientId,
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
    items, // array of { itemId, unit, quantity, price, discountPercent, total, description }
    proformaInvoiceId, // NEW: reference to ProformaInvoice
    quotationId, // NEW: reference to Quotation
    status // NEW: Optional status field
  } = req.body;

  if (!clientId || !invoiceDate || !dueDate || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  let itemsToCreate = items;
  let sourceProformaInvoiceId = proformaInvoiceId;
  let sourceQuotationId = quotationId;

  try {
    // Get company code from profile
    const profile = await prisma.profile.findFirst();
    if (!profile || !profile.companyCode) {
      return res.status(400).json({ message: 'Company code not set in profile. Please set it in company profile settings.' });
    }
    const companyCode = profile.companyCode;
    const yearCode = getFinancialYearCode(new Date(invoiceDate));
    const typeCode = 'IV';
    // Find the next sequence for this year/type/company
    const count = await prisma.invoice.count({
      where: {
        invoiceNo: {
          startsWith: `${companyCode}-${yearCode}-${typeCode}-`
        }
      }
    });
    const sequence = count + 1;
    const invoiceNo = generateDocumentNumber(companyCode, yearCode, typeCode, sequence);

    // Only attempt auto-fill if no items are provided in the request body
    if (!itemsToCreate || itemsToCreate.length === 0) {
      let foundItems = false;
      
      // 1. Prioritize auto-fill from a specified proformaInvoiceId
      if (sourceProformaInvoiceId) {
        const proforma = await prisma.proformaInvoice.findUnique({
          where: { id: sourceProformaInvoiceId },
          include: { items: true }
        });
        if (proforma) {
          itemsToCreate = proforma.items.map((item) => ({
            itemId: item.itemId,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            discountPercent: item.discountPercent || 0,
            total: item.total,
            description: item.description || ''
          }));
          sourceQuotationId = proforma.quotationId; // Inherit quotationId from proforma
          foundItems = true;
        }
      }

      // 2. If no proformaInvoiceId, or proforma not found, try specified quotationId
      if (!foundItems && sourceQuotationId) {
        const quotation = await prisma.quotation.findUnique({
          where: { id: sourceQuotationId },
          include: { items: true }
        });
        if (quotation) {
          itemsToCreate = quotation.items.map((item) => ({
            itemId: item.itemId,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            discountPercent: item.discountPercent || 0,
            total: item.total,
            description: item.description || ''
          }));
          foundItems = true;
        }
      }

      // 3. If no specific IDs provided, try to find the latest OPEN Proforma Invoice for the client
      if (!foundItems && clientId) {
        const latestOpenProforma = await prisma.proformaInvoice.findFirst({
          where: { clientId: parseInt(clientId) },
          orderBy: { proformaDate: 'desc' },
          include: { items: true },
        });
        if (latestOpenProforma) {
          itemsToCreate = latestOpenProforma.items.map((item) => ({
            itemId: item.itemId,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            discountPercent: item.discountPercent || 0,
            total: item.total,
            description: item.description || ''
          }));
          sourceProformaInvoiceId = latestOpenProforma.id; // Set this for the invoice record
          sourceQuotationId = latestOpenProforma.quotationId; // Inherit quotationId from proforma
          foundItems = true;
        }
      }

      // 4. If no proforma found, try to find the latest OPEN Quotation for the client
      if (!foundItems && clientId) {
        const latestOpenQuotation = await prisma.quotation.findFirst({
          where: {
            clientId: parseInt(clientId),
            status: 'OPEN', // Only consider open quotations
          },
          orderBy: { quotationDate: 'desc' },
          include: { items: true },
        });
        if (latestOpenQuotation) {
          itemsToCreate = latestOpenQuotation.items.map((item) => ({
            itemId: item.itemId,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            discountPercent: item.discountPercent || 0,
            total: item.total,
            description: item.description || ''
          }));
          sourceQuotationId = latestOpenQuotation.id; // Set this for the invoice record
          foundItems = true;
        }
      }
    }

    if (!itemsToCreate || itemsToCreate.length === 0) {
      return res.status(400).json({ message: 'No items to create in invoice' });
    }

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
        proformaInvoiceId: sourceProformaInvoiceId, // Use the resolved ID
        quotationId: sourceQuotationId, // Use the resolved ID
        status: status || 'DRAFT', // Set status, default to DRAFT
        invoiceItems: {
          create: itemsToCreate.map((item) => ({
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
          },
          payments: true
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
          },
          payments: true
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
      paymentDate,
      status // NEW: Optional status field
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
          paymentDate: paymentDate ? new Date(paymentDate) : null,
          status // Update status if provided
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
  
  export const getInvoicesByClient = async (req, res) => {
    const clientId = parseInt(req.params.clientId);
    try {
      const invoices = await prisma.invoice.findMany({
        where: { clientId },
        orderBy: { invoiceDate: 'desc' },
        include: {
          client: {
            select: {
              companyName: true,
              email: true
            }
          },
          invoiceItems: true,
          proformaInvoice: true,
          quotation: true
        }
      });
      res.status(200).json(invoices);
    } catch (error) {
      console.error('Get invoices by client error:', error);
      res.status(500).json({ message: 'Failed to fetch invoices' });
    }
  };
  
  export const getInvoicesByProforma = async (req, res) => {
    const proformaInvoiceId = parseInt(req.params.proformaInvoiceId);
    try {
      const invoices = await prisma.invoice.findMany({
        where: { proformaInvoiceId },
        orderBy: { invoiceDate: 'desc' },
        include: {
          client: {
            select: {
              companyName: true,
              email: true
            }
          },
          invoiceItems: true,
          quotation: true
        }
      });
      res.status(200).json(invoices);
    } catch (error) {
      console.error('Get invoices by proforma error:', error);
      res.status(500).json({ message: 'Failed to fetch invoices' });
    }
  };
  