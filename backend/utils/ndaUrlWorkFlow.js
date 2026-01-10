const axios = require("axios");
const { getZohoAccessToken } = require("../utils/getZohoAccessToken");
const fs = require('fs');
const sendEmail = require("./sendEmail");
const FormData = require('form-data');
const path = require('path');
const User = require("../models/User");
const { triggerOnboardingFlow } = require("../utils/onboardingFlow");
const ndaRedirectHostURL = process.env.NDA_REDIRECT_HOST_URL


const ndaAgreementPdfPath = path.join(__dirname, 'Non-Disclosure Agreement.pdf');

const ndaSignStatusDbUpdate = async (req, res) => {
    const { status, userId } = req.query;
    // const userId = req.user?.userId ;
    // console.log(` Signing callback received: status=${status}, userId=${userId}`);

    if (!status || !userId) {
        console.warn('⚠️ Missing status or user ID.');
        return res.status(400).json({ success: false, message: 'Missing required parameters.' });
    }

    let message = '';
    let update = {};
    const signedAt = new Date(); 

    switch (status) {
        case 'success':
            // console.log(' Status indicates successful. Preparing DB update...');
            update = {
                'onboarding.nda.signed': true,
                'onboarding.nda.signedStatus': 'success',
                'onboarding.nda.signedAt': signedAt,
            };
            message = ' Signing was successful!';
            break;

        // commented for now 

        // case 'completed':
        //     console.log(' Status indicates successful or completed signing. Preparing DB update...');
        //     update = {
        //         'onboarding.nda.signedStatus': 'completed',
        //         'onboarding.nda.signedAt': signedAt,
        //     };
        //     message = ' Document signing completed!'
        //     break;

        case 'declined':
            // console.log(' Status indicates signing was declined. Preparing DB update...');
            update = {
                'onboarding.nda.signedStatus': 'declined',
            };
            message = ' The document signing was declined.';
            break;

        case 'later':
            // console.log(' Status indicates user chose to sign later. Skipping DB update.');
            update = {
                'onboarding.nda.signedStatus': 'later',
            };
            message = ' The document Signing deferred by user for later.';
            break;

        default:
            console.error(` Invalid status received: "${status}"`);
            return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    try {
        // console.log(' Attempting to update NDA signing status in the database.');
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: update },
            { new: true }
            );

            if (!updatedUser) {
            console.warn(` No user found with ID: ${userId}`);
            return res.status(404).json({ success: false, message: 'User not found.' });
            }

            if (status === 'success') {

            // Fire-and-forget OR await — choose one:
            // fire-and-forget (won't delay response):
            triggerOnboardingFlow(userId).catch(err =>
                console.error("WelcomePack dispatch error:", err)
            );

            // If you prefer to ensure send completes before responding, use:
            // await sendOnboardingWelcomePack(userId);
            }

            return res.status(200).json({ success: true, message, userId });

    } catch (error) {
        console.error(' Error updating NDA status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Only require Gotra
const GOTRA_URL =
  process.env.AZURE_GOTRA_URL ||
  "https://mfdatafeed.blob.core.windows.net/organization-policies/HR guideline.pdf";

// Fetch Gotra PDF but don’t throw on 404; return null instead
async function fetchPdfBufferSafe(url, label) {
  if (!url) return null;
  try {
    const resp = await axios.get(encodeURI(url), { responseType: "arraybuffer" });
    return Buffer.from(resp.data);
  } catch (err) {
    const status = err?.response?.status;
    console.warn(`[WelcomePack] Failed to fetch ${label} (${url}) status=${status || "n/a"}`);
    return null;
  }
}

async function sendOnboardingWelcomePack(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`[WelcomePack] No user for ID: ${userId}`);
      return false;
    }

    const to =  user.onboarding?.hrFilledInfo?.personalEmail;
    const name = user.onboarding?.hrFilledInfo?.name || "there";
    if (!to) {
      console.warn(`[WelcomePack] No recipient email for user ${userId}`);
      return false;
    }

    // Avoid duplicate sends using gotra flag
    if (user.onboarding?.gotra?.sent) {
      console.log("[WelcomePack] Gotra already sent — skipping");
      return true;
    }

    const gotraBuf = await fetchPdfBufferSafe(GOTRA_URL, "Gotra");
    const attachments = [];
    if (gotraBuf) {
      attachments.push({ filename: "Gotra_Guideline.pdf", content: gotraBuf });
    }

    await sendEmail({
      toAddress: to,
      subject: "Thanks for completing onboarding ",
      body: `
        <p>Dear ${name},</p>
        <p>Thank you for completing your onboarding form and signing the NDA.</p>
        <p>Please find attached the Gotra guidelines for your reference.</p>
        <p>Regards,<br/>HR Team</p>
      `,
      attachments,
    });

    // Mark gotra as sent
    user.onboarding.gotra = {
      sent: !!gotraBuf,
      sentAt: gotraBuf ? new Date() : user.onboarding?.gotra?.sentAt,
    };
    await user.save();

    return true;
  } catch (err) {
    console.error("❌ sendOnboardingWelcomePack failed:", err.message);
    return false;
  }
}

