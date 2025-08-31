// src/controllers/profile/updateProfileController.js
const { User } = require('../../models');

/**
 * @desc Update user profile
 * @route PUT /api/profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, profileImage } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required to update profile' });
    }
    
    const [updatedRows] = await User.update(
      {
        name,
        phone: phone || null,
        address: address || null,
        profileImage: profileImage || null
      },
      {
        where: { email }
      }
    );
    
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully',
      updatedRows
    });
  } catch (error) {
    console.error('Server error in updateProfile:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = updateProfile;