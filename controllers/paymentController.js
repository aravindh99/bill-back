import prisma from '../config/prismaClient.js';

export const createPayment = async (req, res) => {
  const {
    date,
    number,
    type,
    accountName,
    documentMethod,
    amount,
    availableCredit,
    paymentDetails // array of { clientId, number, date, amount, method, bankCharges, reference }
  } = req.body;

  if (!date || !number || !type || !accountName || !amount) {
    return res.status(400).json({ message: 'Date, number, type, account name, and amount are required.' });
  }

  try {
    const existingPayment = await prisma.payment.findUnique({ where: { number } });
    if (existingPayment) {
      return res.status(409).json({ message: 'Payment number already exists' });
    }

    const payment = await prisma.payment.create({
      data: {
        date: new Date(date),
        number,
        type,
        accountName,
        documentMethod,
        amount: parseFloat(amount),
        availableCredit: parseFloat(availableCredit || 0),
        paymentDetails: paymentDetails ? {
          create: paymentDetails.map((detail) => ({
            clientId: detail.clientId,
            number: detail.number,
            date: new Date(detail.date),
            amount: parseFloat(detail.amount),
            method: detail.method,
            bankCharges: parseFloat(detail.bankCharges || 0),
            reference: detail.reference
          }))
        } : undefined
      },
      include: {
        paymentDetails: {
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({ message: 'Payment created', payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Failed to create payment' });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { date: 'desc' },
      include: {
        paymentDetails: {
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });
    res.status(200).json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

export const getPaymentById = async (req, res) => {
  const paymentId = parseInt(req.params.id);

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        paymentDetails: {
          include: {
            client: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch payment' });
  }
};

export const updatePayment = async (req, res) => {
  const paymentId = parseInt(req.params.id);
  const {
    date,
    number,
    type,
    accountName,
    documentMethod,
    amount,
    availableCredit
  } = req.body;

  try {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        date: new Date(date),
        number,
        type,
        accountName,
        documentMethod,
        amount: parseFloat(amount),
        availableCredit: parseFloat(availableCredit || 0)
      },
      include: {
        paymentDetails: {
          include: {
            client: true
          }
        }
      }
    });

    res.status(200).json({ message: 'Payment updated', payment });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Failed to update payment' });
  }
};

export const deletePayment = async (req, res) => {
  const paymentId = parseInt(req.params.id);

  try {
    // First check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Delete the payment (PaymentDetail records will be deleted automatically due to cascade)
    await prisma.payment.delete({ where: { id: paymentId } });
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Failed to delete payment' });
  }
};

export const getPaymentsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  try {
    const payments = await prisma.payment.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: { date: 'desc' },
      include: {
        paymentDetails: {
          include: {
            client: {
              select: {
                companyName: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error('Get payments by date range error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

export const getPaymentsTotal = async (req, res) => {
  try {
    const result = await prisma.payment.aggregate({
      _sum: {
        amount: true,
        availableCredit: true
      },
      _count: {
        id: true
      }
    });

    res.status(200).json({
      totalAmount: result._sum.amount || 0,
      totalCredit: result._sum.availableCredit || 0,
      totalCount: result._count.id || 0
    });
  } catch (error) {
    console.error('Get payments total error:', error);
    res.status(500).json({ message: 'Failed to fetch payments total' });
  }
};

export const getPaymentsByClient = async (req, res) => {
  const clientId = parseInt(req.params.clientId);

  try {
    const paymentDetails = await prisma.paymentDetail.findMany({
      where: { clientId },
      orderBy: { date: 'desc' },
      include: {
        payment: true,
        client: {
          select: {
            companyName: true,
            email: true
          }
        }
      }
    });

    res.status(200).json(paymentDetails);
  } catch (error) {
    console.error('Get payments by client error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
}; 