const VoucherModel = require('../Model/voucherModel');
const { connectToDatabase } = require('../db');

async function generateAndSaveVoucherCode(req, res) {
  try {
    // Connect to the database first
    await connectToDatabase();

    // Generate and save the voucher code
    const voucherCode = await VoucherModel.generateVoucherCode();
    console.log('Generated voucher code:', voucherCode);

    // Send the generated voucher code in the response
    res.json({ voucherCode });
  } catch (error) {
    console.error('Failed to generate and save voucher code:', error);
    res.status(500).json({ error: 'Failed to generate voucher code' });
  }
}

module.exports = {
  generateAndSaveVoucherCode
};
