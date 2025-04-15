const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true,
        unique:true
    },
    nameAsRM: {type: String, trim: true},
    role: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref:"ROLES"
    },
    mintUsername: { type: String, trim: true },
    insuranceDashboardId: { type: String, trim: true },
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
            doj: { type: Date },
            initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USERS' },
            initiatedAt: { type: Date }
        },
        userFilledInfo: {
            educationalCertificatesAndDegree: {
                tenthMarksheet: { type: String },
                lastEducationFile: { type: String },
                latestUpdateCv: { type: String }
            },
            referenceDetails: {
                reference1Name: { type: String },
                reference1Phone: { type: String },
                relationshipWithReference1: { type: String },
                reference2Name: { type: String },
                reference2Phone: { type: String },
                relationshipWithReference2: { type: String },
                emergencyContactName: { type: String },
                emergencyContactPhone: { type: String },
                relationshipWithEmergencyContact: { type: String }
            },
            bankDetails: {
                beneficiaryName: { type: String },
                accountNumber: { type: String },
                ifscCode: { type: String },
                bankName: { type: String },
                bankVerificationDoc: { type: String }
            },
            personalDetails: {
                firstName: { type: String },
                lastName: { type: String },
                email: { type: String },
                phone: { type: String },
                fatherName: { type: String, default: "" },
                motherName: { type: String, default: "" },
                panNumber: { type: String },
                dob: { type: Date },
                gender: { type: String },
                maritalStatus: { type: String, enum: ["single", "married", "divorced", "widowed"] },
                streetAddress: { type: String, default: "" },
                addressLine2: { type: String, default: "" },
                city: { type: String, default: "" },
                postalZipCode: { type: String, default: "" },
                stateRegionProvince: { type: String },
                country: { type: String },
                photo: { type: String }
            }
        },
        offerLetter: {
            generated: { type: Boolean, default: false },
            generatedAt: { type: Date },
            sentToJoinee: { type: Boolean, default: false }
        },
        backgroundCheck: {
            status: {
                type: String,
                enum: ['pending', 'in_progress', 'verified', 'failed'],
                default: 'pending'
            },
            initiatedAt: { type: Date },
            completedAt: { type: Date },
            reportUrl: { type: String }
        },
        nda: {
            sent: { type: Boolean, default: false },
            sentAt: { type: Date },
            signed: { type: Boolean, default: false },
            signedAt: { type: Date },
            fileUrl: { type: String }
        },
        zohoSetup: {
            userCreated: { type: Boolean, default: false },
            zohoUserId: { type: String },
            email: { type: String },
            assignedAt: { type: Date }
        },
        hasAssestAllocated: { type: Boolean, default: false },
        gotra: {
            sent: { type: Boolean, default: false },
            sentAt: { type: Date }
        }
    },
    status: {
        type: String,
        enum: ['pending', 'onboarding', 'active', 'inactive', 'terminated'],
        default: 'onboarding'
    }
});

const User = mongoose.model("USERS", userSchema);
module.exports = User;
