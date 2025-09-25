require('dotenv').config();
const { default: axios } = require('axios');
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_NOT_FOUND } = require('../utils/stringConstants');
const { refreshZohoAccessToken } = require('../utils/refreshZohoAccessToken ');
const { fetchZohoPeopleData } = require('../utils/fetchZohoPeopleData');
const Department = require('../models/Department');


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

    // const access_token = tokenResponse.data.access_token;
    const { access_token, refresh_token } = tokenResponse.data;
    let id_token = tokenResponse.data.id_token;
    const decode = jwt.decode(id_token);

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Fetch user details from Zoho People API by email
    const userEmail = decode.email
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
    let userExist = await User.findOne({ email }).populate({path: "role", select: "name"});
    let combinedPermissions;
    let internalDashboardRole;

    const setUserSession = (user) => {
      req.session.user = {
        name: user.name || `${zohoUser['First Name']} ${zohoUser['Last Name']}`.trim(),
        email: user.email,
        mintUsername: user.mintUsername,
        insuranceDashboardID: user.insuranceDashboardID,
        role: { _id: user?.role?._id, name: user.role ? user.role.name : null }, // Include role name if available
        permissions: combinedPermissions,
        internalDashboardRole: internalDashboardRole,
        access_token,
        refresh_token
      };
    };

    if (userExist) {

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
          // console.log(`[SYNC] Created new department: "${latestDeptName}" with ID ${updatedDept._id}`);
        }

        let updatedRole = await Role.findOne({ name: latestRoleName });
        if (!updatedRole) {
          updatedRole = await Role.create({ name: latestRoleName });
          // console.log(`[SYNC] Created new role: "${latestRoleName}" with ID ${updatedRole._id}`);
        }

        let updated = false;

        if (!userExist.department.equals(updatedDept._id)) {
          userExist.department = updatedDept._id;
          updated = true;
          // console.log(`[SYNC] Department changed for ${email}: ${userExist.department} → ${updatedDept._id}`);
        }

        if (!userExist.role.equals(updatedRole._id)) {
          userExist.role = updatedRole._id;
          updated = true;
          // console.log(`[SYNC] Role changed for ${email}: ${userExist.role} → ${updatedRole._id}`);
        }

        if (updated) {
          // console.log(`[SYNC] Updated user ${email} with new department and/or role. Syncing now -(promotion/transfer detected)`);
          userExist.lastSyncedWithZoho = currDate;
          await userExist.save();
        } else {
          // console.log(`[SYNC] No changes in department or role for ${email}. Just updating last sync timestamp.`);
          userExist.lastSyncedWithZoho = currDate;
          await userExist.save();
        }
      }
      // Step 4: If user exists, set session & redirect

      //combinedPermissions(role + department + user additional)  
      combinedPermissions = await getCombinedPermissions(userExist);
      internalDashboardRole = userExist.internalDashboardRole;

      setUserSession(userExist);

      // console.log("Session Set (Existing User):", req.session);
      return res.redirect(redirectUrl);
    }

    // Step 5: If user does NOT exist, fetch department & role details
    //--Check or create department and role if not in database
    let department = await Department.findOne({ name: zohoUser.Department });

    if (!department) {
      department = await Department.create({ name: zohoUser.Department });
      // console.log("Created new department:", department);
    }

    let role = await Role.findOne({ name: zohoUser.Title });

    if (!role) {
      role = await Role.create({ name: zohoUser.Title, department: department._id });
      // console.log("Created new role:", role);
      // console.log(`[ROLE-CREATE] New role "${role.name}" created under department "${department.name}" with ID ${role._id}`);
    }

    // Step 6: Create new user in the database
    const newUser = new User({
      email: email,
      name: `${zohoUser['First Name']} ${zohoUser['Last Name']}`.trim(),
      mintUsername: zohoUser.mintUsername || null,
      insuranceDashboardID: zohoUser.insuranceDashboardID || null,
      department: department._id,
      role: role._id,
      status: 'active',
      internalDashboardRole: zohoUser.internalDashboardRole || "",
      lastSyncedWithZoho: new Date()
    });

    await newUser.save();
    await newUser.populate('role'); // Populate the newly created role
    internalDashboardRole = newUser.internalDashboardRole;

    // Step 7: Set session & redirect new user


    {/* In case of new user if fresh depart and role created it might be possible combinedPermissions could be 
      empty(to be have permission, the depart and role must already exist in database with permission) 
      In that note it will create new user with  permission */}

    // combinedPermissions(role + department + user additional) 
    combinedPermissions = await getCombinedPermissions(newUser);

    setUserSession(newUser);

    // console.log("New User Created & Session Set:", req.session); // Debug

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
      // console.log("Logout: Session destroyed- cookies clear") //debug
      res.status(204).send(); // No content to send back
    });
  } else {
    res.status(401).json({ message: "Session not found" }); // Not authenticated or session expired
  }
};

