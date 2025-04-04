const Fds = require("../../models/FixedDiposits");
const retryOperation = require("../../utils/retryOpration");

async function createNewFixedDiposits(req, res) {
  try {
    const {
      company,
      rating,
      roi,
      month_12,
      month_24,
      month_36,
      month_48,
      month_60,
      senior
    } = req.body;

    const slug = company.toLowerCase().replace(/(\w)\(/g, '$1-(').replace(/\s+/g, '-').replace(/[()]/g, '').replace(/-+/g, '-');

    const FixedDipositsData = {
      name: company,
      roi,
      logo: req.logo,
      rating,
      month_12,
      month_24,
      month_36,
      month_48,
      month_60,
      senior,
      slug,
      updated_at: new Date() // Update the timestamp
    };

    const createdFds = await Fds.create(FixedDipositsData);

    res.status(200).json({
      success: true,
      message: 'Fds created successfully',
      data: createdFds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to creating fds ${error.message}`
    });
  }
}

async function updateFixedDiposits(req, res) {
  try {
    const {
      company,
      rating,
      roi,
      month_12,
      month_24,
      month_36,
      month_48,
      month_60,
      senior
    } = req.body;

    const { slug } = req.params;

    const updatedData = {
      rating,
      roi,
      month_12,
      month_24,
      month_36,
      month_48,
      month_60,
      senior,
      slug,
      updated_at: new Date() // Update the timestamp
    };
    if (company) {
      updatedData.name = company;
      updatedData.slug = company.toLowerCase().replace(/(\w)\(/g, '$1-(').replace(/\s+/g, '-').replace(/[()]/g, '').replace(/-+/g, '-');
    }

    if (req.logo) {
      updatedData.logo = req.logo;
    }
    const updatedFds = await Fds.findOneAndUpdate(
      { slug },
      updatedData,
      { new: true }
    );

    if (!updatedFds) {
      return res.status(404).json({
        success: false,
        error: 'Fds not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fds updated successfully',
      data: updatedFds,
    });
  } catch (error) {
    console.error('Error updating fds:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update fds',
      error: error.message,
    });
  }
}

async function getAllFixedDiposits(req, res) {
  const searchQuery = req.query.q || "";
  const regex = new RegExp(searchQuery, "i");

  const query = {
    name: regex
  };

  try {
    const fds = await Fds.find(query);

    res.status(200).send({
      success: true,
      message: 'fds retrieved successfully',
      data: fds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to retrieve fds ${error.message}`
    });
  }
}

async function getFixedDepositsBySlug(req, res) {
  try {
    const { slug } = req.params;

    const fds = await Fds.findOne({ slug: slug });

    res.status(200).send({
      success: true,
      message: 'fds retrieved successfully',
      data: fds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to retrieve fds By Slug ${error.message}`
    });
  }
}

async function deleteFixedDiposits(req, res) {
  try {
    const { slug } = req.params;
    const deletedIpos = await Fds.findOneAndDelete({ slug });
    if (!deletedIpos) {
      return res.status(404).json({
        success: false,
        error: 'Fixed Diposits not found',
      });
    }
    const { logo } = deletedIpos;

    if (logo) {
      try {
        await retryOperation(async () => {
          const response = await fetch('https://niveshonline.com/api/fixed-deposits/delete-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageName: logo })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error deleting image: ${errorText}`);
          }
          return response;
        }, 3, 1000); // 3 retries, 1000ms delay
      } catch (imageDeleteError) {
        console.error('Image deletion failed after retries:', imageDeleteError.message);
      }
    }

    res.status(200).send({
      success: true,
      message: 'Fixed Diposits Deleted'
    });
  } catch (error) {
    console.error('Error:', error.message);

    res.status(500).json({
      success: false,
      error: `Failed to Delete Fixed Diposits ${error.message}`
    });
  }
}

module.exports = { getAllFixedDiposits, getFixedDepositsBySlug, updateFixedDiposits, createNewFixedDiposits, deleteFixedDiposits };