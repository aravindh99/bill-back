import prisma from '../config/prismaClient.js';

export const createDeliveryChalan = async (req, res) => {
  const {
    invoiceId,
    clientId,
    chalanDate,
    docNo,
    notes
  } = req.body;

  if (!clientId || !chalanDate || !docNo) {
    return res.status(400).json({ message: 'Client ID, chalan date, and document number are required.' });
  }

  try {
    const existingChalan = await prisma.deliveryChalan.findUnique({ where: { docNo } });
    if (existingChalan) {
      return res.status(409).json({ message: 'Delivery Chalan document number already exists' });
    }

    const deliveryChalan = await prisma.deliveryChalan.create({
      data: {
        invoiceId: invoiceId || null,
        clientId,
        chalanDate: new Date(chalanDate),
        docNo,
        notes
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            email: true,
            phone: true
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNo: true,
            amount: true
          }
        }
      }
    });

    res.status(201).json({ message: 'Delivery Chalan created', deliveryChalan });
  } catch (error) {
    console.error('Create delivery chalan error:', error);
    res.status(500).json({ message: 'Failed to create delivery chalan' });
  }
};

export const getAllDeliveryChalans = async (req, res) => {
  try {
    const deliveryChalans = await prisma.deliveryChalan.findMany({
      orderBy: { chalanDate: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            email: true,
            phone: true
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNo: true,
            amount: true,
            invoiceDate: true
          }
        }
      }
    });
    res.status(200).json(deliveryChalans);
  } catch (error) {
    console.error('Get delivery chalans error:', error);
    res.status(500).json({ message: 'Failed to fetch delivery chalans' });
  }
};

export const getDeliveryChalanById = async (req, res) => {
  const chalanId = parseInt(req.params.id);

  try {
    const deliveryChalan = await prisma.deliveryChalan.findUnique({
      where: { id: chalanId },
      include: {
        client: true,
        invoice: {
          include: {
            invoiceItems: {
              include: {
                item: true
              }
            }
          }
        }
      }
    });

    if (!deliveryChalan) {
      return res.status(404).json({ message: 'Delivery Chalan not found' });
    }

    res.status(200).json(deliveryChalan);
  } catch (error) {
    console.error('Get delivery chalan by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch delivery chalan' });
  }
};

export const updateDeliveryChalan = async (req, res) => {
  const chalanId = parseInt(req.params.id);
  const {
    invoiceId,
    chalanDate,
    docNo,
    notes
  } = req.body;

  try {
    const deliveryChalan = await prisma.deliveryChalan.update({
      where: { id: chalanId },
      data: {
        invoiceId: invoiceId || null,
        chalanDate: new Date(chalanDate),
        docNo,
        notes
      },
      include: {
        client: true,
        invoice: true
      }
    });

    res.status(200).json({ message: 'Delivery Chalan updated', deliveryChalan });
  } catch (error) {
    console.error('Update delivery chalan error:', error);
    res.status(500).json({ message: 'Failed to update delivery chalan' });
  }
};

export const deleteDeliveryChalan = async (req, res) => {
  const chalanId = parseInt(req.params.id);

  try {
    await prisma.deliveryChalan.delete({ where: { id: chalanId } });
    res.status(200).json({ message: 'Delivery Chalan deleted successfully' });
  } catch (error) {
    console.error('Delete delivery chalan error:', error);
    res.status(500).json({ message: 'Failed to delete delivery chalan' });
  }
};

export const getDeliveryChalansByClient = async (req, res) => {
  const clientId = parseInt(req.params.clientId);

  try {
    const deliveryChalans = await prisma.deliveryChalan.findMany({
      where: { clientId },
      orderBy: { chalanDate: 'desc' },
      include: {
        client: {
          select: {
            companyName: true,
            email: true
          }
        },
        invoice: {
          select: {
            invoiceNo: true,
            amount: true
          }
        }
      }
    });

    res.status(200).json(deliveryChalans);
  } catch (error) {
    console.error('Get delivery chalans by client error:', error);
    res.status(500).json({ message: 'Failed to fetch delivery chalans' });
  }
};

export const getDeliveryChalansByInvoice = async (req, res) => {
  const invoiceId = parseInt(req.params.invoiceId);

  try {
    const deliveryChalans = await prisma.deliveryChalan.findMany({
      where: { invoiceId },
      orderBy: { chalanDate: 'desc' },
      include: {
        client: {
          select: {
            companyName: true,
            email: true
          }
        }
      }
    });

    res.status(200).json(deliveryChalans);
  } catch (error) {
    console.error('Get delivery chalans by invoice error:', error);
    res.status(500).json({ message: 'Failed to fetch delivery chalans' });
  }
}; 