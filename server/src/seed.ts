import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User';
import Target from './models/Target';
import Inventory from './models/Inventory';

const SUB_ASSEMBLY_PARTS = [
  "Hood", "RH FR DR", "LH FR DR", "RH RR DR", "LH RR DR",
  "Back DR", "Fender", "Radiator", "Apron", "Dash",
  "Full Cowl", "Cowl Top", "Wheel House", "SM Small"
];

const UNIT_PARTS = [
  "FSM", "CB", "FT", "Bumper Punching", "All Model", "Laser Cutting"
];

const ETIOS_PARTS = [
  "Hood", "RH FR DR", "LH FR DR", "RH RR DR", "LH RR DR",
  "Back DR", "Fender", "Radiator", "Apron", "Dash",
  "Full Cowl", "Cowl Top", "Wheel House", "SM Small"
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pmsp';
  console.log(`Connecting to ${uri}...`);
  await mongoose.connect(uri);
  console.log('Connected.');

  // 1. Clear existing collections
  console.log('Clearing existing collections...');
  await User.deleteMany({});
  
  try {
    await Target.collection.drop();
  } catch (e) {
    // collection might not exist yet
  }
  
  try {
    await Inventory.collection.drop();
  } catch (e) {
    // collection might not exist yet
  }

  // 2. Seed Users
  console.log('Creating users...');
  const users = [
    { employeeId: 'admin1', name: 'System Administrator', password: 'admin123', role: 'Admin' },
    { employeeId: 'manager1', name: 'Plant Manager', password: 'manager123', role: 'Manager' },
    { employeeId: 'leader1', name: 'Shift Team Leader', password: 'leader123', role: 'Team Leader' },
    { employeeId: 'operator1', name: 'Assembly Operator', password: 'operator123', role: 'Operator' }
  ];

  for (const u of users) {
    const user = await User.create(u);
    console.log(`   Created user: ${user.name} (${user.role})`);
  }

  // 3. Seed Targets (for DAY and NIGHT shifts)
  console.log('Creating production targets...');
  const shifts = ['DAY', 'NIGHT'] as const;

  // SubAssembly Targets
  for (const shift of shifts) {
    for (const part of SUB_ASSEMBLY_PARTS) {
      await Target.create({
        partName: part,
        lineType: 'SubAssembly',
        targetQty: shift === 'DAY' ? 120 : 100,
        shift
      });
    }
  }

  // UnitParts Targets
  for (const shift of shifts) {
    for (const part of UNIT_PARTS) {
      await Target.create({
        partName: part,
        lineType: 'UnitParts',
        targetQty: shift === 'DAY' ? 200 : 180,
        shift
      });
    }
  }

  // Etios Targets
  for (const shift of shifts) {
    for (const part of ETIOS_PARTS) {
      await Target.create({
        partName: part,
        lineType: 'Etios',
        targetQty: shift === 'DAY' ? 80 : 70,
        shift
      });
    }
  }
  console.log(`   Seeded targets for DAY/NIGHT shifts.`);

  // 4. Seed Inventory Stock levels
  console.log('Creating initial inventory stock...');
  for (const part of SUB_ASSEMBLY_PARTS) {
    await Inventory.create({
      partName: part,
      lineType: 'SubAssembly',
      currentStock: Math.floor(Math.random() * 200) + 20, // 20 to 220
      minThreshold: 45
    });
  }

  for (const part of UNIT_PARTS) {
    await Inventory.create({
      partName: part,
      lineType: 'UnitParts',
      currentStock: Math.floor(Math.random() * 400) + 50,
      minThreshold: 80
    });
  }

  for (const part of ETIOS_PARTS) {
    await Inventory.create({
      partName: part,
      lineType: 'Etios',
      currentStock: Math.floor(Math.random() * 150) + 15,
      minThreshold: 30
    });
  }
  console.log(`   Seeded component inventories.`);

  console.log('✅ Seed complete successfully.');
  await mongoose.disconnect();
  console.log('Disconnected.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
