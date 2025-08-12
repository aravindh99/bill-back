import prisma from '../config/prismaClient.js';

const truncate = (value, max = 191) => {
  if (typeof value !== 'string') return value;
  return value.length > max ? value.slice(0, max) : value;
};

const sanitizeProfilePayload = (payload) => {
  const sanitized = { ...payload };
  // Drop huge data-URL logos to avoid DB varchar(191) overflow
  if (typeof sanitized.logo === 'string' && sanitized.logo.startsWith('data:') && sanitized.logo.length > 191) {
    sanitized.logo = null;
  } else {
    sanitized.logo = truncate(sanitized.logo);
  }
  sanitized.companyName = truncate(sanitized.companyName);
  sanitized.country = truncate(sanitized.country);
  sanitized.city = truncate(sanitized.city);
  sanitized.pinCode = truncate(sanitized.pinCode);
  sanitized.defaultCurrency = truncate(sanitized.defaultCurrency);
  sanitized.state = truncate(sanitized.state);
  sanitized.address = truncate(sanitized.address);
  sanitized.email = truncate(sanitized.email);
  sanitized.phone = truncate(sanitized.phone);
  sanitized.serviceTaxNo = truncate(sanitized.serviceTaxNo);
  sanitized.website = truncate(sanitized.website);
  sanitized.taxationType = truncate(sanitized.taxationType);
  sanitized.contactName = truncate(sanitized.contactName);
  sanitized.companyCode = truncate(sanitized.companyCode);
  return sanitized;
};

export const createProfile = async (req, res) => {
  const {
    logo,
    companyName,
    country,
    city,
    pinCode,
    defaultCurrency,
    state,
    address,
    email,
    phone,
    serviceTaxNo,
    website,
    taxationType,
    contactName,
    companyCode,
    bankDetails // array of bank details
  } = req.body;

  if (!companyName || !country || !city || !address || !email || !phone) {
    return res.status(400).json({ message: 'Company name, country, city, address, email, and phone are required.' });
  }

  try {
    const existingProfile = await prisma.profile.findFirst({ where: { email } });
    if (existingProfile) {
      return res.status(409).json({ message: 'Profile with this email already exists' });
    }

    const sanitized = sanitizeProfilePayload({
      logo,
      companyName,
      country,
      city,
      pinCode,
      defaultCurrency,
      state,
      address,
      email,
      phone,
      serviceTaxNo,
      website,
      taxationType,
      contactName,
      companyCode
    });

    const profile = await prisma.profile.create({
      data: {
        ...sanitized,
        // Force-drop logo for demo to avoid VARCHAR(191) overflow
        logo: null,
        defaultCurrency: sanitized.defaultCurrency || 'INR',
        bankDetails: bankDetails ? {
          create: bankDetails.map((bank) => ({
            bankName: truncate(bank.bankName),
            branchName: truncate(bank.branchName),
            adCode: truncate(bank.adCode),
            upiId: truncate(bank.upiId),
            accountNumber: truncate(bank.accountNumber),
            ifscCode: truncate(bank.ifscCode),
            swiftCode: truncate(bank.swiftCode),
            accountHolderName: truncate(bank.accountHolderName)
          }))
        } : undefined
      },
      include: {
        bankDetails: true
      }
    });

    res.status(201).json({ message: 'Profile created', profile });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ message: 'Failed to create profile' });
  }
};

export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({
      include: {
        bankDetails: true
      }
    });
    res.status(200).json(profiles);
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ message: 'Failed to fetch profiles' });
  }
};

