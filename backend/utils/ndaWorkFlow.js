const axios = require("axios");
const { getZohoAccessToken } = require("../utils/getZohoAccessToken");
const sendEmail = require("./sendEmail");
const FormData = require('form-data');
const User = require("../models/User");

// === Step 1: Create NDA Document ===
async function createNdaDocument(employeeName, employeeEmail, oauth) {
  const url = "https://sign.zoho.in/api/v1/templates/70669000000031001/createdocument";
  const headers = {
    Authorization: `Zoho-oauthtoken ${oauth}`
  };

  const data = {
    templates: {
      field_data: {
        field_text_data: {},
        field_boolean_data: {},
        field_date_data: {},
        field_radio_data: {}
      },
      actions: [
        {
          recipient_name: employeeName,
          recipient_email: employeeEmail,
          action_id: "70669000000031024",
          signing_order: 1,
          role: "Employee",
          verify_recipient: false,
          private_notes: "mNivesh",
          verification_type: "EMAIL"
        },
        {
          recipient_name: "Vilakshan Bhutani",
          recipient_email: "vilakshan@niveshonline.com",
          action_id: "70669000000031022",
          signing_order: 2,
          role: "Director",
          verify_recipient: false,
          private_notes: employeeName
        },
        {
          recipient_name: "Human Resource",
          recipient_email: "hr@niveshonline.com",
          action_id: "70669000000041700",
          signing_order: 3,
          role: "Human Resource",
          verify_recipient: false,
          private_notes: employeeName
        }
      ],
      notes: employeeName
    }
  };

  const form = new FormData();
  form.append("data", JSON.stringify(data));
  form.append("is_quicksend", "false");

  try {
    const response = await axios.post(url, form, {
      headers: {
        ...headers,
        ...form.getHeaders(),
      },
    });

    const documentId = response.data.requests.document_ids[0].document_id;
    const requestId = response.data.requests.request_id;
    if (!requestId || !documentId) {
      throw new Error("Missing requestId or documentId in Zoho response.");
    }

    // console.log("Request id is ", requestId);
    // console.log("[createNdaDocument] Line 75 and its type is", typeof requestId);


    return { documentId, requestId };
  } catch (error) {
    console.error('Failed to create document:', error.response?.data || error);
    throw error;
  }
}

// === Step 2: Generate E-Stamp ===
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

// === Step 3: Send for Signature ===
async function sendForSignature(requestId, oauth, userEmail) {
  // console.log("Request id at 142 is ", requestId);
  const url = `https://sign.zoho.in/api/v1/requests/${requestId}/submit`;
  const headers = { Authorization: `Zoho-oauthtoken ${oauth}` };

  try {
    await axios.post(url, null, { headers });
    // console.log('Document sent for signature successfully.');
  } catch (error) {
    const errRes = error.response?.data;
    // console.log(errRes?.code);
    console.error('❌ Failed to send document for signature:', errRes || error);

    // 🚨 Handle specific "insufficient credit" case
    if (errRes?.code === 13001) {
      await sendEmail({
        toAddress: 'hr@niveshonline.com, accounts@niveshonline.com',
        subject: '🚨 Automated Alert: Zoho Sign Credits Depleted',
        body: `
          <p>Hello Accounts & HR team,</p>
          <p>Our <strong>Zoho Sign credits</strong> for NDA signing, document generation, and e-stamping have run out.</p>
          <p><strong>User affected:</strong> ${userEmail || 'Unknown'}</p>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p>Pending agreements and documents cannot be processed until new credits are added.</p>
          <p>Please allocate credits as soon as possible to restore onboarding functionality.</p>
          <br/>
          <p>Thank you.<br/>—<em>IT Team</em></p>
        `
      });

      // console.log("📧 Alert email sent to HR & Accounts due to insufficient credits.");
    }
    throw error;
  }
}

// === Master Orchestration ===
async function dispatchNdaFlow(userId, oauth, employeeDetails, stampRequired = true) {
  const { name, email, pan, address } = employeeDetails;
  // console.log("Detail of employee is ", employeeDetails);
  try {
    // const oauth = await getZohoAccessToken();
    const { documentId, requestId } = await createNdaDocument(name, email, oauth);

    if (stampRequired) {
      await generateEstamp(requestId, documentId, employeeDetails, oauth);
    }

    await sendForSignature(requestId, oauth, employeeDetails?.email );

    // update NDA status in DB
    // console.log('Updating NDA status for user:', userId);
    await User.findByIdAndUpdate(userId, {
      $set: {
        'onboarding.nda.sent': true,
        'onboarding.nda.sentAt': new Date(),
        'onboarding.nda.requestId': requestId
      }
    });
    // console.log("Databse updated for user id", userId)
  } catch (error) {

    // send error via email notification
    await sendEmail({
      toAddress: 'error@niveshonline.com',
      subject: 'Error in Dispatching NDA',
      body: `<p>Error occurred in dispatchNdaFlow for user ${employeeDetails?.email}</p><pre>${error.stack}</pre>`
    });

    // console.log("[dispatchNdaFlow] Mail sent Line 220");

    // console.log('Error dispatchNda main function');
    throw new Error("Error dispatchNda main function");
  }
}

module.exports = {
  // dispatchNdaFlow
};