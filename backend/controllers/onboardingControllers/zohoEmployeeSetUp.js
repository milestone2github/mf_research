const User = require("../../models/User");
const axios = require('axios');
const ZohoEmployeeIdCount = require("../../models/ZohoEmployeeIdCount");
const { getwebHookAccessToken } = require("../../utils/webHookAccessToken");

// zoho setup
const BASE_URL =
    "https://people.zoho.com/people/api/forms/json/employee/insertRecord";


// Supporting function to check if E-mail exists & Add new Employee to Zoho
async function zohoApiOnboarding(access_token, record) {
    // console.log("[zohoEmployeeSetUp] Entered the zohoApiOnboarding to Add new Employee");
    // console.log("[zohoEmployeeSetUp] Acces Token at zohoApiOnboarding", access_token);


    const params = {
        inputData: JSON.stringify(record),
    };

    const headers = {
        Authorization: `Zoho-oauthtoken ${access_token}`,
    };
    // Adding Record at Zoho
    try {
        const resp = await axios.get(BASE_URL, { params, headers });
        // console.log("[zohoEmployeeSetUp] response at line 62 in zohoApiOnboarding is", resp.data);

        const errors = resp.data.response?.errors.code;
        if (errors === 7006) return 1;
        else if (errors === 7412) { throw new Error(`Employee Adding Limit at Zoho is reached`) };


        return 0;
    } catch (err) {
        // console.error("Request failed:", err.response?.data || err.message);
        return -1;
    }
}

// Generating Unique Email id for new Employee
async function registerEmployeeInZohoById(userId, access_token) {
    // console.log(" [zohoEmployeeSetUp] Entered the registerEmployeeInZohoById function")

    const user = await User.findById(userId);
    // let finalEmail = "";
    if (!user) throw { status: 404, message: "User not found" };

    // ✅ Fetch the current employee ID count
    let countDoc = await ZohoEmployeeIdCount.findOne();
    // console.log(`[zohoEmployeeSetUp] current count is ${countDoc}`);

    if (!countDoc) {
        // If it doesn’t exist, initialize it
        countDoc = await ZohoEmployeeIdCount.create({ currentCount: 385 });
    }

    const employeeId = countDoc.currentCount;

    const domain = "@niveshonline.com";

    const first = user.onboarding.hrFilledInfo.name.split(" ")[0]?.toLowerCase();
    const last = user.onboarding.hrFilledInfo.name.split(" ")[1]?.toLowerCase();

    let email = first + domain;

    let records = {
        EmployeeID: employeeId.toString(),
        FirstName: first,
        LastName: last,
        EmailID: email,
    };
    // console.log(" [zohoEmployeeSetUp] Records at registerEmployeeInZohoById function is", records);

    // 🔁 Attempt to register with retries
    let result = await zohoApiOnboarding(access_token, records);
    // console.log("[zohoEmployeeSetUp] Result at Line 73=5 in registerEmployeeInZohoById is:", result);

    if (result === 1) {
        email = `${first}.${last.charAt(0)}${domain}`;
        records.EmailID = email;
        result = await zohoApiOnboarding(access_token, records);
        // console.log("[zohoEmployeeSetUp] Result at Line 83 in registerEmployeeInZohoById is:", result);

        if (result === 1) {
            email = `${first}.${last}${domain}`;
            records.EmailID = email;
            result = await zohoApiOnboarding(access_token, records);
            // console.log("[zohoEmployeeSetUp] Result at Line 91 in registerEmployeeInZohoById is:", result);

            if (result === 1) {
                for (let i = 1; ; i++) {
                    email = `${first}.${last}${i}${domain}`;
                    records.EmailID = email;
                    result = await zohoApiOnboarding(access_token, records);
                    // console.log("[zohoEmployeeSetUp] Result at Line 98 in registerEmployeeInZohoById is:", result);

                    if (result === 0) break;
                }
            }
        }
    }

    if (result === 0) {
        // mail generation is sucessfull 
        // console.log(`[Zoho Setup] ✅ Successfully registered user with email: ${email} and EmployeeID: ${employeeId}`);
        return {
            success: true,
            message: "Employee registered successfully in Zoho",
            finalEmail: email,
            employeeId
        };
    }
    console.warn(`[Zoho Setup] ❌ Failed to register employee in Zoho after retries. Last attempted email: ${email}`);
    return {
        success: false,
        message: "Failed to register employee in Zoho after all retries",
        email: null,
        employeeId: null
    };
}


// Main function to Add new Employee in Zoho
async function newEmployeeSetup(userId) {
    // console.log(`[zohoEmployeeSetUp] userid fron newEmployeeSetup ${userId}`);

    try {
        const access_token = await getwebHookAccessToken();

        const { success, finalEmail, employeeId } = await registerEmployeeInZohoById(userId, access_token);
        // console.log("[zohoEmployeeSetUp] Final Email value  at 131 is ", finalEmail,);
        // console.log("[zohoEmployeeSetUp]  Employeid is at 132 is ", employeeId);
        if (!success) {
            // console.log(`Failed to register employee in Zoho ${finalEmail}`);
            throw new Error("Failed to register employee in Zoho");

        }
        if (finalEmail) {
            // console.log(`🎉 Employee adding at ZOHOis successfully done. BRAVO!! Final email: ${finalEmail}`);
        }

        // ✅ Mark zohoSetup as completed in DB
        await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                     email: finalEmail,
                    'onboarding.zohoSetup.userCreated': true,
                    'onboarding.zohoSetup.zohoEmployeeId': employeeId.toString(),
                    'onboarding.zohoSetup.email': finalEmail
                }
            }, { new: true }
        );

        // console.log(`DB updated for newly created user with mail and zohoSetup: ${finalEmail}`);

        // ✅ Update ZohoEmployeeIdCount
        await ZohoEmployeeIdCount.findOneAndUpdate(
            {}, {
            $inc: { currentCount: 1 },
            $set: { lastModified: new Date() }
        }
        );

        // console.log(`[zohoEmployeeSetUp] Successfully updated user and employee count ${employeeId}`);
        // await getEmployeeRecords(access_token);
        // const gotraStatus = await sendGotraDocument(id);
        return finalEmail;
    } catch (err) {
        // console.log(`[zohoEmployeeSetUp] Error in newEmployeeSetupfor for user with useid: ${userId}`, err.message);
        throw new Error(err.message || "Unknown error during Zoho employee setup");
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
            console.warn(`⚠️ No user found with requestId: ${requestId}`);
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
            // ✅ Correct user has signed the document
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
                // console.log(`✅ NDA marked as signed for: ${updated.email}`);
                await newEmployeeSetup(updated._id);
            }
        }

        return res.status(200).json({ status: 'success', message: 'Webhook processed and Zoho setup initiated' }); // respond 200 to acknowledge receipt

    } catch (error) {
        console.error('❌ Error handling NDA signed webhook:', error.message);
        res.sendStatus(500);
    }
};

module.exports = { newEmployeeSetup, ndaSignedWebhook };