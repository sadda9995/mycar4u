const mongoose = require('mongoose');
const Car = require('./models/Car');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('Error', err));

const cars = [
    {
        registrationNumber: 'KA-01-AB-1234',
        make: 'Maruti Suzuki',
        model: 'Swift ZXi',
        type: 'Hatchback',
        year: 2024,
        kmsDriven: 12500,
        pricePerHour: 100,
        pricePerDay: 1500,
        fuelType: 'Petrol',
        transmission: 'Manual',
        seats: 5,
        location: { city: 'Bangalore', address: 'Indiranagar' },
        status: 'available',
        dailyKmLimit: 250,
        extraKmCharge: 9,
        lateFeePerHour: 200,
        features: ['Bluetooth', 'Air Conditioning', 'Power Windows', 'ABS', 'Dual Airbags'],
        engine: { capacity: '1197 cc', power: '88 bhp', torque: '113 Nm', fuelTank: '37 Litres' },
        dimensions: { length: '3845 mm', width: '1735 mm', bootSpace: '268 Litres', groundClearance: '163 mm' },
        safety: { airbags: 2, abs: true, ncapRating: 2 }
    },
    {
        registrationNumber: 'KA-05-XY-9876',
        make: 'Hyundai',
        model: 'Creta SX',
        type: 'SUV',
        year: 2023,
        kmsDriven: 24000,
        pricePerHour: 200,
        pricePerDay: 3000,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        seats: 5,
        location: { city: 'Bangalore', address: 'Koramangala' },
        status: 'available',
        dailyKmLimit: 300,
        extraKmCharge: 15,
        lateFeePerHour: 400,
        features: ['Sunroof', 'Touchscreen', 'Reverse Camera', 'Cruise Control', 'Wireless Charging'],
        engine: { capacity: '1493 cc', power: '113 bhp', torque: '250 Nm', fuelTank: '50 Litres' },
        dimensions: { length: '4300 mm', width: '1790 mm', bootSpace: '433 Litres', groundClearance: '190 mm' },
        safety: { airbags: 6, abs: true, ncapRating: 4 }
    },
    {
        registrationNumber: 'KA-53-MN-4567',
        make: 'Honda',
        model: 'City ZX',
        type: 'Sedan',
        year: 2024,
        kmsDriven: 8500,
        pricePerHour: 180,
        pricePerDay: 2500,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seats: 5,
        location: { city: 'Bangalore', address: 'Whitefield' },
        status: 'available',
        dailyKmLimit: 300,
        extraKmCharge: 12,
        lateFeePerHour: 350,
        features: ['Sunroof', 'Alexa Support', 'Rear AC Vents', 'Lane Watch Camera', 'Leather Seats'],
        engine: { capacity: '1498 cc', power: '119 bhp', torque: '145 Nm', fuelTank: '40 Litres' },
        dimensions: { length: '4549 mm', width: '1748 mm', bootSpace: '506 Litres', groundClearance: '165 mm' },
        safety: { airbags: 6, abs: true, ncapRating: 5 }
    },
    {
        registrationNumber: 'KA-03-HA-1122',
        make: 'Mahindra',
        model: 'Thar 4x4',
        type: 'SUV',
        year: 2022,
        kmsDriven: 35000,
        pricePerHour: 250,
        pricePerDay: 4000,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        seats: 4,
        location: { city: 'Bangalore', address: 'JP Nagar' },
        status: 'available',
        dailyKmLimit: 250,
        extraKmCharge: 20,
        lateFeePerHour: 500,
        features: ['4x4', 'Convertible Top', 'Off-road Tires', 'Touchscreen', 'Hill Descent Control'],
        engine: { capacity: '2184 cc', power: '130 bhp', torque: '300 Nm', fuelTank: '57 Litres' },
        dimensions: { length: '3985 mm', width: '1820 mm', bootSpace: 'N/A', groundClearance: '226 mm' },
        safety: { airbags: 2, abs: true, ncapRating: 4 }
    },
    {
        registrationNumber: 'KA-01-EV-0001',
        make: 'Tata',
        model: 'Nexon EV',
        type: 'SUV',
        year: 2024,
        kmsDriven: 5000,
        pricePerHour: 150,
        pricePerDay: 2200,
        fuelType: 'EV',
        transmission: 'Automatic',
        seats: 5,
        location: { city: 'Bangalore', address: 'Electronic City' },
        status: 'available',
        dailyKmLimit: 300,
        extraKmCharge: 10,
        lateFeePerHour: 300,
        features: ['Silent Drive', 'Fast Charging', 'Connected Car Info', 'Sunroof', 'Ventilated Seats'],
        engine: { capacity: '40.5 kWh', power: '141 bhp', torque: '250 Nm', fuelTank: 'EV' },
        dimensions: { length: '3993 mm', width: '1811 mm', bootSpace: '350 Litres', groundClearance: '205 mm' },
        safety: { airbags: 6, abs: true, ncapRating: 5 }
    },
    {
        registrationNumber: 'KA-02-LU-9999',
        make: 'BMW',
        model: '3 Series',
        type: 'Luxury',
        year: 2023,
        kmsDriven: 12000,
        pricePerHour: 500,
        pricePerDay: 8000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seats: 5,
        location: { city: 'Bangalore', address: 'UB City' },
        status: 'available',
        dailyKmLimit: 200,
        extraKmCharge: 50,
        lateFeePerHour: 1000,
        features: ['Leather Seats', 'Harman Kardon Audio', 'Sunroof', 'Gesture Control', 'Park Assistant'],
        engine: { capacity: '1998 cc', power: '255 bhp', torque: '400 Nm', fuelTank: '59 Litres' },
        dimensions: { length: '4709 mm', width: '1827 mm', bootSpace: '480 Litres', groundClearance: '136 mm' },
        safety: { airbags: 8, abs: true, ncapRating: 5 }
    }
];

const seedCars = async () => {
    try {
        await Car.deleteMany({}); // Clear existing cars
        await Car.insertMany(cars);
        console.log('Cars Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedCars();