//Supporting function for below embeddedsigning controller to get User Details
const extractUserDetails = (user) => {
    const onboardingData = user.onboarding;
    const personal = onboardingData.userFilledInfo.personalDetails;
    const hrFilled = onboardingData.hrFilledInfo

    return {
        name: hrFilled.name,
        email: hrFilled.personalEmail,
        pan: personal.panNumber,
        phone: personal.phone,
        isExperienced: hrFilled.isExperienced,
        address: {
            street_address: personal.streetAddress,
            city: personal.city,
            state: personal.stateRegionProvince,
            pincode: personal.postalZipCode,
            country: personal.country,
        },
    };
};

// === Step : Generate E-Stamp ===
async function generateEstamp(requestId, documentId, employeeDetails, oauth) {

    const url = `https://sign.zoho.in/api/v1/requests/${requestId}`;
    const headers = {
        Authorization: `Zoho-oauthtoken ${oauth}`
    };

    const payload = {
        requests: {
            document_ids: [
                {
                    document_id: documentId,
                    document_order: 0,
                    estamping_request: {
                        stamp_duty_paid_by: "First Party",
                        stamp_state: "DL",
                        document_category: "1",
                        stamp_amount: "100",
                        first_party_name: "Milestone Global Moneymart Private Limited",
                        duty_payer_phone_number: 9910076952,
                        second_party_name: employeeDetails.name,
                        consideration_amount: 1000000,
                        first_party_details: {
                            first_party_entity_type: "Organization",
                            first_party_id_type: "PAN",
                            first_party_id_number: "AAECM5754G"
                        },
                        second_party_details: {
                            second_party_id_type: "PAN",
                            second_party_entity_type: "Individual",
                            second_party_id_number: employeeDetails.pan,
                        },
                        first_party_address: {
                            street_address: "101G, Crowne Heights, Sector 10, Rohini",
                            city: "Delhi",
                            state: "DL",
                            pincode: "110085",
                            country: "India"
                        },
                        second_party_address: {
                            street_address: employeeDetails.address.street_address,
                            city: employeeDetails.address.city,
                            state: employeeDetails.address.state,
                            pincode: employeeDetails.address.postalZipCode,
                            country: employeeDetails.address.country,
                        }
                    }
                }
            ]
        }
    };

    try {
        await axios.put(url, payload, { headers });
        // console.log("eStamp address:", employeeDetails.address);

        // console.log('E-stamp paper generated successfully.');
        return 200;
    } catch (error) {
        console.error('Failed to generate e-stamp paper:', error.response?.data || error);
        throw error;
    }
}

// === Master Step : generating Sign URL ===

