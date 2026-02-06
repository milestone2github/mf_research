const User = require("../../models/User");
const axios = require('axios');
const ZohoEmployeeIdCount = require("../../models/ZohoEmployeeIdCount");
const Department = require("../../models/Department");
const Role = require("../../models/Role");
const { getwebHookAccessToken } = require("../../utils/webHookAccessToken");
const { ZOHO_FLOW_WEBHOOK_URL } = require("../../utils/stringConstants");

async function resolveZohoDepartmentId(departmentId) {
  if (!departmentId) return '';

  const dept = await Department.findById(departmentId).select('zohoid').lean();
  return dept?.zohoid || '';
}

async function resolveZohoDesignationId(roleId) {
  if (!roleId) return '';

  const role = await Role.findById(roleId).select('zohoid').lean();
  return role?.zohoid || '';
}



const ZOHO_FLOW_WEBHOOK = ZOHO_FLOW_WEBHOOK_URL;


async function triggerZohoFlow(payload) {
  if (!ZOHO_FLOW_WEBHOOK) {
    console.warn("[ZohoFlow] Webhook URL not configured");
    return;
  }
  console.log('[ZohoFlow][TRIGGER_PAYLOAD]', payload);
  
  const response = await axios.post(ZOHO_FLOW_WEBHOOK, payload);
  
   console.log('[ZohoFlow][TRIGGER_RESPONSE]', {
    status: response.status,
    data: response.data
  });
}


const ZOHO_PEOPLE_EMPLOYEE_API = process.env.ZOHO_PEOPLE_EMPLOYEE_API;


// Fetch all employee emails from Zoho to check for duplicates
async function fetchAllZohoEmployeeEmails() {
  const accessToken = await getwebHookAccessToken();

  const response = await axios.get(
   ZOHO_PEOPLE_EMPLOYEE_API,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  const records = Array.isArray(response.data) ? response.data : [];

  const allEmails = records
    .map(emp => emp["Email ID"])
    .filter(Boolean)
    .map(email => email.toLowerCase());


  return allEmails;
}




function generateEmailVariants(firstName, lastName, domain) {
  const first = firstName.toLowerCase();
  const last = lastName?.toLowerCase() || "";

  return [
    `${first}${domain}`,
    last && `${first}.${last[0]}${domain}`,
    last && `${first}.${last}${domain}`,
    ...Array.from({ length: 10 }, (_, i) =>
      last ? `${first}.${last}${i + 1}${domain}` : null
    ),
  ].filter(Boolean);
}

function isEmailAvailable(email, existingEmails) {
  return !existingEmails.includes(email.toLowerCase());
}

const WORK_LOCATION_MAP = {
  delhi: "879647009",
  ferozepur: "879648459",
  sonipat: "879855040"
};

function resolveWorkLocation(user) {
  const location =
    user.onboarding?.hrFilledInfo?.reportingLocation ||
    user.onboarding?.hrFilledInfo?.city ||
    "delhi";

  return WORK_LOCATION_MAP[location.toLowerCase()] || WORK_LOCATION_MAP.delhi;
}

function resolveZohoGender(gender) {
  if (!gender) return '';

  const value = gender.toLowerCase();

  if (value === 'male') return 'M';
  if (value === 'female') return 'F';
  if (value === 'prefer not to say') return 'prefer not to say';

  // fallback for unknown values
  return '';
}

// Generating Unique Email id for new Employee
async function registerEmployeeInZohoById(userId, employeeId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const domain = "@niveshonline.com";

  const nameParts = user.onboarding.hrFilledInfo.name
    .trim()
    .toLowerCase()
    .split(" ");

  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join("") || "";

  //  FETCH EXISTING EMAILS FROM ZOHO PEOPLE
  const existingEmails = await fetchAllZohoEmployeeEmails(
    process.env.ZOHO_REFRESH_TOKEN
  );

  const emailCandidates = generateEmailVariants(firstName, lastName, domain);

  for (const email of emailCandidates) {
    if (isEmailAvailable(email, existingEmails)) {
      return {
        success: true,
        finalEmail: email,
        employeeId,
        firstName,
        lastName
      };
    }
  }

  return { success: false };
}

const zohoFlowCallback = async (req, res) => {
   console.log('[ZohoFlow][RAW_CALLBACK]', {
    method: req.method,
    url: req.originalUrl,
    query: req.query,
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
    }
  });
  
  try {
    const { status } = req.query;
    const body = req.body;
     console.log('[ZohoFlow][CALLBACK_RECEIVED]', {
      status,
      phone: body.phone,
      employeeId: body.employee_id,
    });
    // phone comes ONLY from body
    const user = await User.findOne({
        'onboarding.hrFilledInfo.phone': body.phone
        });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  Idempotency guard
    if (user.onboarding?.zohoSetup?.status === 'completed') {
      return res.json({ success: true, message: "Already processed" });
    }
    
    if (status !== "success" && status !== "error") {
      return res.status(400).json({ message: "Invalid status" });
    }


    //  SUCCESS PATH
    if (status === "success") {
      // body: { phone, email, role, employee_id }
      await User.findByIdAndUpdate(user._id, {
        $set: {
          email: body.email,
          'onboarding.zohoSetup.status': 'completed',
          'onboarding.zohoSetup.userCreated': true,
          'onboarding.zohoSetup.email': body.email,
          'onboarding.zohoSetup.assignedAt': new Date()
        }
      });

      // increment ID only after confirmed success
    //   await ZohoEmployeeIdCount.findOneAndUpdate(
    //     {},
    //     { $inc: { currentCount: 1 } }
    //   );
    }

    //  ERROR PATH
    else if (status === "error") {
      // body: { message, status, phone, email, first_name, last_name }
      await User.findByIdAndUpdate(user._id, {
        $set: {
          'onboarding.zohoSetup.status': 'failed',
          'onboarding.zohoSetup.error': body.message || body.status || 'Zoho Flow error'
        }
      });
    }

    return res.json({ success: true });

  } catch (err) {
    console.error("Zoho Flow callback failed:", err);
    return res.status(500).json({ success: false });
  }
};


