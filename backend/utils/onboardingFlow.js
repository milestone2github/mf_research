const User = require('../models/User');
const { newEmployeeSetup } = require('../controllers/onboardingControllers/zohoEmployeeSetUp');
const { sendGotraDocument } = require('../controllers/onboardingControllers/newJoineeDetailsControllers');
const { sentNewJoineeMailNotification } = require('../controllers/onboardingControllers/newJoineeDetailsControllers');

async function triggerOnboardingFlow(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found for onboarding flow');
  }

  // ----------  ZOHO SETUP ----------
  const zohoStatus = user.onboarding?.zohoSetup?.status || 'pending';

  if (zohoStatus === 'pending' || zohoStatus === 'failed') {
    try {
      await newEmployeeSetup(userId);
    } catch (err) {
      // Zoho failure stops the chain
      return;
    }
  }

  // Reload user after Zoho
  const updatedUser = await User.findById(userId);

  if (updatedUser.onboarding.zohoSetup.status !== 'completed') {
    return; // hard stop
  }

  // ----------  GOTRA ----------
  updatedUser.onboarding.gotra = updatedUser.onboarding.gotra || { status: 'pending' };

  if (updatedUser.onboarding.gotra.status === 'pending') {
    try {
      await sendGotraDocument(updatedUser);
      updatedUser.onboarding.gotra.status = 'completed';
      updatedUser.onboarding.gotra.sentAt = new Date();
      updatedUser.onboarding.gotra.error = null;
    } catch (err) {
      updatedUser.onboarding.gotra.status = 'failed';
      updatedUser.onboarding.gotra.error = err.message;
      await updatedUser.save();
      return;
    }
  }

  // ---------- NOTIFY ----------
  updatedUser.onboarding.hasNotifiedToAll =
    updatedUser.onboarding.hasNotifiedToAll || { status: 'pending' };

  if (updatedUser.onboarding.hasNotifiedToAll.status === 'pending') {
    try {
      await sentNewJoineeMailNotification(updatedUser);
      updatedUser.onboarding.hasNotifiedToAll.status = 'completed';
      updatedUser.onboarding.hasNotifiedToAll.sentAt = new Date();
      updatedUser.onboarding.hasNotifiedToAll.error = null;
    } catch (err) {
      updatedUser.onboarding.hasNotifiedToAll.status = 'failed';
      updatedUser.onboarding.hasNotifiedToAll.error = err.message;
    }
  }

  await updatedUser.save();
}

module.exports = { triggerOnboardingFlow };
