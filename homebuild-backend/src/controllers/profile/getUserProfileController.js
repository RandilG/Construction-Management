const { User } = require('../../models');

/**
 * @desc Get user profile by email
 * @route GET /api/profile/:email
 * @access Private
 */
const getUserProfile = async (req, res) => {
  try {
    const userEmail = req.params.email;
    
    const user = await User.findOne({
      where: { email: userEmail },
      attributes: ['id', 'name', 'email', 'phone', 'address', 'profileImage']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Server error in getUserProfile:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = getUserProfile;

