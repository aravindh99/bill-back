import prisma from '../config/prismaClient.js';

export const createQuotation = async (req, res) => {
  const {
    clientId,
    quotationNo,
    poNumber,
    quotationDate,
    validUntil,
    subtotal,
    total,
    items // array of { itemId, unit, quantity, price, discountPercent, total, description }
  } = req.body;

  // ✅ Validate required fields
  if (
    !clientId ||
    !quotationNo ||
    !quotationDate ||
    !validUntil ||
    !subtotal ||
    !total ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({ message: 'Missing required fields or items' });
  }

  try {
    const quotation = await prisma.quotation.create({
      data: {
        clientId,
        quotationNo,
        poNumber,
        quotationDate: new Date(quotationDate),
        validUntil: new Date(validUntil),
        subtotal: parseFloat(subtotal),
        total: parseFloat(total),
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
    quotationNo,
    poNumber,
    quotationDate,
    validUntil,
    subtotal,
    total
  } = req.body;

  try {
    const quotation = await prisma.quotation.update({
      where: { id: quotationId },
      data: {
        quotationNo,
        poNumber,
        quotationDate: new Date(quotationDate),
        validUntil: new Date(validUntil),
        subtotal: parseFloat(subtotal),
        total: parseFloat(total)
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



