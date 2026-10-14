const User = require("../models/User");
const config = require("../config/environment");
const { getDatabaseStatus } = require("../config/database");

const seedAdminUser = async () => {
  const dbStatus = getDatabaseStatus();
  if (!dbStatus.connected) {
    return;
  }

  try {
    const adminEmail = config.adminEmail.toLowerCase().trim();
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const newAdmin = new User({
        name: config.adminName,
        email: adminEmail,
        password: config.adminPassword,
        role: "admin",
        isActive: true
      });

      await newAdmin.save();
      console.log(`Admin user successfully seeded: ${adminEmail}`);
    } else if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log(`User role updated to admin: ${adminEmail}`);
    }
  } catch (error) {
    console.error("Admin seeding encountered an error:", error.message);
  }
};

module.exports = { seedAdminUser };
