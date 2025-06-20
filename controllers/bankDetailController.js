import prisma from '../config/prismaClient.js';

// Create a new bank detail
export const createBankDetail = async (req, res) => {
  const {
    profileId,
    bankName,
    branchName,
    adCode,
    upiId,
    accountNumber,
    ifscCode,
    swiftCode,
    accountHolderName
  } = req.body;

  if (!profileId || !bankName || !accountNumber || !ifscCode || !accountHolderName) {
    return res.status(400).json({ message: 'Required fields are missing.' });
  }

  try {
    const bankDetail = await prisma.bankDetail.create({
      data: {
        profile: { connect: { id: parseInt(profileId) } },
        bankName,
        branchName,
        adCode,
        upiId,
        accountNumber,
        ifscCode,
        swiftCode,
        accountHolderName,
      },
    });

    res.status(201).json({ message: 'Bank detail created', bankDetail });
  } catch (error) {
    console.error('Create BankDetail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bank details
export const getAllBankDetails = async (req, res) => {
  try {
    const bankDetails = await prisma.bankDetail.findMany({
      include: { profile: true }
    });
    res.status(200).json(bankDetails);
  } catch (error) {
    console.error('Fetch BankDetails error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single bank detail by ID
export const getBankDetailById = async (req, res) => {
  const { id } = req.params;
  try {
    const bankDetail = await prisma.bankDetail.findUnique({
      where: { id: parseInt(id) },
      include: { profile: true }
    });
    if (!bankDetail) {
      return res.status(404).json({ message: 'Bank detail not found.' });
    }
    res.status(200).json(bankDetail);
  } catch (error) {
    console.error('Fetch BankDetail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update bank detail
export const updateBankDetail = async (req, res) => {
  const { id } = req.params;
  const {
    profileId,
    bankName,
    branchName,
    adCode,
    upiId,
    accountNumber,
    ifscCode,
    swiftCode,
    accountHolderName
  } = req.body;

  try {
    const updatedBankDetail = await prisma.bankDetail.update({
      where: { id: parseInt(id) },
      data: {
        profile: { connect: { id: parseInt(profileId) } },
        bankName,
        branchName,
        adCode,
        upiId,
        accountNumber,
        ifscCode,
        swiftCode,
        accountHolderName,
      },
    });

    res.status(200).json({ message: 'Bank detail updated', updatedBankDetail });
  } catch (error) {
    console.error('Update BankDetail error:', error);
    res.status(500).json({ message: 'Failed to update bank detail' });
  }
};

// Delete bank detail
export const deleteBankDetail = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.bankDetail.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: 'Bank detail deleted successfully' });
  } catch (error) {
    console.error('Delete BankDetail error:', error);
    res.status(500).json({ message: 'Failed to delete bank detail' });
  }
};
