const Fds = require("../../models/FixedDiposits");

async function createNewFixedDiposits(req, res) {
    try {
      const {
        company,
        logo,
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
        logo,
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
          logo,
          rating,
          roi,
          month_12,
          month_24,
          month_36,
          month_48,
          month_60,
          senior
        } = req.body;
    
        const {slug} = req.params;
    
        const updatedData = {
          name: company,
          logo,
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
  try {
    const fds = await Fds.find();
    
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
    
    const fds = await Fds.findOne({ slug:slug });
    
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

async function deleteFixedDiposits(req, res){
    try {
        const { slug } = req.params;
        const deletedIpos = await Fds.findOneAndDelete({ slug });
      if (!deletedIpos) {
        return res.status(404).json({
          success: false,
          error: 'Fixed Diposits not found',
        });
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

module.exports = {getAllFixedDiposits, getFixedDepositsBySlug, updateFixedDiposits, createNewFixedDiposits, deleteFixedDiposits};