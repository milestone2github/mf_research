const axios = require('axios');
const User = require('../../models/User');

const SPRINGVERIFY_BASE = "https://api.springverify.com";
const SPRINGVERIFY_TOKEN = process.env.SPRINGVERIFY_TOKEN;

// === Step 1 + 2: Fetch Package and Add Candidate ===
const fetchPackageAndAddCandidate = async (userId, userDetails) => {
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      return {
        status: 'error',
        message: 'User not found',
        data: null,
      };
    }

    const { email, phone } = userDetails;
    const name = userDetails.name || `${userDetails.firstName} ${userDetails.lastName}`;

    // Fetch packages
    const packageResponse = await axios.get(`${SPRINGVERIFY_BASE}/candidate/packages`, {
      headers: {
        Authorization: `Bearer ${SPRINGVERIFY_TOKEN}`,
        Accept: 'application/json',
      },
    });

    const selectedPackage = packageResponse.data?.packages?.[0];
    if (!selectedPackage) {
      return {
        status: 'error',
        message: 'No SpringVerify packages found',
        data: null,
      };
    }

    const packageId = selectedPackage.package_id;
    const subtypeId = selectedPackage.subtypes?.[0]?.subtype_id;

    // Add candidate
    const candidatePayload = {
      candidate: {
        name,
        email,
        alternate_email: '',
        phone,
        alternate_phone: '',
        employee_id: userDetails.employeeId || '',
        uan_number: '',
        tags: [{ id: 100 }],
        resume: '',
        invite: true,
        is_consent_undertaking_letter: false,
        category_id: 200,
        meta_data: { uuid: user._id.toString() },
      },
      package: {
        package_id: packageId,
        subtype_id: subtypeId,
        config: {},
      },
    };

    const addCandidateRes = await axios.post(`${SPRINGVERIFY_BASE}/candidate/add`, candidatePayload, {
      headers: {
        Authorization: `Bearer ${SPRINGVERIFY_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    await User.findByIdAndUpdate(userId, {
      $set: {
        'onboarding.springVerify': {
          packageId,
          subtypeId,
          springCandidateData: addCandidateRes.data,
          verified: true,
          initiatedAt: new Date(),
        },
      },
    });

    return {
      status: 'success',
      message: 'Package fetched and candidate added successfully',
      data: addCandidateRes.data,
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to fetch package or add candidate',
      data: error?.response?.data || error.message,
    };
  }
};

// === Step 3: Get Candidate Status ===
const getCandidateStatus = async (userId, email) => {
  try {
    const statusRes = await axios.get(`${SPRINGVERIFY_BASE}/candidate/details?email=${email}`, {
      headers: {
        Authorization: `Bearer ${SPRINGVERIFY_TOKEN}`,
      },
    });

    const candidateDataResponse = statusRes.data; //full response of candidate from springVerify

    const candidateStatus = candidateDataResponse.overall_status; // status check

    await User.findByIdAndUpdate(userId, {
      $set: {
        'onboarding.springVerify.candidateStatus': candidateStatus,
        'onboarding.springVerify.completedAt': new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Candidate status fetched successfully',
      data: candidateStatus,
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to fetch candidate status',
      data: error?.response?.data || error.message,
    };
  }
};

module.exports = {
  fetchPackageAndAddCandidate,
  getCandidateStatus,
};
