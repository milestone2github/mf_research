const { DEFAULT_FRONTEND_URL } = process.env;

function generateOnboardingLink({ name, email, phone, doj, departmentId }) {
  const base = DEFAULT_FRONTEND_URL || 'http://localhost:3000';

  const params = new URLSearchParams({
    ss: false,
    dl: false,
    dj: new Date(doj).toLocaleDateString('en-IN'),
    f: name.split(' ')[0] || '',
    l: name.split(' ')[1] || '',
    dep: departmentId,
    e: email,
    p: phone,
  });

  return `${base}/onboarding-form?${params.toString()}`;
}

module.exports = generateOnboardingLink;
