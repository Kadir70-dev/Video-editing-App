const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');


async function addUser(username, email, password) {
    const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
  
    try {
      await client.connect();
      const db = client.db('mydatabase');
      const usersCollection = db.collection('users');
  
      // Check if the username or email already exists
      const existingUser = await usersCollection.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        throw new Error('Username or email already exists');
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
  
      // Insert new user with hashed password
      await usersCollection.insertOne({ username, email, password: hashedPassword });
  
      console.log('User added successfully');
    } catch (error) {
      console.error('Failed to add user:', error);
      throw error; // Rethrow the error to propagate it to the caller
    } finally {
      await client.close();
    }
  }
async function checkVoucherCode(voucherCode) {
  const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('mydatabase');
    const vouchersCollection = db.collection('vouchers');

    // Check if the voucher code exists in the database
    const voucher = await vouchersCollection.findOne({ code: voucherCode });

    return !!voucher; // Return true if voucher exists, false otherwise
  } catch (error) {
    console.error('Failed to check voucher code:', error);
    throw error; // Rethrow the error to propagate it to the caller
  } finally {
    await client.close();
  }
}

async function loginUser(usernameOrEmail, password) {
    const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
  
    try {
        await client.connect();
        const db = client.db('mydatabase');
        const usersCollection = db.collection('users');
        console.log('Username or Email:', usernameOrEmail);


        // Check if the username or email exists
        const user = await usersCollection.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
        console.log('User:', user);

        if (!user) {
            throw new Error('Invalid username/email or password');
        }

        // Compare hashed passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password Match:', passwordMatch);

        if (!passwordMatch) {
            throw new Error('Invalid username/email or password');
        }
  
        console.log('User logged in successfully');
        return user;
    } catch (error) {
        console.error('Failed to login user:', error);
        throw error; // Rethrow the error to propagate it to the caller
    } finally {
        await client.close();
    }
}

module.exports = {
  addUser,
  checkVoucherCode,
  loginUser
};
