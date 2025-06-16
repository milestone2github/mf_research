require('dotenv').config();
const { default: axios } = require('axios');
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const Department = require('../models/Department');
const Permission = require('../models/Permission');


// Initiates login with Zoho OAuth

const loginWithZoho = (req, res) => {
  const redirectUrl = req.query.redirect || process.env.DEFAULT_FRONTEND_URL; 
  const state = encodeURIComponent(JSON.stringify({ redirectUrl }));
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${process.env.ZOHO_CLIENT_ID}&scope=profile,email,ZOHOPEOPLE.forms.ALL&redirect_uri=${process.env.ZOHO_REDIRECT_URI}&access_type=offline&state=${state}`;
  res.redirect(authUrl);
}

// Handles Zoho OAuth callback

const zohoCallback = async (req, res) => {
  const code = req.query.code;
  const state = req.query.state ? JSON.parse(decodeURIComponent(req.query.state)) : {};
  const redirectUrl = state.redirectUrl || process.env.DEFAULT_FRONTEND_URL;

  try {  
    // Step 1: authorization code for access token
    const tokenResponse = await axios.post(
      "https://accounts.zoho.com/oauth/v2/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          redirect_uri: process.env.ZOHO_REDIRECT_URI,
          code: code,
        },
      }
    );

    let id_token = tokenResponse.data.id_token;
    const decode = jwt.decode(id_token);
    console.log("decode", decode)
    // console.log("Line 42 token response", tokenResponse);

    const accessToken = tokenResponse.data.access_token;
    console.log("Line 44 access token", accessToken);

    // Step 2: Fetch user details from Zoho People API by email
    const userEmail = decode.email
    console.log("useremail", userEmail)
    const peopleApiUrl = `https://people.zoho.com/people/api/forms/P_EmployeeView/records`;

    const peopleResponse = await axios.get(peopleApiUrl, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`
      },
      params: {
        searchColumn: 'EMPLOYEEMAILALIAS',
        searchValue: userEmail
      }
    });

    console.log("this is people response", peopleResponse.data)

    if (!peopleResponse.data || !Array.isArray(peopleResponse.data) || peopleResponse.data.length === 0) {
      throw new Error(`Failed to fetch user details from Zoho People API for email: ${userEmail}`);
    }
    // Extract user details
    const zohoUser = peopleResponse.data[0]; // the first record is the user
    const email = zohoUser['Email ID'];

    if (!email) {
      throw new Error("Email not found in Zoho People API response");
    }

    // Step 3: Check if user exists in our database
    let userExist = await User.findOne({ email }).populate("role");
    let combinedPermissions;
    let internalDashboardRole;

    const setUserSession = (user) => {
      req.session.user = {
        name: user.name || `${zohoUser['First Name']} ${zohoUser['Last Name']}`.trim(),
        email: user.email,
        mintUsername: user.mintUsername,
        insuranceDashboardID: user.insuranceDashboardID,
        role: { _id: user.role._id, name: user.role ? user.role.name : null }, // Include role name if available
        permissions: combinedPermissions,
        internalDashboardRole: internalDashboardRole
      };
    };

    if (userExist) {
      console.log("Line 82 userExist", userExist)

     // Latest Sync with Zoho for Updated Role and Depaertment
      const currDate = new Date();
      const lastSyncDate = new Date(userExist.lastSyncedWithZoho || 0);
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

      // Runs Only if last synced with zoho greater then 30 days
      if (currDate - lastSyncDate > thirtyDaysInMs) {
        const latestDeptName = zohoUser.Department;
        const latestRoleName = zohoUser.Title;

        let updatedDept = await Department.findOne({ name: latestDeptName });
        if (!updatedDept) {
          updatedDept = await Department.create({ name: latestDeptName });
          console.log(`[SYNC] Created new department: "${latestDeptName}" with ID ${updatedDept._id}`);
        }

        let updatedRole = await Role.findOne({ name: latestRoleName });
        if (!updatedRole) {
          updatedRole = await Role.create({ name: latestRoleName });
          console.log(`[SYNC] Created new role: "${latestRoleName}" with ID ${updatedRole._id}`);
        }

        let updated = false;

        if (!userExist.department.equals(updatedDept._id)) {
          userExist.department = updatedDept._id;
          updated = true;
          console.log(`[SYNC] Department changed for ${email}: ${userExist.department} → ${updatedDept._id}`);
        }

        if (!userExist.role.equals(updatedRole._id)) {
          userExist.role = updatedRole._id;
          updated = true;
          console.log(`[SYNC] Role changed for ${email}: ${userExist.role} → ${updatedRole._id}`);
        }

        if (updated) {
          console.log(`[SYNC] Updated user ${email} with new department and/or role. Syncing now -(promotion/transfer detected)`);
          userExist.lastSyncedWithZoho = currDate;
          await userExist.save();
        } else {
          console.log(`[SYNC] No changes in department or role for ${email}. Just updating last sync timestamp.`);
          userExist.lastSyncedWithZoho = currDate;
          await userExist.save();
        }
      }
      // Step 4: If user exists, set session & redirect

      //combinedPermissions(role + department + user additional)  
      combinedPermissions = await getCombinedPermissions(userExist);
      internalDashboardRole = userExist.internalDashboardRole;

      await userExist.populate('role'); //role populated navbar purpose
      setUserSession(userExist);

      console.log("Session Set (Existing User):", req.session);
      return res.redirect(redirectUrl);
    }

    // Step 5: If user does NOT exist, fetch department & role details
    //--Check or create department and role if not in database
    let department = await Department.findOne({ name: zohoUser.Department });

    if (!department) {
      department = await Department.create({ name: zohoUser.Department });
      console.log("Created new department:", department);
    }

    let role = await Role.findOne({ name: zohoUser.Title });

    if (!role) {
      role = await Role.create({ name: zohoUser.Title });
      console.log("Created new role:", role);
    }

    // Step 6: Create new user in the database
    const newUser = new User({
      email: email,
      name: `${zohoUser['First Name']} ${zohoUser['Last Name']}`.trim(),
      mintUsername: zohoUser.mintUsername || null,
      insuranceDashboardID: zohoUser.insuranceDashboardID || null,
      department: department._id,
      role: role._id,
      internalDashboardRole: zohoUser.InternalDashboardRole || "",
      lastSyncedWithZoho: new Date()
    });

    console.log("Line113 new user created", newUser);

    await newUser.save();
    await newUser.populate('role'); // Populate the newly created role
    internalDashboardRole = newUser.internalDashboardRole;

    // Step 7: Set session & redirect new user


    {/* In case of new user if fresh depart and role created it might be possible combinedPermissions could be 
      empty(to be have permission, the depart and role must already exist in database with permission) 
      In that note it will create new user with  permission */}

    //combinedPermissions(role + department + user additional) 
    combinedPermissions = await getCombinedPermissions(newUser);

    setUserSession(newUser);

    console.log("New User Created & Session Set:", req.session); // Debug

    return res.redirect(redirectUrl);

  } catch (error) {
    console.error("Error during authentication or fetching user details", error);
    return res.redirect(`${redirectUrl}/login?error=permissiondenied`);
  }
};

//Logs out the user by destroying the session

const logout = (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error", err);
        return res.status(500).json({ message: "Could not log out." });
      }
      res.clearCookie("user");
      console.log("Logout: Session destroyed- cookies clear") //debug
      res.status(204).send(); // No content to send back
    });
  } else {
    res.status(401).json({ message: "Session not found" }); // Not authenticated or session expired
  }
};

const verifySession = (req, res) => {
  console.log("Session Data:", req.session);//debug
  if (req.session && req.session.user) {
    // refresh the session expiration time by the time set during configuration  
    req.session.touch();
    console.log(req.session.user);

    // If the session exists and contains user information, the user is logged in
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    // Otherwise, the user is not logged in
    res.status(200).json({ loggedIn: false, user: null });
  }
}

const verifyGoogleUser = async (req, res) => {
  try {
    const userExist = await User.findOne({ email: req.body.email }).populate("role")

    if (userExist) {
      req.session.user = {
        name: userExist.name || req.body.fullname,
        email: userExist.email,
        insuranceDashboardID: userExist.insuranceDashboardID,
        role: userExist.role
      };
      return res.status(200).json({
        success: true, msg: "logged in successfull", user: {
          name: req.body.fullname,
          userdata: userExist,
        }
      })
    }
    else {

      return res.status(400).json({ success: false, msg: "permission denied" })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Internal server error" })
  }
}

async function getCombinedPermissions(user) {
  const department = await Department.findById(user.department).populate('permissions');
  const role = await Role.findById(user.role).populate('permissions');
  const userDoc = await User.findById(user._id).populate('permissions');

  const departmentPermissions = department?.permissions || [];
  const rolePermissions = role?.permissions || [];
  const userPermissions = userDoc?.permissions || [];

  const combinedPermissionKeys = [
    ...new Set([
      ...departmentPermissions.map(p => p.key),
      ...rolePermissions.map(p => p.key),
      ...userPermissions.map(p => p.key)
    ])
  ];

  return combinedPermissionKeys;
}


module.exports = { loginWithZoho, zohoCallback, verifySession, verifyGoogleUser, logout }