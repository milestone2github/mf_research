const axios = require('axios');
const User = require('../../models/User');

const SPRINGVERIFY_BASE = "https://api.springverify.com";
const SPRINGVERIFY_TOKEN = process.env.SPRINGVERIFY_TOKEN;

// === Step 1 + 2: Fetch Package and Add Candidate ===
const fetchPackageAndAddCandidate = async (userId, userDetails) => {
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      console.log(`[SpringVerify] ❌ User not found for ID: ${userId}`);
      return { status: 'error', message: 'User not found', data: null, };
    }

    const { email, phone } = userDetails;
    const name = userDetails.name || `${userDetails.firstName} ${userDetails.lastName}`;

    console.log(`[SpringVerify] ➡️ Fetching packages for: ${name} (${email})`);

    // Fetch packages
    const packageResponse = await axios.get(`${SPRINGVERIFY_BASE}/candidate/packages`, {
      headers: {
        Authorization: `Bearer ${SPRINGVERIFY_TOKEN}`,
        Accept: 'application/json',
      },
    });

    const selectedPackage = packageResponse.data?.packages?.[0];
    if (!selectedPackage) {
      console.log(`[SpringVerify] ❌ No packages found in response`);
      return { status: 'error', message: 'No SpringVerify packages found', data: null, };
    }

    console.log(`[SpringVerify] Selected package: ${selectedPackage.package_id}`);

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

    console.log(`[SpringVerify] 📤 Sending candidate add request for ${email}`);

    const addCandidateRes = await axios.post(`${SPRINGVERIFY_BASE}/candidate/add`, candidatePayload, {
      headers: {
        Authorization: `Bearer ${SPRINGVERIFY_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    await User.findByIdAndUpdate(userId, {
      $set: {
        'onboarding.backgroundCheck.status': 'in_progress',
        'onboarding.backgroundCheck.initiatedAt': new Date(),
        'onboarding.backgroundCheck.reportUrl': '', 
        // want to save SpringVerify response, add this line:
        // 'onboarding.backgroundCheck.springVerifyMeta': addCandidateRes.data
      },
    });

    return {
      status: 'success',
      message: 'Package fetched and candidate added successfully',
      data: addCandidateRes.data,
    };
  } catch (error) {
        console.log(`[SpringVerify] Line 89 fetchPackageAndAddCandidate error:`, error?.response?.data || error.message);

    return { status: 'error', message: 'Failed to fetch package or add candidate', 
      data: error?.response?.data || error.message,};
  }
};


// === Step 3: Get Candidate Status ===
const getCandidateStatus = async (userId, email) => {
  try {
    console.log(`[SpringVerify] 🔍 Fetching status for candidate: ${email}`);
    const statusRes = await axios.get(`${SPRINGVERIFY_BASE}/candidate/details?email=${email}`, {
      headers: {
        Authorization: `Bearer ${SPRINGVERIFY_TOKEN}`,
      },
    });

    const candidateData = statusRes.data; //full response of candidate from springVerify
    const springStatus = candidateData?.overall_status; //verification status

    console.log(`[SpringVerify] 📄 Spring status for ${email}: ${springStatus}`);

    // Map SpringVerify status to DB enum
    let backgroundStatus = 'pending';
    if (springStatus === 'Completed') backgroundStatus = 'verified';
    else if (springStatus === 'In Progress') backgroundStatus = 'in_progress';
    else if (springStatus === 'Failed') backgroundStatus = 'failed';
    else if (springStatus === 'Skipped') backgroundStatus = 'skipped';

    // Extract report URL if available
    const reportUrl = candidateData?.report_url || '';

    await User.findByIdAndUpdate(userId, {
      $set: {
        'onboarding.backgroundCheck.status': backgroundStatus,
        'onboarding.backgroundCheck.completedAt': new Date(),
        ...(reportUrl && { 'onboarding.backgroundCheck.reportUrl': reportUrl }),
      },
    });

    console.log(`[SpringVerify] ✅ Status updated for user ${userId}: ${backgroundStatus}`);

    return {
      status: 'success', message: 'Candidate status fetched and saved successfully',
      data: {
        springStatus,
        mappedStatus: backgroundStatus,
        reportUrl,
      },
    };
  } catch (error) {
    console.error('SpringVerify getCandidateStatus error:', error?.response?.data || error.message);
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
