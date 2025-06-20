import prisma from '../config/prismaClient.js';

export const createProformaInvoice = async (req, res) => {
  const {
    clientId,
    proformaNo,
    poNumber,
    proformaDate,
    validUntil,
    items // array of { itemId, unit, quantity, price, discountPercent, total, description }
  } = req.body;

  if (!clientId || !proformaNo || !proformaDate || !validUntil || !items || items.length === 0) {
    return res.status(400).json({ message: 'Missing required fields or empty item list' });
  }

  try {
    const existingProforma = await prisma.proformaInvoice.findUnique({ where: { proformaNo } });
    if (existingProforma) {
      return res.status(409).json({ message: 'Proforma Invoice number already exists' });
    }

    const proformaInvoice = await prisma.proformaInvoice.create({
      data: {
        clientId,
        proformaNo,
        poNumber,
        proformaDate: new Date(proformaDate),
        validUntil: new Date(validUntil),
        items: {
          create: items.map((item) => ({
            itemId: item.itemId ? parseInt(item.itemId) : null,
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
        client: true,
        items: true
      }
    });

    res.status(201).json({ message: 'Proforma Invoice created', proformaInvoice });
  } catch (error) {
    console.error('Create proforma invoice error:', error);
    res.status(500).json({ message: 'Failed to create proforma invoice' });
  }
};

export const getAllProformaInvoices = async (req, res) => {
  try {
    const proformaInvoices = await prisma.proformaInvoice.findMany({
      orderBy: { proformaDate: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            email: true,
            phone: true
          }
        },
        items: true
      }
    });
    res.status(200).json(proformaInvoices);
  } catch (error) {
    console.error('Get proforma invoices error:', error);
    res.status(500).json({ message: 'Failed to fetch proforma invoices' });
  }
};

export const getProformaInvoiceById = async (req, res) => {
  const proformaId = parseInt(req.params.id);

  try {
    const proformaInvoice = await prisma.proformaInvoice.findUnique({
      where: { id: proformaId },
      include: {
        client: true,
        items: true
      }
    });

    if (!proformaInvoice) {
      return res.status(404).json({ message: 'Proforma Invoice not found' });
    }

    res.status(200).json(proformaInvoice);
  } catch (error) {
    console.error('Get proforma invoice by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch proforma invoice' });
  }
};

export const updateProformaInvoice = async (req, res) => {
  const proformaId = parseInt(req.params.id);
  const {
    clientId,
    proformaNo,
    poNumber,
    proformaDate,
    validUntil,
    items
  } = req.body;

  try {
    // First, delete all existing items
    await prisma.proformaItem.deleteMany({
      where: { proformaId }
    });

    // Then update the proforma invoice and create new items
    const proformaInvoice = await prisma.proformaInvoice.update({
      where: { id: proformaId },
      data: {
        clientId: parseInt(clientId),
        proformaNo,
        poNumber,
        proformaDate: new Date(proformaDate),
        validUntil: new Date(validUntil),
        items: {
          create: items.map((item) => ({
            itemId: item.itemId ? parseInt(item.itemId) : null,
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
        client: true,
        items: true
      }
    });

    res.status(200).json({ message: 'Proforma Invoice updated', proformaInvoice });
  } catch (error) {
    console.error('Update proforma invoice error:', error);
    res.status(500).json({ message: 'Failed to update proforma invoice' });
  }
};

export const deleteProformaInvoice = async (req, res) => {
  const proformaId = parseInt(req.params.id);

  try {
    // Check if proforma invoice exists
    const existingProforma = await prisma.proformaInvoice.findUnique({
      where: { id: proformaId }
    });

    if (!existingProforma) {
      return res.status(404).json({ message: 'Proforma Invoice not found' });
    }

    // Delete the proforma invoice (items will be deleted automatically due to cascade)
    await prisma.proformaInvoice.delete({ where: { id: proformaId } });
    res.status(200).json({ message: 'Proforma Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete proforma invoice error:', error);
    
    // Check for foreign key constraint errors
    if (error.code === 'P2003') {
      res.status(409).json({ 
        message: 'Cannot delete proforma invoice. It may be referenced by other records.',
        relatedRecords: {
          message: 'This proforma invoice cannot be deleted because it is referenced by other records in the system.'
        }
      });
    } else {
      res.status(500).json({ message: 'Failed to delete proforma invoice' });
    }
  }
};

export const getProformaInvoicesByClient = async (req, res) => {
  const clientId = parseInt(req.params.clientId);

  try {
    const proformaInvoices = await prisma.proformaInvoice.findMany({
      where: { clientId },
      orderBy: { proformaDate: 'desc' },
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

    res.status(200).json(proformaInvoices);
  } catch (error) {
    console.error('Get proforma invoices by client error:', error);
    res.status(500).json({ message: 'Failed to fetch proforma invoices' });
  }
}; 