// Main function to Add new Employee in Zoho
async function newEmployeeSetup(userId) {
  console.log('[ZohoSetup][START]', {
  userId,
});

  try {
    const user = await User.findById(userId);

    if (user.onboarding?.zohoSetup?.status === 'in_progress') {
      throw new Error('Zoho setup already in progress');
    }

   let employeeId = user?.onboarding?.zohoSetup?.zohoEmployeeId;

    if (!employeeId) {
      const countDoc = await ZohoEmployeeIdCount.findOneAndUpdate(
        {},
        { $inc: { currentCount: 1 } },
        { new: true, upsert: true }
      );

      employeeId = countDoc.currentCount.toString();

      console.log('[ZohoSetup][EMPLOYEE_ID_RESERVED]', { userId, employeeId });
    } else {
      console.log('[ZohoSetup][EMPLOYEE_ID_REUSED]', { userId, employeeId });
    }


    const {
      success,
      finalEmail,
      firstName,
      lastName
    } = await registerEmployeeInZohoById(userId, employeeId);

    console.log('[ZohoSetup][EMAIL_FINALIZED]', {
      userId,
      employeeId,
      email: finalEmail,
    });


    if (!success) {
      throw new Error("Unable to generate unique email");
    }

    //  mark in-progress
    await User.findByIdAndUpdate(userId, {
      $set: {
        'onboarding.zohoSetup.status': 'in_progress',
        'onboarding.zohoSetup.zohoEmployeeId': employeeId.toString()
      }
    });

    const zohoDepartmentId = await resolveZohoDepartmentId(
      user.onboarding.hrFilledInfo.department
    );

    const zohoDesignationId = await resolveZohoDesignationId(
      user.onboarding.hrFilledInfo.role
    );

    console.log('[ZohoSetup][FLOW_TRIGGER]', {
      employeeId,
      phone: user.onboarding.hrFilledInfo.phone,
      department: zohoDepartmentId,
      designation: zohoDesignationId,
      workLocation: resolveWorkLocation(user),
    });


    //  trigger Zoho Flow
    await triggerZohoFlow({
      employee_id: employeeId.toString(),
      first_name: firstName,
      last_name: lastName,
      email_address: finalEmail,
      phone: user.onboarding.hrFilledInfo.phone,
      gender: resolveZohoGender(user.onboarding.hrFilledInfo.gender),
      designation_id: zohoDesignationId,
      department_id: zohoDepartmentId,
      work_location: resolveWorkLocation(user),
      date_of_birth: new Date(
        user.onboarding.userFilledInfo.personalDetails.dob
      ).getTime(),
      date_of_joining: new Date(
        user.onboarding.hrFilledInfo.doj
      ).getTime(),
      street_address:
        user.onboarding.userFilledInfo.personalDetails.streetAddress,
      city: user.onboarding.hrFilledInfo.city,
      state:
        user.onboarding.userFilledInfo.personalDetails.stateRegionProvince,
      postal_code:
        user.onboarding.userFilledInfo.personalDetails.postalZipCode,
      country:
       (user.onboarding?.userFilledInfo?.personalDetails?.country || '').trim() || 'India'

    });

    return finalEmail;

  } catch (err) {
    await User.findByIdAndUpdate(userId, {
      $set: {
        'onboarding.zohoSetup.status': 'failed',
        'onboarding.zohoSetup.error': err.message
      }
    });

    throw err;
  }
}

