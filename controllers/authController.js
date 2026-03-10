const { User, Mda } = require('../models'); // Changed Organization to Mda
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user (Include Mda model to get the name)
    const user = await User.findOne({ 
      where: { email },
      include: [{ 
        model: Mda, 
        as: 'mda', 
        attributes: ['id', 'name'] 
      }]
    });

    // 2. Validate user and password
    if (!user || !(await user.validPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // 3. Create JWT Payload - ADD THE NAME HERE
    const payload = {
      id: user.id,
      role: user.role, 
      name: user.name,
      mdaId: user.mda_id,
      // Adding this ensures the layout can always show the Ministry name
      mdaName: user.mda ? user.mda.name : "National Planning Authority"
    };

    // 4. Sign Token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    // 5. Configure Cookie Options
    const cookieOptions = {
      expires: new Date(Date.now() + 8 * 60 * 60 * 1000), 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax'
    };

    // 6. Respond
    res.status(200)
      .cookie('npa_token', token, cookieOptions) 
      .json({
        status: 'success',
        user: {
          name: user.name,
          role: user.role,
          mdaName: user.mda ? user.mda.name : "National Planning Authority"
        }
      });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.logout = (req, res) => {
    res.clearCookie('npa_token');
    res.status(200).json({ success: true, message: "Logged out successfully" });
};