const verifySession = async (req, res) => {
  // console.log("Session Data:", req.session);//debug
  if (req.session && req.session.user) {
    // refresh the session expiration time by the time set during configuration  
    req.session.touch(); 
     const user = await User.findOne({ email: req.session.user.email });
      if (!user) {
        return res.status(401).json({ loggedIn: false, user: null });
      }
      const permissions = await getCombinedPermissions(user);

      // Update session and prepare response user object
      req.session.user.permissions = permissions;

    // console.log("Updated session user:", req.session.user);

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
    // console.log(error);
    res.status(500).json({ success: false, msg: "Internal server error" })
  }
}

const fetchSMList = async (req, res) => {
  try {

    const serviceManagers = await User.find({status:"active"})
      .populate("role")
      .then(users => 
        users.filter(u => u.role?.name === "Service Manager" || u.role?.name === "Chief Operation Officer" && u.name) // skip null/empty names
          .map(u => u.name)
      );

    res.status(200).json({ success: true, data: serviceManagers });
  } catch (err) {
    console.error("Error in fetchSMList:", err);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

// Extract access_token and fetch list of SM users
// const fetchSMList = async (req, res) => {
//   try {
//     let access_token = req.session.user?.access_token;
//     const refresh_token = req.session.user?.refresh_token;

//     if (!access_token && !refresh_token) {
//       return res.status(401).json({ message: ACCESS_TOKEN_NOT_FOUND });
//     }
    
//     if (!access_token && refresh_token) {
//       access_token = await refreshZohoAccessToken(refresh_token);
//       req.session.user.access_token = access_token;
//     }
  
//     const peopleUrl = 'https://people.zoho.com/people/api/forms/P_EmployeeView/records';
//     const fetchPeople = await axios.get(peopleUrl, {
//       headers: {
//         'Authorization': `Zoho-oauthtoken ${access_token}`
//       }
//     });
    
//     const serviceManagers = fetchPeople.data
//     .filter(person => person.Title === 'Service Manager')
//     .map(person => `${person['First Name']} ${person['Last Name']}`.trim());
    
//     res.status(200).json({ data: serviceManagers });
//   } catch (err) {
//     console.error("Error in fetchSMList: \n", err);
//     res.status(500).json({success: false, msg: "Internal server error"});
//   }
// }

// Fetch RM Names from Zoho People
const fetchRMList = async (req, res) => {
  try {
    let access_token = req.session.user?.access_token;
    const refresh_token = req.session.user?.refresh_token;

    if (!access_token && !refresh_token) {
      return res.status(401).json({ message: ACCESS_TOKEN_NOT_FOUND });
    }

    const peopleUrl = 'https://people.zoho.com/people/api/forms/P_EmployeeView/records';

    let fetchPeople;
    try {
      fetchPeople = await fetchZohoPeopleData(peopleUrl, access_token);
    } catch (err) {
      // If access_token is expired, generate new from refresh_token if that's available
      if (refresh_token) {
        access_token = await refreshZohoAccessToken(refresh_token);
        req.session.user.access_token = access_token;
        fetchPeople = await fetchZohoPeopleData(peopleUrl, access_token);
      } else {
        throw err;
      }
    }

    // Filter out full names of RMs
    const relationshipManagers = fetchPeople.data
      .filter(person => person.Title?.includes('Relationship Manager'))
      .map(person => `${person['First Name']} ${person['Last Name']}`.trim());

    res.status(200).json({ data: relationshipManagers });
  } catch (err) {
    console.error("Error in fetchRMList: \n", err);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};
  
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

module.exports = {
  loginWithZoho,
  zohoCallback,
  verifySession,
  verifyGoogleUser,
  logout,
  fetchSMList,
  fetchRMList
}
