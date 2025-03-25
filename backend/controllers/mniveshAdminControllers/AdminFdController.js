const Fds = require("../../models/Fds");

async function UpdateFds(req, res) {
    try {
      const {
        name,
        logo,
        rating,
        roi,
        month_12,
        month_24,
        month_36,
        month_48,
        month_60,
        senior,
        status
      } = req.body;
  
      // Generate slug from name
      const slug = name.toLowerCase().replace(/\s+/g, '-');
  
      const updatedData = {
        name,
        logo,
        rating,
        roi,
        month_12,
        month_24,
        month_36,
        month_48,
        month_60,
        senior,
        status,
        slug,
        updated_at: new Date() // Update the timestamp
      };
  
      const updatedFds = await Fds.findOneAndUpdate(
        { slug },       // Filter: find Fds with the matching slug (derived from name)
        updatedData,    // Data to update
        { new: true }   // Options: return the updated document
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
  
async function GetFdsSearch(req, res) {
  try {
    const searchQuery = req.query.q || "";
    
    const regex = new RegExp(searchQuery, "i");
    
    const fds = await Fds.find({
      name: regex
    });
    
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

module.exports = {GetFdsSearch, UpdateFds};