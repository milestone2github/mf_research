const IposModel = require("../../models/Ipos");

async function createIpos(req, res) {
    try {
      const {
        company,
        open_date,
        close_date,
        lot_size,
        price,
        type,
        face_value,
        market_lot,
        minimum_order_quantity,
        listing_at,
        issue_size,
        allotment_date,
        initiation_refund,
        demat_account,
        listing_date,
        min_lot,
        max_lot,
        min_share,
        max_share,
        min_amount,
        max_amount
      } = req.body;
  
      const generatedSlug = company
      .toLowerCase()
      .replace(/(\w)\(/g, '$1-(')
      .replace(/\s+/g, '-')
      .replace(/[()]/g, '')
      .replace(/-+/g, '-');
    ;
  
      const ipoData = {
        company,
        slug: generatedSlug,
        open_date,
        close_date,
        lot_size,
        price,
        type,
        face_value,
        market_lot,
        minimum_order_quantity,
        listing_at,
        issue_size,
        allotment_date,
        initiation_refund,
        demat_account,
        listing_date,
        min_lot,
        max_lot,
        min_share,
        max_share,
        min_amount,
        max_amount,
        status: 1,
        updated_at: new Date() // Update the timestamp
      };
  
      const createdIpos = await IposModel.create(ipoData);
  
      res.status(200).json({
        success: true,
        message: 'Ipos created successfully',
        data: createdIpos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to create Ipos: ${error.message}`
      });
    }
  }
  
  async function updateIpos(req, res) {
      try {
        const {
          open_date,
          close_date,
          lot_size,
          price,
          type,
          face_value,
          market_lot,
          minimum_order_quantity,
          listing_at,
          issue_size,
          allotment_date,
          initiation_refund,
          demat_account,
          listing_date,
          min_lot,
          max_lot,
          min_share,
          max_share,
          min_amount,
          max_amount
        } = req.body;
    
        const { slug } = req.params; 
    
        const ipoData = {
          slug: slug,
          open_date,
          close_date,
          lot_size,
          price,
          type,
          face_value,
          market_lot,
          minimum_order_quantity,
          listing_at,
          issue_size,
          allotment_date,
          initiation_refund,
          demat_account,
          listing_date,
          min_lot,
          max_lot,
          min_share,
          max_share,
          min_amount,
          max_amount,
          status: 1,
          updated_at: new Date() // Update the timestamp
        };
        const update_Ipos = await IposModel.findOneAndUpdate(
          { slug },      
          ipoData,
          { new: true }   
        ); 
        if (!update_Ipos) {
          return res.status(404).json({
            success: false,
            error: 'Ipos not found',
          });
        }
    
        res.status(200).json({
          success: true,
          message: 'Ipos updated successfully',
          data: update_Ipos,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: `Failed to update Ipos ${error.message}`,
        });
      }
    }
  
async function getIpos(req, res) {
  try {
    const Ipos = await IposModel.find();
    
    res.status(200).send({
      success: true,
      message: 'Ipos retrieved successfully',
      data: Ipos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to retrieve Ipos By Slug ${error.message}`, 
    });
  }
}

async function getIposBySlug(req, res) {
  try {
    const { slug } = req.params;
    
    const Ipos = await IposModel.findOne({ slug });
    
    if (!Ipos) {
        return res.status(404).json({
          success: false,
          error: 'IPO not found',
        });
      }
    
    res.status(200).json({
      success: true,
      message: 'Ipos retrieved successfully',
      data: Ipos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to retrieve Ipos ${error.message}`
    });
  }
}

async function deleteIpos(req, res){
    try {
        const { slug } = req.params;
        const deletedIpos = await IposModel.findOneAndDelete({ slug });

      
      if (!deletedIpos) {
        return res.status(404).json({
          success: false,
          error: 'IPO not found',
        });
      }

      res.status(200).send({
        success: true,
        message: 'Ipos Deleted'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to Delete Ipos ${error.message}`
      });
    }
}

  
module.exports = {getIpos, getIposBySlug, createIpos, deleteIpos, updateIpos};