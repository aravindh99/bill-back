import prisma from '../config/prismaClient.js';
import { getFinancialYearCode, generateDocumentNumber } from '../utils/helpers.js';

export const createQuotation = async (req, res) => {
  const {
    clientId,
    poNumber,
    quotationDate,
    validUntil,
    subtotal,
    total,
    items, // array of { itemId, unit, quantity, price, discountPercent, total, description }
    status // NEW: Optional status field
  } = req.body;

  // Validate required fields (quotationNo removed)
  if (
    !clientId ||
    !quotationDate ||
    !validUntil ||
    !subtotal ||
    !total ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({ message: 'Missing required fields or items' });
  }

  // Date validations
  const current_date = new Date();
  const q_date = new Date(quotationDate);
  const vu_date = new Date(validUntil);

  if (q_date > current_date) {
    return res.status(400).json({ message: 'Quotation date cannot be in the future.' });
  }

  if (vu_date < q_date) {
    return res.status(400).json({ message: 'Valid until date cannot be before quotation date.' });
  }

  // Numeric value validations
  if (parseFloat(subtotal) < 0 || parseFloat(total) < 0) {
    return res.status(400).json({ message: 'Subtotal and Total cannot be negative.' });
  }

  for (const item of items) {
    if (parseFloat(item.quantity) < 0) {
      return res.status(400).json({ message: `Quantity for item ${item.itemId || item.description || ''} cannot be negative.` });
    }
    if (parseFloat(item.price) < 0) {
      return res.status(400).json({ message: `Price for item ${item.itemId || item.description || ''} cannot be negative.` });
    }
    if (parseFloat(item.discountPercent || 0) < 0) {
      return res.status(400).json({ message: `Discount for item ${item.itemId || item.description || ''} cannot be negative.` });
    }
    if (parseFloat(item.total) < 0) {
      return res.status(400).json({ message: `Item total for ${item.itemId || item.description || ''} cannot be negative.` });
    }
    if (item.taxRate && parseFloat(item.taxRate) < 0) {
      return res.status(400).json({ message: `Tax rate for item ${item.itemId || item.description || ''} cannot be negative.` });
    }
  }

  try {
    // Get company code from profile
    const profile = await prisma.profile.findFirst();
    if (!profile || !profile.companyCode) {
      return res.status(400).json({ message: 'Company code not set in profile. Please set it in company profile settings.' });
    }
    const companyCode = profile.companyCode;
    const yearCode = getFinancialYearCode(new Date(quotationDate));
    const typeCode = 'QO';
    // Find the next sequence for this year/type/company
    const count = await prisma.quotation.count({
      where: {
        quotationNo: {
          startsWith: `${companyCode}-${yearCode}-${typeCode}-`
        }
      }
    });
    const sequence = count + 1;
    const quotationNo = generateDocumentNumber(companyCode, yearCode, typeCode, sequence);

    const quotation = await prisma.quotation.create({
      data: {
        clientId,
        quotationNo,
        poNumber,
        quotationDate: new Date(quotationDate),
        validUntil: new Date(validUntil),
        subtotal: parseFloat(subtotal),
        total: parseFloat(total),
        status: status || 'OPEN', // Set status, default to OPEN
        items: {
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
        items: true,
      },
    });

    res.status(201).json({ message: 'Quotation created', quotation });
  } catch (error) {
    console.error('❌ Create quotation error:', error.message, error.meta || error);
    res.status(500).json({ message: 'Failed to create quotation' });
  }
};

export const getAllQuotations = async (req, res) => {
  try {
    const quotations = await prisma.quotation.findMany({
      orderBy: { quotationDate: 'desc' },
      include: {
        client: true,
        items: {
          include: {
            item: true
          }
        }
      }
    });

    res.status(200).json(quotations);
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ message: 'Failed to fetch quotations' });
  }
};

export const getQuotationById = async (req, res) => {
  const quotationId = parseInt(req.params.id);

  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        client: true,
        items: {
          include: {
            item: true
          }
        }
      }
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    res.status(200).json(quotation);
  } catch (error) {
    console.error('Get quotation by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch quotation' });
  }
};

