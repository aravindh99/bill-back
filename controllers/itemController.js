import prisma from '../config/prismaClient.js';

export const createItem = async (req, res) => {
  const {
    name,
    description,
    sku,
    type,
    unit,
    openingQuantity,
    tax,
    code,
    salesUnitPrice,
    salesCurrency,
    salesCessPercentage,
    salesCess,
    purchaseUnitPrice,
    purchaseCurrency,
    purchaseCessPercentage,
    purchaseCess
  } = req.body;

  if (!name || !sku || !type || !unit) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const item = await prisma.item.create({
      data: {
        name,
        description,
        sku,
        type,
        unit,
        openingQuantity: parseFloat(openingQuantity || 0),
        tax: parseFloat(tax || 0),
        code,
        salesUnitPrice: parseFloat(salesUnitPrice),
        salesCurrency,
        salesCessPercentage: parseFloat(salesCessPercentage || 0),
        salesCess: parseFloat(salesCess || 0),
        purchaseUnitPrice: parseFloat(purchaseUnitPrice),
        purchaseCurrency,
        purchaseCessPercentage: parseFloat(purchaseCessPercentage || 0),
        purchaseCess: parseFloat(purchaseCess || 0),
      },
    });

    res.status(201).json({ message: 'Item created', item });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Failed to create item' });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};

export const updateItem = async (req, res) => {
  const itemId = parseInt(req.params.id);
  const data = req.body;

  try {
    const item = await prisma.item.update({
      where: { id: itemId },
      data,
    });

    res.status(200).json({ message: 'Item updated', item });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Failed to update item' });
  }
};

export const deleteItem = async (req, res) => {
  const itemId = parseInt(req.params.id);

  try {
    // First check if item exists and has related records
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        invoiceItems: true,
        quotationItems: true
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check for related records
    const hasRelatedRecords = 
      item.invoiceItems.length > 0 ||
      item.quotationItems.length > 0;

    if (hasRelatedRecords) {
      const relatedCounts = {
        invoiceItems: item.invoiceItems.length,
        quotationItems: item.quotationItems.length
      };

      return res.status(400).json({ 
        message: 'Cannot delete item with related records. Please delete related records first.',
        relatedRecords: relatedCounts
      });
    }

    // If no related records, proceed with deletion
    await prisma.item.delete({ where: { id: itemId } });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        message: 'Cannot delete item. This item has related records that must be deleted first.' 
      });
    }
    
    res.status(500).json({ message: 'Failed to delete item' });
  }
};