const embeddedsigning = async (req, res) => {
    const accessToken = await getZohoAccessToken();
    let employeeEmail = null;

    try {
        // console.log("🔍 Incoming userId via middlewaare:", req.user?.userId);
        const userId = req.user?.userId;
        const user = await User.findById(userId).lean();
        
        // console.log("Received userId:", userId);
        
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        
        // const userDetails = req.body;
        employeeEmail = user.onboarding.hrFilledInfo.personalEmail;
        const employeeName = user.onboarding.hrFilledInfo.name;

        const userDetails = extractUserDetails(user);


        // console.log(' Step 1: Using real onboarding PDF...');

        if (!fs.existsSync(ndaAgreementPdfPath)) {
            throw new Error(`PDF file not found at ${ndaAgreementPdfPath}`);
        }
        // console.log(' Onboarding PDF exists at:', ndaAgreementPdfPath);

        // console.log(' Step 2: Preparing request payload...');

        const actionsJson = [
            {
                recipient_name: employeeName,
                recipient_email: employeeEmail,
                action_type: 'SIGN',
                signing_order: 1,
                verify_recipient: true,
                verification_type: 'EMAIL',
                is_embedded: true,
                private_notes: 'Please sign this NDA document from mNivesh',
            },
            {
                recipient_name: 'Vilakshan Bhutani',
                recipient_email: 'vilakshan@niveshonline.com',
                signing_order: 2,
                // role: 'Director',
                action_type: 'SIGN',
                verify_recipient: false,
                is_embedded: false, // Not embedded
                private_notes: employeeName
            },
            {
                recipient_name: 'Human Resource',
                recipient_email: 'hr@niveshonline.com',
                signing_order: 3,
                // role: 'Human Resource',
                action_type: 'VIEW',
                verify_recipient: false,
                is_embedded: false, // Not embedded
                private_notes: employeeName
            }
        ];

        const documentJson = {
            request_name: 'Non-Disclosure Agreement',
            expiration_days: 2,
            is_sequential: true,
            email_reminders: true,
            reminder_period: 8,
            actions: actionsJson,
            redirect_pages: {
                sign_success: `${ndaRedirectHostURL}/sign-success?status=success&userId=${userId}`,
                sign_completed: `https://sign.zoho.com/`,
                sign_declined: `${ndaRedirectHostURL}/sign-declined?status=declined&userId=${userId}`,
                sign_later: `${ndaRedirectHostURL}/sign-later?status=later&userId=${userId}`
            }
        };

        const payload = new FormData();
        payload.append('file', fs.createReadStream(ndaAgreementPdfPath));
        payload.append('data', JSON.stringify({ requests: documentJson }));

        // console.log(' Step 3: Sending create request to Zoho...');

        const createResponse = await axios.post(
            'https://sign.zoho.in/api/v1/requests',
            payload,
            {
                headers: {
                    ...payload.getHeaders(),
                    Authorization: `Zoho-oauthtoken ${accessToken}`
                }
            }
        );

        // console.log(' Zoho Sign create response received');
        // console.log(' Full Response:', JSON.stringify(createResponse.data, null, 2));

        const requests = createResponse.data.requests;
        const request_id = requests?.request_id;
        const document_id = requests.document_ids?.[0]?.document_id;
        // const action_id = requests?.actions?.[0]?.action_id;

        // Extract action_ids for director and HR from create response
        const employeeActionId = requests?.actions?.[0]?.action_id;
        const directorActionId = requests?.actions?.[1]?.action_id;


        if (!request_id || !employeeActionId || !directorActionId ) {
            console.error(' request_id or employeeActionId or directorActionId is missing in response');
            return res.status(500).json({
                error: 'Missing request_id or action_id in Zoho response',
                data: createResponse.data
            });
        }

        // console.log(` Request ID: ${request_id}`);
        // console.log(` Action ID: ${action_id}`);
        // console.log(` employeeActionId ID: ${employeeActionId}`);
        // console.log(` directorActionId: ${directorActionId}`);
        // console.log(` Document ID: ${document_id}`);

        const fieldJsonEmployee = [{
            "x_coord": 177,
            "abs_height": 13,
            "text_property": {
                "is_italic": false,
                "max_field_length": 100,
                "is_underline": false,
                "font_color": "000000",
                "is_fixed_width": true,
                "font_size": 11,
                "is_fixed_height": true,
                "is_read_only": false,
                "alignment": "LEFT",
                "is_bold": false,
                "font": "Roboto"
            },
            "field_category": "textfield",
            "field_label": "Full name",
            ////"triggered_field_ids": [],
            "name_format": "FULL_NAME",
            "is_mandatory": true,
            "default_value": "",
            "page_no": 0,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "field_name": "Full name",
            "y_value": 17.444506,
            "abs_width": 113,
            "width": 18.488253,
            "y_coord": 138,
            "field_type_name": "Name",
            "description_tooltip": "",
            "x_value": 28.87034,
            "height": 1.578532
        },
        {
            "x_coord": 213,
            "abs_height": 13,
            "text_property": {
                "is_italic": false,
                "max_field_length": 2048,
                "is_underline": false,
                "font_color": "000000",
                "is_fixed_width": false,
                "font_size": 12,
                "is_fixed_height": true,
                "is_read_only": false,
                "alignment": "LEFT",
                "is_bold": false,
                "font": "Roboto"
            },
            "field_category": "datefield",
            "field_label": "Sign Date",
            ////"triggered_field_ids": [],
            "is_mandatory": true,
            //"time_zone_offset": 330,
            "page_no": 0,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "time_zone": "Asia/Kolkata",
            "field_name": "Sign Date",
            "y_value": 21.075129,
            "abs_width": 121,
            "width": 19.81614,
            "y_coord": 167,
            "date_format": "dd MMM yyyy",
            "field_type_name": "Date",
            "description_tooltip": "",
            "x_value": 34.79635,
            "height": 1.657459
        },
        {
            "x_coord": 96,
            "abs_height": 13,
            "text_property": {
                "is_italic": false,
                "max_field_length": 100,
                "is_underline": false,
                "font_color": "000000",
                "is_fixed_width": true,
                "font_size": 11,
                "is_fixed_height": true,
                "is_read_only": false,
                "alignment": "LEFT",
                "is_bold": false,
                "font": "Roboto"
            },
            "field_category": "textfield",
            "field_label": "Full name",
            ////"triggered_field_ids": [],
            "name_format": "FULL_NAME",
            "is_mandatory": true,
            "default_value": "",
            "page_no": 0,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "field_name": "Full name",
            "y_value": 87.15765,
            "abs_width": 268,
            "width": 43.71808,
            "y_coord": 690,
            "field_type_name": "Name",
            "description_tooltip": "",
            "x_value": 15.692033,
            "height": 1.578532
        },
        {
            "x_coord": 16,
            "abs_height": 23,
            "field_category": "image",
            "field_label": "Signature",
            ////"triggered_field_ids": [],
            "is_mandatory": true,
            "page_no": 0,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "is_draggable": false,
            "field_name": "Signature",
            "y_value": 92.68572,
            "abs_width": 157,
            "width": 25.638407,
            "y_coord": 734,
            "field_type_name": "Signature",
            "description_tooltip": "",
            "is_resizable": false,
            "x_value": 2.623851,
            "height": 2.841358
        },
        {
            "x_coord": 102,
            "abs_height": 11,
            "text_property": {
                "is_italic": false,
                "max_field_length": 100,
                "is_underline": false,
                "font_color": "000000",
                "is_fixed_width": true,
                "font_size": 10,
                "is_fixed_height": true,
                "is_read_only": false,
                "alignment": "LEFT",
                "is_bold": false,
                "font": "Roboto"
            },
            "field_category": "textfield",
            "field_label": "Full name",
            ////"triggered_field_ids": [],
            "name_format": "FULL_NAME",
            "is_mandatory": true,
            "default_value": "",
            "page_no": 1,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "field_name": "Full name",
            "y_value": 87.97899,
            "abs_width": 256,
            "width": 41.87947,
            "y_coord": 697,
            "field_type_name": "Name",
            "description_tooltip": "",
            "x_value": 16.715078,
            "height": 1.420679
        },
        {
            "x_coord": 18,
            "abs_height": 27,
            "field_category": "image",
            "field_label": "Signature",
            ////"triggered_field_ids": [],
            "is_mandatory": true,
            "page_no": 1,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "is_draggable": false,
            "field_name": "Signature",
            "y_value": 92.02718,
            "abs_width": 192,
            "width": 31.358528,
            "y_coord": 729,
            "field_type_name": "Signature",
            "description_tooltip": "",
            "is_resizable": false,
            "x_value": 3.022855,
            "height": 3.393844
        },
        {
            "x_coord": 89,
            "abs_height": 11,
            "text_property": {
                "is_italic": false,
                "max_field_length": 100,
                "is_underline": false,
                "font_color": "000000",
                "is_fixed_width": true,
                "font_size": 10,
                "is_fixed_height": true,
                "is_read_only": false,
                "alignment": "LEFT",
                "is_bold": false,
                "font": "Roboto"
            },
            "field_category": "textfield",
            "field_label": "Full name",
            ////"triggered_field_ids": [],
            "name_format": "FULL_NAME",
            "is_mandatory": true,
            "default_value": "",
            "page_no": 2,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "field_name": "Full name",
            "y_value": 88.18494,
            "abs_width": 260,
            "width": 42.49234,
            "y_coord": 698,
            "field_type_name": "Name",
            "description_tooltip": "",
            "x_value": 14.466292,
            "height": 1.420679
        },
        {
            "x_coord": 17,
            "abs_height": 27,
            "field_category": "image",
            "field_label": "Signature",
            ////"triggered_field_ids": [],
            "is_mandatory": true,
            "page_no": 2,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "is_draggable": false,
            "field_name": "Signature",
            "y_value": 92.07774,
            "abs_width": 192,
            "width": 31.358528,
            "y_coord": 729,
            "field_type_name": "Signature",
            "description_tooltip": "",
            "is_resizable": false,
            "x_value": 2.71642,
            "height": 3.393844
        },
        {
            "x_coord": 425,
            "abs_height": 13,
            "text_property": {
                "is_italic": false,
                "max_field_length": 2048,
                "is_underline": false,
                "font_color": "000000",
                "is_fixed_width": false,
                "font_size": 11,
                "is_fixed_height": true,
                "is_read_only": false,
                "alignment": "LEFT",
                "is_bold": false,
                "font": "Roboto"
            },
            "field_category": "datefield",
            "field_label": "Sign Date",
            ////"triggered_field_ids": [],
            "is_mandatory": true,
            //"time_zone_offset": 330,
            "page_no": 3,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "time_zone": "Asia/Kolkata",
            "field_name": "Sign Date",
            "y_value": 73.27841,
            "abs_width": 98,
            "width": 16.036772,
            "y_coord": 580,
            "date_format": "MMM dd yyyy HH:mm z",
            "field_type_name": "Date",
            "description_tooltip": "",
            "x_value": 69.51928,
            "height": 1.657459
        },
        {
            "x_coord": 72,
            "abs_height": 27,
            "field_category": "image",
            "field_label": "Signature",
            ////"triggered_field_ids": [],
            "is_mandatory": true,
            "page_no": 3,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "is_draggable": false,
            "field_name": "Signature",
            "y_value": 76.909035,
            "abs_width": 192,
            "width": 31.358528,
            "y_coord": 609,
            "field_type_name": "Signature",
            "description_tooltip": "",
            "is_resizable": true,
            "x_value": 11.705184,
            "height": 3.393844
        },
        {
            "x_coord": 199,
            "abs_height": 13,
            "text_property": {
                "is_italic": false,
                "max_field_length": 100,
                "is_underline": false,
                "font_color": "000000",
                "is_fixed_width": true,
                "font_size": 11,
                "is_fixed_height": true,
                "is_read_only": false,
                "alignment": "LEFT",
                "is_bold": false,
                "font": "Roboto"
            },
            "field_category": "textfield",
            "field_label": "Full name",
            ////"triggered_field_ids": [],
            "name_format": "FULL_NAME",
            "is_mandatory": true,
            "default_value": "",
            "page_no": 3,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "field_name": "Full name",
            "y_value": 81.565704,
            "abs_width": 98,
            "width": 16.036772,
            "y_coord": 646,
            "field_type_name": "Name",
            "description_tooltip": "",
            "x_value": 32.440628,
            "height": 1.657459
        },
        {
            "x_coord": 98,
            "abs_height": 13,
            "text_property": {
                "is_italic": false,
                "max_field_length": 100,
                "is_underline": false,
                "font_color": "000000",
                "is_fixed_width": true,
                "font_size": 12,
                "is_fixed_height": true,
                "is_read_only": false,
                "alignment": "LEFT",
                "is_bold": false,
                "font": "Roboto"
            },
            "field_category": "textfield",
            "field_label": "Full name",
            ////"triggered_field_ids": [],
            "name_format": "FULL_NAME",
            "is_mandatory": true,
            "default_value": "",
            "page_no": 3,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "field_name": "Full name",
            "y_value": 88.20713,
            "abs_width": 211,
            "width": 34.525024,
            "y_coord": 699,
            "field_type_name": "Name",
            "description_tooltip": "",
            "x_value": 15.996872,
            "height": 1.657459
        },
        {
            "x_coord": 18,
            "abs_height": 27,
            "field_category": "image",
            "field_label": "Signature",
            ////"triggered_field_ids": [],
            "is_mandatory": true,
            "page_no": 3,
            "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
            "is_draggable": false,
            "field_name": "Signature",
            "y_value": 92.06294,
            "abs_width": 192,
            "width": 31.358528,
            "y_coord": 729,
            "field_type_name": "Signature",
            "description_tooltip": "",
            "is_resizable": true,
            "x_value": 2.92071,
            "height": 3.393844
        }
        ];
        const fieldJsonDirector = [
            {
                "x_coord": 377,
                "abs_height": 28,
                "field_category": "image",
                "field_label": "Signature",
                //"triggered_field_ids": [],
                "is_mandatory": true,
                "page_no": 0,
                "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
                "is_draggable": false,
                "field_name": "Signature",
                "y_value": 92.06788,
                "abs_width": 192,
                "width": 31.358528,
                "y_coord": 729,
                "field_type_name": "Signature",
                "description_tooltip": "",
                "is_resizable": true,
                "x_value": 61.57431,
                "height": 3.47277
            },
            {
                "x_coord": 419,
                "abs_height": 13,
                "text_property": {
                    "is_italic": false,
                    "max_field_length": 100,
                    "is_underline": false,
                    "font_color": "000000",
                    "is_fixed_width": true,
                    "font_size": 11,
                    "is_fixed_height": true,
                    "is_read_only": false,
                    "alignment": "LEFT",
                    "is_bold": false,
                    "font": "Roboto"
                },
                "field_category": "textfield",
                "field_label": "Full name",
                //"triggered_field_ids": [],
                "name_format": "FULL_NAME",
                "is_mandatory": true,
                "default_value": "",
                "page_no": 0,
                "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
                "field_name": "Full name",
                "y_value": 95.9999,
                "abs_width": 98,
                "width": 16.036772,
                "y_coord": 760,
                "field_type_name": "Name",
                "description_tooltip": "",
                "x_value": 68.52337,
                "height": 1.657459
            },
            {
                "x_coord": 379,
                "abs_height": 27,
                "field_category": "image",
                "field_label": "Signature",
                //"triggered_field_ids": [],
                "is_mandatory": true,
                "page_no": 1,
                "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
                "is_draggable": false,
                "field_name": "Signature",
                "y_value": 92.01362,
                "abs_width": 192,
                "width": 31.358528,
                "y_coord": 729,
                "field_type_name": "Signature",
                "description_tooltip": "",
                "is_resizable": true,
                "x_value": 61.858402,
                "height": 3.393844
            },
            {
                "x_coord": 421,
                "abs_height": 13,
                "text_property": {
                    "is_italic": false,
                    "max_field_length": 100,
                    "is_underline": false,
                    "font_color": "000000",
                    "is_fixed_width": true,
                    "font_size": 11,
                    "is_fixed_height": true,
                    "is_read_only": false,
                    "alignment": "LEFT",
                    "is_bold": false,
                    "font": "Roboto"
                },
                "field_category": "textfield",
                "field_label": "Full name",
                //"triggered_field_ids": [],
                "name_format": "FULL_NAME",
                "is_mandatory": true,
                "default_value": "",
                "page_no": 1,
                "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
                "field_name": "Full name",
                "y_value": 96.03887,
                "abs_width": 98,
                "width": 16.036772,
                "y_coord": 761,
                "field_type_name": "Name",
                "description_tooltip": "",
                "x_value": 68.80427,
                "height": 1.657459
            },
            {
                "x_coord": 377,
                "abs_height": 27,
                "field_category": "image",
                "field_label": "Signature",
                //"triggered_field_ids": [],
                "is_mandatory": true,
                "page_no": 2,
                "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
                "is_draggable": false,
                "field_name": "Signature",
                "y_value": 92.09131,
                "abs_width": 192,
                "width": 31.358528,
                "y_coord": 729,
                "field_type_name": "Signature",
                "description_tooltip": "",
                "is_resizable": false,
                "x_value": 61.551968,
                "height": 3.393844
            },
            {
                "x_coord": 417,
                "abs_height": 13,
                "text_property": {
                    "is_italic": false,
                    "max_field_length": 100,
                    "is_underline": false,
                    "font_color": "000000",
                    "is_fixed_width": true,
                    "font_size": 11,
                    "is_fixed_height": true,
                    "is_read_only": false,
                    "alignment": "LEFT",
                    "is_bold": false,
                    "font": "Roboto"
                },
                "field_category": "textfield",
                "field_label": "Full name",
                //"triggered_field_ids": [],
                "name_format": "FULL_NAME",
                "is_mandatory": true,
                "default_value": "",
                "page_no": 2,
                "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
                "field_name": "Full name",
                "y_value": 96.02407,
                "abs_width": 98,
                "width": 16.036772,
                "y_coord": 761,
                "field_type_name": "Name",
                "description_tooltip": "",
                "x_value": 68.19139,
                "height": 1.657459
            },
            {
                "x_coord": 379,
                "abs_height": 27,
                "field_category": "image",
                "field_label": "Signature",
                //"triggered_field_ids": [],
                "is_mandatory": true,
                "page_no": 3,
                "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
                "is_draggable": false,
                "field_name": "Signature",
                "y_value": 92.07651,
                "abs_width": 192,
                "width": 31.358528,
                "y_coord": 729,
                "field_type_name": "Signature",
                "description_tooltip": "",
                "is_resizable": true,
                "x_value": 61.87117,
                "height": 3.393844
            },
            {
                "x_coord": 416,
                "abs_height": 13,
                "text_property": {
                    "is_italic": false,
                    "max_field_length": 100,
                    "is_underline": false,
                    "font_color": "000000",
                    "is_fixed_width": true,
                    "font_size": 11,
                    "is_fixed_height": true,
                    "is_read_only": false,
                    "alignment": "LEFT",
                    "is_bold": false,
                    "font": "Roboto"
                },
                "field_category": "textfield",
                "field_label": "Full name",
                //"triggered_field_ids": [],
                "name_format": "FULL_NAME",
                "is_mandatory": true,
                "default_value": "",
                "page_no": 3,
                "document_id": "e0131487a0885f7142efaca2bfe8afd8b639d077474cc36550a05e6858db9d75",
                "field_name": "Full name",
                "y_value": 96.0882,
                "abs_width": 98,
                "width": 16.036772,
                "y_coord": 761,
                "field_type_name": "Name",
                "description_tooltip": "",
                "x_value": 67.98711,
                "height": 1.657459
            }
        ];

        fieldJsonEmployee.forEach(field => {
            field.document_id = document_id;
        });
        fieldJsonDirector.forEach(field => {
            field.document_id = document_id;
        });

        const actionsToSubmit = [
            {
                action_id: employeeActionId,
                recipient_name: employeeName,
                recipient_email: employeeEmail,
                action_type: 'SIGN',
                fields: fieldJsonEmployee
            },
            {
                action_id: directorActionId,
                recipient_name: 'Vilakshan Bhutani',
                recipient_email: 'vilakshan@niveshonline.com',
                action_type: 'SIGN',
                fields: fieldJsonDirector
            }
        ]
        // const actionsJson1 = {
        //     action_id,
        //     recipient_name: employeeName,
        //     recipient_email: employeeEmail,
        //     action_type: 'SIGN',
        //     fields: fieldJsonEmployee
        // };

        const payload1 = new FormData();
        // payload1.append('data', JSON.stringify({ requests: { actions: [actionsJson1] } }));
        payload1.append('data', JSON.stringify({ requests: { actions: actionsToSubmit } }));

        // console.log('🔗 Step 4: Generating the E-Stamp ...');

        await generateEstamp(request_id, document_id, userDetails, accessToken);
        // console.log("Done generateEstamp");

        // console.log(' Step 5: Submitting fields to Zoho...');

        const submitResponse = await axios.post(
            `https://sign.zoho.in/api/v1/requests/${request_id}/submit`,
            payload1,
            {
                headers: {
                    ...payload1.getHeaders(),
                    Authorization: `Zoho-oauthtoken ${accessToken}`
                }
            }
        );
        // console.log(' Field submission successful');

        const payload2 = new FormData();
        payload2.append('host', `${ndaRedirectHostURL}`);

        // console.log('🔗 Step 6: Requesting embedded signing URL...');

        const embedRes = await axios.post(
            `https://sign.zoho.in/api/v1/requests/${request_id}/actions/${employeeActionId}/embedtoken`,
            payload2,
            {
                headers: {
                    ...payload2.getHeaders(),
                    Authorization: `Zoho-oauthtoken ${accessToken}`
                }
            }
        );

        const embedJson = embedRes.data;
        // console.log(' Embedded token response:', embedJson);

        if (!embedJson.sign_url) {
            console.error(' No sign_url received');
            return res.status(500).json({ error: 'Failed to generate sign URL', details: embedJson });
        }

        // console.log(' Signing URL generated successfully:', embedJson.sign_url);

        //  Update NDA status in DB
        // console.log('Updating NDA status for user:', userId);
        await User.findByIdAndUpdate(userId, {
            $set: {
                'onboarding.nda.urlGenerated': true,
                'onboarding.nda.urlGeneratedAt': new Date(),
                'onboarding.nda.requestId': request_id
            }
        });
        // console.log("Databse updated for user id", userId)

        return res.json({
            message: 'Success! Embedded sign URL generated.',
            signingURL: embedJson.sign_url,
            status: embedJson.status
        });

    } catch (err) {
        // send error via email notification
            await sendEmail({
              toAddress: 'error@niveshonline.com',
              subject: 'Error in Dispatching NDA',
              body: `<p>Error occurred in embeddedsigning NDA flow for user ${employeeEmail}</p><pre>${err.stack}</pre>`
            });
        console.error(' Error occurred during embedded signing flow:');
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: 'Internal error', details: err.response?.data || err.message });
    }
};

module.exports = {
    embeddedsigning,
    ndaSignStatusDbUpdate
};