export const updateQuotation = async (req, res) => {
  const quotationId = parseInt(req.params.id);
  const {
    clientId, // Added clientId as it might be updated in future, but for now it's not handled in the frontend update form
    poNumber,
    quotationDate,
    validUntil,
    subtotal,
    total,
    status, // NEW: Optional status field
    items // Although not directly updated by this endpoint's typical use, including for completeness if backend expands.
  } = req.body;

  // Date validations
  const current_date = new Date();
  const q_date = new Date(quotationDate);
  const vu_date = new Date(validUntil);

  if (q_date > current_date) {
    return res.status(400).json({ message: 'Quotation date cannot be in the future.' });
  }

  if (vu_date < q_date) {
    return res.status(400).json({ message: 'Valid until date cannot be before quotation date.' });
  }

  // Numeric value validations
  if (parseFloat(subtotal) < 0 || parseFloat(total) < 0) {
    return res.status(400).json({ message: 'Subtotal and Total cannot be negative.' });
  }

  // If items are sent in the update request, validate them too
  if (Array.isArray(items) && items.length > 0) {
    for (const item of items) {
      if (parseFloat(item.quantity) < 0) {
        return res.status(400).json({ message: `Quantity for item ${item.itemId || item.description || ''} cannot be negative.` });
      }
      if (parseFloat(item.price) < 0) {
        return res.status(400).json({ message: `Price for item ${item.itemId || item.description || ''} cannot be negative.` });
      }
      if (parseFloat(item.discountPercent || 0) < 0) {
        return res.status(400).json({ message: `Discount for item ${item.itemId || item.description || ''} cannot be negative.` });
      }
      if (parseFloat(item.total) < 0) {
        return res.status(400).json({ message: `Item total for ${item.itemId || item.description || ''} cannot be negative.` });
      }
      if (item.taxRate && parseFloat(item.taxRate) < 0) {
        return res.status(400).json({ message: `Tax rate for item ${item.itemId || item.description || ''} cannot be negative.` });
      }
    }
  }

  try {
    const quotation = await prisma.quotation.update({
      where: { id: quotationId },
      data: {
        // quotationNo, // quotationNo is auto-generated and should not be updated directly
        poNumber,
        quotationDate: new Date(quotationDate),
        validUntil: new Date(validUntil),
        subtotal: parseFloat(subtotal),
        total: parseFloat(total),
        status // Update status if provided
      },
      include: {
        client: true,
        items: {
          include: {
            item: true
          }
        }
      }
    });

    res.status(200).json({ message: 'Quotation updated', quotation });
  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json({ message: 'Failed to update quotation' });
  }
};

export const deleteQuotation = async (req, res) => {
  const quotationId = parseInt(req.params.id);

  try {
    await prisma.quotation.delete({ 
      where: { id: quotationId } 
    });
    res.status(200).json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Delete quotation error:', error);
    res.status(500).json({ message: 'Failed to delete quotation' });
  }
};

export const getQuotationsByClient = async (req, res) => {
  const clientId = parseInt(req.params.clientId);
  try {
    const quotations = await prisma.quotation.findMany({
      where: { clientId },
      orderBy: { quotationDate: 'desc' },
      include: {
        client: {
          select: {
            companyName: true,
            email: true
          }
        },
        items: true
      }
    });
    res.status(200).json(quotations);
  } catch (error) {
    console.error('Get quotations by client error:', error);
    res.status(500).json({ message: 'Failed to fetch quotations' });
  }
};

export const getQuotationsByInvoice = async (req, res) => {
  const invoiceId = parseInt(req.params.invoiceId);
  try {
    const quotations = await prisma.quotation.findMany({
      where: {
        invoices: {
          some: { id: invoiceId }
        }
      },
      orderBy: { quotationDate: 'desc' },
      include: {
        client: {
          select: {
            companyName: true,
            email: true
          }
        },
        items: true
      }
    });
    res.status(200).json(quotations);
  } catch (error) {
    console.error('Get quotations by invoice error:', error);
    res.status(500).json({ message: 'Failed to fetch quotations' });
  }
};



