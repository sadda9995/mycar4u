export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                    <h3 className="text-gray-400 text-sm font-medium">Total Cars</h3>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                    <h3 className="text-gray-400 text-sm font-medium">Active Bookings</h3>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                    <h3 className="text-gray-400 text-sm font-medium">Revenue</h3>
                    <p className="text-3xl font-bold text-white mt-2">₹0</p>
                </div>
            </div>
        </div>
    );
}
