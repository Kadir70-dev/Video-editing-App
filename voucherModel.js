const { getDatabase, connectToDatabase } = require('../db');

class VoucherModel {
  static async generateVoucherCode() {
    // Generate a random alphanumeric voucher code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = 8;
    let voucherCode = '';
    for (let i = 0; i < codeLength; i++) {
      voucherCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    try {
      // Connect to the database
      await connectToDatabase();
      const db = await getDatabase();
      const vouchersCollection = db.collection('vouchers');

      // Save the generated voucher code to the database
      await vouchersCollection.insertOne({ code: voucherCode, used: false });

      console.log('Voucher code added to database:', voucherCode);

      return voucherCode;
    } catch (error) {
      console.error('Failed to generate and save voucher code:', error);
      throw error;
    }
  }

  static async checkVoucherCode(voucherCode) {
    try {
      // Connect to the database
      await connectToDatabase();
      const db = await getDatabase();
      const vouchersCollection = db.collection('vouchers');
      const voucher = await vouchersCollection.findOne({ code: voucherCode });
      return voucher && !voucher.used;
    } catch (error) {
      console.error('Failed to check voucher code:', error);
      throw error;
    }
  }

  static async markVoucherAsUsed(voucherCode) {
    try {
      // Connect to the database
      await connectToDatabase();
      const db = await getDatabase();
      const vouchersCollection = db.collection('vouchers');
      await vouchersCollection.updateOne({ code: voucherCode }, { $set: { used: true } });
    } catch (error) {
      console.error('Failed to mark voucher as used:', error);
      throw error;
    }
  }
}

module.exports = VoucherModel;