export const getProfileById = async (req, res) => {
  const profileId = parseInt(req.params.id);

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        bankDetails: true
      }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Get profile by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  const profileId = parseInt(req.params.id);
  const {
    logo,
    companyName,
    country,
    city,
    pinCode,
    defaultCurrency,
    state,
    address,
    email,
    phone,
    serviceTaxNo,
    website,
    taxationType,
    contactName,
    companyCode
  } = req.body;

  if (!companyName || !country || !city || !address || !email || !phone) {
    return res.status(400).json({ message: 'Company name, country, city, address, email, and phone are required.' });
  }

  try {
    // Check if email is already used by another profile
    const existingProfileWithEmail = await prisma.profile.findFirst({
      where: {
        email,
        id: { not: profileId }
      }
    });

    if (existingProfileWithEmail) {
      return res.status(409).json({ message: 'Email is already in use by another profile' });
    }

    const sanitized = sanitizeProfilePayload({
      logo,
      companyName,
      country,
      city,
      pinCode,
      defaultCurrency,
      state,
      address,
      email,
      phone,
      serviceTaxNo,
      website,
      taxationType,
      contactName,
      companyCode
    });

    const profile = await prisma.profile.update({
      where: { id: profileId },
      data: {
        ...sanitized,
        // Force-drop logo for demo
        logo: null,
        defaultCurrency: sanitized.defaultCurrency || 'INR'
      },
      include: {
        bankDetails: true
      }
    });

    res.status(200).json({ message: 'Profile updated', profile });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Profile not found' });
    } else {
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }
};

export const deleteProfile = async (req, res) => {
  const profileId = parseInt(req.params.id);

  try {
    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { id: profileId }
    });

    if (!existingProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Delete the profile (bank details will be deleted automatically due to cascade)
    await prisma.profile.delete({ where: { id: profileId } });
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Profile not found' });
    } else if (error.code === 'P2003') {
      res.status(409).json({ 
        message: 'Cannot delete profile. It may be referenced by other records.',
        relatedRecords: {
          message: 'This profile cannot be deleted because it is referenced by other records in the system.'
        }
      });
    } else {
      res.status(500).json({ message: 'Failed to delete profile' });
    }
  }
};

export const addBankDetail = async (req, res) => {
  const profileId = parseInt(req.params.profileId);
  const {
    bankName,
    branchName,
    adCode,
    upiId,
    accountNumber,
    ifscCode,
    swiftCode,
    accountHolderName
  } = req.body;

  if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
    return res.status(400).json({ message: 'Bank name, account number, IFSC code, and account holder name are required.' });
  }

  try {
    const bankDetail = await prisma.bankDetail.create({
      data: {
        profileId,
        bankName: truncate(bankName),
        branchName: truncate(branchName),
        adCode: truncate(adCode),
        upiId: truncate(upiId),
        accountNumber: truncate(accountNumber),
        ifscCode: truncate(ifscCode),
        swiftCode: truncate(swiftCode),
        accountHolderName: truncate(accountHolderName)
      }
    });

    res.status(201).json({ message: 'Bank detail added', bankDetail });
  } catch (error) {
    console.error('Add bank detail error:', error);
    res.status(500).json({ message: 'Failed to add bank detail' });
  }
};

export const updateBankDetail = async (req, res) => {
  const bankDetailId = parseInt(req.params.id);
  const {
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
    const bankDetail = await prisma.bankDetail.update({
      where: { id: bankDetailId },
      data: {
        bankName: truncate(bankName),
        branchName: truncate(branchName),
        adCode: truncate(adCode),
        upiId: truncate(upiId),
        accountNumber: truncate(accountNumber),
        ifscCode: truncate(ifscCode),
        swiftCode: truncate(swiftCode),
        accountHolderName: truncate(accountHolderName)
      }
    });

    res.status(200).json({ message: 'Bank detail updated', bankDetail });
  } catch (error) {
    console.error('Update bank detail error:', error);
    res.status(500).json({ message: 'Failed to update bank detail' });
  }
};

export const deleteBankDetail = async (req, res) => {
  const bankDetailId = parseInt(req.params.id);

  try {
    await prisma.bankDetail.delete({ where: { id: bankDetailId } });
    res.status(200).json({ message: 'Bank detail deleted successfully' });
  } catch (error) {
    console.error('Delete bank detail error:', error);
    res.status(500).json({ message: 'Failed to delete bank detail' });
  }
};

export const getCurrentProfile = async (req, res) => {
  try {
    // Get the first/main profile (assuming single company setup)
    const profile = await prisma.profile.findFirst({
      include: {
        bankDetails: true
      }
    });

    if (!profile) {
      return res.status(404).json({ message: 'No profile found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Get current profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
}; 