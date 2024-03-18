const VoucherModel = require('../Model/voucherModel');
const { connectToDatabase } = require('../db');
const userModel = require('../Model/userModel');

async function signUp(req, res) {
  const { username, email, password, voucherCode } = req.body;

  try {
   
    console.log('Received password:', password);

    // Check if the voucher code exists in the database and is not used
    const voucherExists = await VoucherModel.checkVoucherCode(voucherCode);

    if (!voucherExists) {
      return res.status(400).json({ error: 'Invalid voucher code' });
    }

    // Connect to the database
    await connectToDatabase();

    // Generate and save the voucher code
    await VoucherModel.markVoucherAsUsed(voucherCode);

    // Add user to database
    await userModel.addUser(username, email, password);

    res.json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Failed to sign up user:', error);
    res.status(500).json({ error: 'Failed to sign up user' });
  }
}

module.exports = {
  signUp
};
