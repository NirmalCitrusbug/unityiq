import {Role, Brand, Location, Store, User, Attendance} from "@/models";
import {logger} from "@/config";

// Utility function to create a date in the past
function getPastDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

export async function seedDatabase() {
  try {
    logger.info("Starting database seeding...");

    // Clear existing data
    await Promise.all([
      Role.deleteMany({}),
      Brand.deleteMany({}),
      Location.deleteMany({}),
      Store.deleteMany({}),
      User.deleteMany({}),
      Attendance.deleteMany({}),
    ]);

    // Create roles
    const [adminRole, staffRole] = await Promise.all([
      Role.create({
        name: "Admin",
        permissions: {
          users: {create: true, read: true, update: true, delete: true},
          roles: {create: true, read: true, update: true, delete: true},
          brands: {create: true, read: true, update: true, delete: true},
          locations: {create: true, read: true, update: true, delete: true},
          stores: {create: true, read: true, update: true, delete: true},
        },
      }),
      Role.create({
        name: "Staff",
        permissions: {
          users: {create: false, read: true, update: false, delete: false},
          roles: {create: false, read: true, update: false, delete: false},
          brands: {create: false, read: true, update: false, delete: false},
          locations: {create: false, read: true, update: false, delete: false},
          stores: {create: false, read: true, update: false, delete: false},
        },
      }),
    ]);
    logger.info("Roles created successfully");

    // Create brands
    const [nikeBrand, adidasBrand] = await Promise.all([
      Brand.create({name: "Nike"}),
      Brand.create({name: "Adidas"}),
    ]);
    logger.info("Brands created successfully");

    // Create locations
    const [nycLocation, laLocation] = await Promise.all([
      Location.create({
        name: "Downtown Mall",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        country: "USA",
        postalCode: "10001",
      }),
      Location.create({
        name: "City Center",
        address: "456 Market Street",
        city: "Los Angeles",
        state: "CA",
        country: "USA",
        postalCode: "90012",
      }),
    ]);
    logger.info("Locations created successfully");

    // Create stores with geolocation
    const [nikeStore, adidasStore] = await Promise.all([
      Store.create({
        brandId: nikeBrand._id,
        locationId: nycLocation._id,
        location: {
          type: "Point",
          coordinates: [-73.935242, 40.73061], // NYC coordinates
        },
        geofenceRadius: 100, // 100 meters
        isActive: true,
      }),
      Store.create({
        brandId: adidasBrand._id,
        locationId: laLocation._id,
        location: {
          type: "Point",
          coordinates: [-118.243683, 34.052235], // LA coordinates
        },
        geofenceRadius: 150, // 150 meters
        isActive: true,
      }),
    ]);
    logger.info("Stores created successfully");

    // Create users
    await Promise.all([
      User.create({
        firstName: "John",
        lastName: "Doe",
        email: "admin@example.com",
        pin: "1234",
        roleId: adminRole._id,
        storeIds: [], // Will be automatically populated for admin by the middleware
        isActive: true,
      }),
      User.create({
        firstName: "Jane",
        lastName: "Smith",
        email: "staff@example.com",
        pin: "2345",
        roleId: staffRole._id,
        storeIds: [adidasStore._id], // Staff needs explicit store assignment
        isActive: true,
      }),
    ]);
    logger.info("Users created successfully");

    // Create sample attendance records for the staff user
    const staffUser = await User.findOne({email: "staff@example.com"});
    if (staffUser) {
      // Create completed attendance records for the past week
      await Promise.all([
        // Day 1 - Regular day
        Attendance.create({
          userId: staffUser._id,
          storeId: adidasStore._id,
          clockIn: {
            time: new Date(getPastDate(7).setHours(9, 0, 0)),
            location: {
              type: "Point",
              coordinates: [-118.243683, 34.052235],
            },
          },
          clockOut: {
            time: new Date(getPastDate(7).setHours(17, 0, 0)),
            location: {
              type: "Point",
              coordinates: [-118.243683, 34.052235],
            },
          },
          status: "COMPLETED",
          isWithinGeofence: true,
        }),
        // Day 2 - Late arrival
        Attendance.create({
          userId: staffUser._id,
          storeId: adidasStore._id,
          clockIn: {
            time: new Date(getPastDate(6).setHours(9, 30, 0)),
            location: {
              type: "Point",
              coordinates: [-118.24369, 34.05224],
            },
          },
          clockOut: {
            time: new Date(getPastDate(6).setHours(17, 15, 0)),
            location: {
              type: "Point",
              coordinates: [-118.243685, 34.052238],
            },
          },
          status: "COMPLETED",
          isWithinGeofence: true,
        }),
        // Day 3 - Early departure
        Attendance.create({
          userId: staffUser._id,
          storeId: adidasStore._id,
          clockIn: {
            time: new Date(getPastDate(5).setHours(9, 0, 0)),
            location: {
              type: "Point",
              coordinates: [-118.24368, 34.05223],
            },
          },
          clockOut: {
            time: new Date(getPastDate(5).setHours(16, 30, 0)),
            location: {
              type: "Point",
              coordinates: [-118.243675, 34.052233],
            },
          },
          status: "COMPLETED",
          isWithinGeofence: true,
        }),
        // Day 4 - Outside geofence
        Attendance.create({
          userId: staffUser._id,
          storeId: adidasStore._id,
          clockIn: {
            time: new Date(getPastDate(4).setHours(9, 0, 0)),
            location: {
              type: "Point",
              coordinates: [-118.244683, 34.053235], // Slightly outside geofence
            },
          },
          clockOut: {
            time: new Date(getPastDate(4).setHours(17, 0, 0)),
            location: {
              type: "Point",
              coordinates: [-118.24468, 34.05323], // Slightly outside geofence
            },
          },
          status: "COMPLETED",
          isWithinGeofence: false,
        }),
      ]);
      logger.info("Sample attendance records created successfully");
    }

    logger.info("Database seeding completed successfully");
  } catch (error) {
    logger.error({error}, "Error seeding database");
    throw error;
  }
}
