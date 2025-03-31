const Fds = require("../../models/FixedDiposits");

async function updateFixedDiposits(req, res) {
    try {
      const {
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
          message: 'Fds not found',
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
    console.error('Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fds',
      error: error.message,
    });
  }
}

async function getFixedDepositsBySlug(req, res) {
  try {
    const { slug } = req.params;
    
    const fds = await Fds.find({ slug:slug });
    
    res.status(200).send({
      success: true,
      message: 'fds retrieved successfully',
      data: fds,
    });
  } catch (error) {
    console.error('Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fds',
      error: error.message,
    });
  }
}

module.exports = {getAllFixedDiposits, getFixedDepositsBySlug, updateFixedDiposits};