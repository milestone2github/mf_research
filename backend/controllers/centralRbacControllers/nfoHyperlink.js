
const nfoHyperLink = require('../../models/Nfohyperlink');

const getNfoHyperlinks = async (req, res) => {
    try {
        const nfoLink = await nfoHyperLink.findOne({});
        if (!nfoLink) {
            // If no document exists, create one with default values
            const defaultLink = new nfoHyperLink({
                imageUrl: "Enter the Image URL here",
                redirectUrl: "Enter the Redirect URL here",
            });
            await defaultLink.save();
            return res.status(200).json(defaultLink);
        }
        res.status(200).json(nfoLink);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateNfoHyperlinks = async (req, res) => {
    const { imageUrl, redirectUrl } = req.body; 

    try {
        const nfoLink = await nfoHyperLink.findOne({}); 
        if (!nfoLink) {
            return res.status(404).json({ message: 'Nfo links not found' });
        }
        nfoLink.imageUrl = imageUrl;
        nfoLink.redirectUrl = redirectUrl;
        await nfoLink.save();

        res.status(200).json({ message: 'Image URL and Redirect URL updated successfully', data: nfoLink });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getNfoHyperlinks, updateNfoHyperlinks
}