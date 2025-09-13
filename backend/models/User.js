//schema for adding users and assigning roles to them 
const mongoose = require("mongoose");
// const { connectToMniveshDB } = require("../dbConfig/connection")
// const mniveshDbConnection = connectToMniveshDB();
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true,
        unique: true
    },
    name: { type: String, trim: true },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DEPARTMENTS",
        required: false
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        require: false,
        ref: "ROLES"
    },
    customRole: { type: String, trim: true },
    mintUsername: { type: String, trim: true },
    insuranceDashboardID: { type: String, trim: true },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "PERMISSIONS"
    }],
    internalDashboardRole: {
        type: String,
        enum: ["Admin", "Super Admin", ""],
        default: ""
    }, lastSyncedWithZoho: {
        type: Date,
        default: Date.now
    },
    folderId: { type: String, trim: true },
    onboarding: {
        hrFilledInfo: {
            name: { type: String },
            personalEmail: { type: String },
            phone: { type: String },
            baseSalary: { type: Number },
            annualCtc: { type: Number },
            department: { type: String },
            role: { type: String },
            isPfApplicable: { type: Boolean },
            isExperienced: { type: Boolean, default: false },
            doj: { type: Date },
            city: { type: String },
            reportingLocation: { type: String },
            gender: { type: String, enum: ['male', 'female'] },
            initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USERS' },
            initiatedAt: { type: Date }
        },
        userFilledInfo: {
            educationalCertificatesAndDegree: {
                tenthMarksheet: { type: String, default: "" },
                lastEducationFile: { type: String, default: "" },
                latestUpdateCv: { type: String, default: "" }
            },
            referenceDetails: {
                reference1Name: { type: String, default: "" },
                reference1Phone: { type: String, default: "" },
                relationshipWithReference1: { type: String, default: "" },
                reference2Name: { type: String, default: "" },
                reference2Phone: { type: String, default: "" },
                relationshipWithReference2: { type: String, default: "" },
                emergencyContactName: { type: String, default: "" },
                emergencyContactPhone: { type: String, default: "" },
                relationshipWithEmergencyContact: { type: String, default: "" }
            },
            bankDetails: {
                beneficiaryName: { type: String, default: "" },
                accountNumber: { type: String, default: "" },
                ifscCode: { type: String, default: "" },
                bankName: { type: String, default: "" },
                bankVerificationDoc: { type: String, default: "" }
            },
            personalDetails: {
                firstName: { type: String, default: "" },
                lastName: { type: String, default: "" },
                email: { type: String, default: "" },
                phone: { type: String, default: "" },
                fatherName: { type: String, default: "" },
                motherName: { type: String, default: "" },
                panNumber: { type: String, default: "" },
                dob: { type: Date, default: "" },
                gender: { type: String, default: "" },
                maritalStatus: { type: String, enum: ["single", "married", "divorced", "widowed", ""], default: "" },
                streetAddress: { type: String, default: "" },
                addressLine2: { type: String, default: "" },
                city: { type: String, default: "" },
                postalZipCode: { type: String, default: "" },
                stateRegionProvince: { type: String, default: "" },
                country: { type: String, default: "" },
                photo: { type: String, default: "" }
            },
            submittedAt: Date
        },
        offerLetter: {
            generated: { type: Boolean, default: false },
            generatedAt: { type: Date },
            sentToJoinee: { type: Boolean, default: false }
        },
        backgroundCheck: {
            status: {
                type: String,
                enum: ['pending', 'in_progress', 'verified', 'failed', 'skipped'],
                default: 'pending'
            },
            initiatedAt: { type: Date },
            completedAt: { type: Date },
            reportUrl: { type: String }
        },
        nda: {
            urlGenerated: { type: Boolean, default: false }, //sent
            urlGeneratedAt: { type: Date }, //sentAt
            signedStatus: {
                type: String,
                enum: ['success', 'completed', 'declined', 'later', ''],
                default: ''
            },
            signed: { type: Boolean, default: false },
            signedAt: { type: Date },
            fileUrl: { type: String },
            requestId: { type: String }
        },
        zohoSetup: {
            userCreated: { type: Boolean, default: false },
            zohoEmployeeId: { type: String },
            email: { type: String },
            assignedAt: { type: Date }
        },
        hasAssestAllocated: { type: Boolean, default: false },
        gotra: {
            sent: { type: Boolean, default: false },
            sentAt: { type: Date }
        },
        hasNotifiedToAll: { type: Boolean, default: false }
    },
    status: {
        type: String,
        enum: ['pending', 'onboarding', 'active', 'inactive', 'terminated'],
        default: 'onboarding'
    },
    assets: [
        {
            asset: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Asset'
            },
            allocatedAt: { type: Date, default: Date.now },
            returnedAt: { type: Date },
            status: {
                type: String,
                enum: ['allocated', 'returned', 'lost', 'replaced'],
                default: 'allocated'
            }
        }
    ]
});

const User = mongoose.model("USERS", userSchema);
module.exports = User;
