import prisma from '../config/prismaClient.js';

export const createPaymentDetail = async (req, res) => {
  const {
    paymentId,
    clientId,
    number,
    date,
    amount,
    method,
    bankCharges,
    reference,
  } = req.body;

  if (!paymentId || !clientId || !number || !date || !amount || !method) {
    return res.status(400).json({ message: 'Required fields are missing.' });
  }

  try {
    const paymentDetail = await prisma.paymentDetail.create({
      data: {
        paymentId,
        clientId,
        number,
        date: new Date(date),
        amount: parseFloat(amount),
        method,
        bankCharges: bankCharges ? parseFloat(bankCharges) : undefined,
        reference,
      },
    });

    res.status(201).json({ message: 'Payment detail created', paymentDetail });
  } catch (error) {
    console.error('Create PaymentDetail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllPaymentDetails = async (req, res) => {
  try {
    const details = await prisma.paymentDetail.findMany({
      include: {
        client: true,
        payment: true,
      },
    });
    res.status(200).json(details);
  } catch (error) {
    console.error('Fetch PaymentDetails error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePaymentDetail = async (req, res) => {
  const detailId = parseInt(req.params.id);

  try {
    // First check if payment detail exists
    const paymentDetail = await prisma.paymentDetail.findUnique({
      where: { id: detailId },
      include: {
        client: {
          select: {
            companyName: true
          }
        }
      }
    });

    if (!paymentDetail) {
      return res.status(404).json({ message: 'Payment detail not found' });
    }

    // Delete the payment detail
    await prisma.paymentDetail.delete({ where: { id: detailId } });
    res.status(200).json({ message: 'Payment detail deleted successfully' });
  } catch (error) {
    console.error('Delete PaymentDetail error:', error);
    res.status(500).json({ message: 'Failed to delete payment detail' });
  }
};
