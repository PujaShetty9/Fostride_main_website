require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testFetchData() {
    const userBins = [{ bin_id: "Bin_001" }];
    const timeRange = "24h";

    let query = supabase
        .from('r3bin_waste_logs')
        .select('updated_at, waste_type, bin_id')
        .order('updated_at', { ascending: true })

    const { data: rawLogsFromDb } = await query
    const rawLogs = rawLogsFromDb;

    const dailyStats = {};
    const today = new Date();

    // Cutoff logic identical to page.tsx
    let cutoffDate = new Date();
    switch (timeRange) {
        case '24h': cutoffDate.setDate(today.getDate() - 1); break;
    }

    rawLogs.forEach((log) => {
        let dateKey = 'Unknown'

        let dateObj = null;
        if (log.updated_at.includes('T')) {
            const d = new Date(log.updated_at)
            if (!isNaN(d.getTime())) dateObj = d
        } else {
            const parts = log.updated_at.split(/[_ ]/)
            const dateParts = parts[0] ? parts[0].split('-') : []
            const timeParts = parts[1] ? parts[1].split('-') : []

            if (dateParts.length >= 3) {
                let year = parseInt(dateParts[0])
                let month = parseInt(dateParts[1])
                let day = parseInt(dateParts[2])

                let hour = 0, min = 0, sec = 0
                if (timeParts.length >= 3) {
                    hour = parseInt(timeParts[0])
                    min = parseInt(timeParts[1])
                    sec = parseInt(timeParts[2])
                }
                if (year < 100) year += 2000
                dateObj = new Date(year, month - 1, day, hour, min, sec)
            }
        }

        if (dateObj) {
            if (timeRange === '24h') {
                const y = dateObj.getFullYear()
                const m = String(dateObj.getMonth() + 1).padStart(2, '0')
                const d = String(dateObj.getDate()).padStart(2, '0')
                const h = String(dateObj.getHours()).padStart(2, '0')
                dateKey = `${y}-${m}-${d} ${h}:00`
            }
        }

        if (dateKey === 'Unknown') return;

        if (!dailyStats[dateKey]) {
            dailyStats[dateKey] = { date: dateKey }
        }
    });

    let trendsData = Object.values(dailyStats).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const filteredTrends = trendsData.filter(d => {
        if (cutoffDate) {
            return new Date({ "date": d.date.replace(' ', 'T') }.date) >= cutoffDate || new Date(d.date) >= cutoffDate
        }
        return true
    })

    console.log("Date samples:");
    console.log("Now:", today.toLocaleString(), "Cutoff:", cutoffDate.toLocaleString());
    let d_date = trendsData[trendsData.length - 1].date;
    console.log("d.date:", d_date);
    console.log("new Date(d.date): ", new Date(d_date).toLocaleString());
}

testFetchData();
