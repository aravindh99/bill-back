import prisma from '../config/prismaClient.js';

export const createPurchaseOrder = async (req, res) => {
  const {
    vendorId,
    poNo,
    orderDate,
    validUntil,
    subtotal,
    total,
    items // array of purchase order items
  } = req.body;

  if (!vendorId || !poNo || !orderDate || !validUntil || !subtotal || !total) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingPO = await prisma.purchaseOrder.findUnique({ where: { poNo } });
    if (existingPO) {
      return res.status(409).json({ message: 'Purchase Order number already exists' });
    }

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        vendorId,
        poNo,
        orderDate: new Date(orderDate),
        validUntil: new Date(validUntil),
        subtotal: parseFloat(subtotal),
        total: parseFloat(total),
      },
      include: {
        vendor: true
      }
    });

    res.status(201).json({ message: 'Purchase Order created', purchaseOrder });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ message: 'Failed to create purchase order' });
  }
};

export const getAllPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      orderBy: { orderDate: 'desc' },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true
          }
        }
      }
    });
    res.status(200).json(purchaseOrders);
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ message: 'Failed to fetch purchase orders' });
  }
};

export const getPurchaseOrderById = async (req, res) => {
  const poId = parseInt(req.params.id);

  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        vendor: true
      }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    res.status(200).json(purchaseOrder);
  } catch (error) {
    console.error('Get purchase order by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch purchase order' });
  }
};

export const updatePurchaseOrder = async (req, res) => {
  const poId = parseInt(req.params.id);
  const {
    poNo,
    orderDate,
    validUntil,
    subtotal,
    total
  } = req.body;

  try {
    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        poNo,
        orderDate: new Date(orderDate),
        validUntil: new Date(validUntil),
        subtotal: parseFloat(subtotal),
        total: parseFloat(total)
      },
      include: {
        vendor: true
      }
    });

    res.status(200).json({ message: 'Purchase Order updated', purchaseOrder });
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ message: 'Failed to update purchase order' });
  }
};

export const deletePurchaseOrder = async (req, res) => {
  const poId = parseInt(req.params.id);

  try {
    await prisma.purchaseOrder.delete({ where: { id: poId } });
    res.status(200).json({ message: 'Purchase Order deleted successfully' });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({ message: 'Failed to delete purchase order' });
  }
};

export const getPurchaseOrdersByVendor = async (req, res) => {
  const vendorId = parseInt(req.params.vendorId);

  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: { vendorId },
      orderBy: { orderDate: 'desc' },
      include: {
        vendor: {
          select: {
            companyName: true,
            contactName: true
          }
        }
      }
    });

    res.status(200).json(purchaseOrders);
  } catch (error) {
    console.error('Get purchase orders by vendor error:', error);
    res.status(500).json({ message: 'Failed to fetch purchase orders' });
  }
}; 