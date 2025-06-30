const axios = require('axios');
require('dotenv').config();

async function generateOfferLetterFromZohoTemplate({ name, role, doj, department, baseSalary, annualCtc }) {
  const accessToken = await getRefreshedAccessToken(); // implement refresh if needed

  const templateId = process.env.ZOHO_WRITER_TEMPLATE_ID;

  const response = await axios.post(
    `https://writer.zoho.${process.env.ZOHO_REGION}/writer/api/v1/templates/${templateId}/merge`,
    {
      merge: {
        data: {
          employee_name: name,
          designation: role,
          doj,
          department,
          ctc: annualCtc,
          base_salary: baseSalary,
        },
        output_format: "pdf",
        document_info: {
          document_name: `OfferLetter_${name.replace(/\s/g, '')}`
        }
      }
    },
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  // Download the document using returned doc ID
  const documentId = response.data.document_id;
  const fileRes = await axios.get(`https://writer.zoho.${process.env.ZOHO_REGION}/writer/api/v1/documents/${documentId}/download/pdf`, {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`
    },
    responseType: 'arraybuffer'
  });

  return fileRes.data; // This is your PDF buffer
}

module.exports = { generateOfferLetterFromZohoTemplate };