async function retryZohoSetup(req, res) {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.onboarding?.zohoSetup?.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Retry allowed only if Zoho setup failed'
      });
    }

    await newEmployeeSetup(user._id);

    res.json({
      success: true,
      message: 'Zoho setup retried successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Retry failed'
    });
  }
}


const ndaSignedWebhook = async (req, res) => {
    const payload = req.body;
    // console.log("Webhook Received:", JSON.stringify(payload));

    const { requests } = payload;

    try {
        const requestId = requests?.request_id;
        if (!requestId) {
            return res.status(400).json({ status: 'error', message: 'Missing request_id in webhook payload' });
        }

        // user with the matching request ID
        const user = await User.findOne({ 'onboarding.nda.requestId': requestId }).lean();
        if (!user) {
            console.warn(`No user found with requestId: ${requestId}`);
            return res.status(404).json({ status: 'error', message: 'User not found for requestId' });
        }

        const expectedEmail = user?.onboarding?.hrFilledInfo?.personalEmail;
        // console.log("[WebHook] expected email is:", expectedEmail);

        //  action that matches the user's email
        const matchedAction = requests?.actions?.find(
            (action) =>
                action.action_type === 'SIGN' &&
                action.recipient_email === expectedEmail &&
                action.action_status === 'SIGNED'
        );

        if (matchedAction) {
            //Correct user has signed the document
            const signedAt = new Date();

            const updated = await User.findOneAndUpdate(
                { 'onboarding.nda.requestId': requestId },
                {
                    $set: {
                        'onboarding.nda.signed': true,
                        'onboarding.nda.signedAt': signedAt,
                    }
                }, { new: true }
            );

            if (updated) {
                // console.log(`NDA marked as signed for: ${updated.email}`);
                await newEmployeeSetup(updated._id);
            }
        }

        return res.status(200).json({ status: 'success', message: 'Webhook processed and Zoho setup initiated' }); // respond 200 to acknowledge receipt

    } catch (error) {
        console.error('Error handling NDA signed webhook:', error.message);
        res.sendStatus(500);
    }
};

module.exports = { newEmployeeSetup, ndaSignedWebhook, retryZohoSetup, zohoFlowCallback };