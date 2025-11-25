const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const dbName = "PLI_Leaderboard";

// Public leaderboard collection
// Override via env if needed: LEADERBOARD_COLLECTION=Public_Leaderboard
const collectionName =
  process.env.LEADERBOARD_COLLECTION || "Public_Leaderboard";

// Your actual field names (hard-coded to avoid env confusion)
const PERIOD_FIELD = "period_month";         // e.g. "2025-04"
const SCORE_FIELD = "total_points_public";   // numeric score
const NAME_FIELD = "rm_name";                // RM / employee name

const pad2 = (n) => String(n).padStart(2, "0");

/**
 * Build list of "YYYY-MM" strings from FY start (1 Apr startYear)
 * up to the selected month (monthYear.y, monthYear.m), inclusive.
 */
const buildFyMonthList = (startYear, monthYear) => {
  const months = [];
  let y = startYear;
  let m = 4; // April

  while (true) {
    if (y > monthYear.y || (y === monthYear.y && m > monthYear.m)) break;
    months.push(`${y}-${pad2(m)}`);
    m += 1;
    if (m === 13) {
      m = 1;
      y += 1;
    }
  }

  return months;
};

exports.getLeaderboard = async (req, res) => {
  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log("Connected directly to leaderboard db");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Quick visibility into collection health
    const totalDocs = await collection.countDocuments({});

    const sampleDocs = await collection
      .find({})
      .project({
        [PERIOD_FIELD]: 1,
        [SCORE_FIELD]: 1,
        [NAME_FIELD]: 1,
        employee_id: 1,
        updated_at: 1,
      })
      .limit(3)
      .toArray();
    
    // --------------------------------------------
    // Determine anchor date from query (uptoMonth) or now
    // uptoMonth is expected as "YYYY-MM"
    // --------------------------------------------
    const { uptoMonth } = req.query || {};
    let anchorDate = null;
    let monthYear = null;

    if (uptoMonth) {
      const [yStr, mStr] = String(uptoMonth).split("-");
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);

      if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
        // Last day of the selected month (for FY math only)
        anchorDate = new Date(y, m, 0, 23, 59, 59, 999);
        monthYear = { y, m };
      } else {
        console.warn(
          "[LB] Invalid uptoMonth query param, falling back to current month.",
          uptoMonth
        );
      }
    }

    // Fallback: current month
    if (!anchorDate) {
      anchorDate = new Date();
      monthYear = {
        y: anchorDate.getFullYear(),
        m: anchorDate.getMonth() + 1,
      };
      console.log(
        "[LB] No valid uptoMonth provided. Defaulting to current month:",
        { y: monthYear.y, m: monthYear.m, anchorDate: anchorDate.toISOString() }
      );
    }

    // --------------------------------------------
    // Determine the Financial Year based on anchorDate
    // FY starts in April (4), ends next March (3)
    // --------------------------------------------
    const anchorYear = anchorDate.getFullYear();
    const anchorMonth = anchorDate.getMonth() + 1;

    const startYear = anchorMonth >= 4 ? anchorYear : anchorYear - 1;
    const endYear = startYear + 1;
    const financialYear = `${startYear}-${endYear}`;

    console.log(
      `Fetching leaderboard for Financial Year: ${financialYear}, upto month: ${monthYear.y}-${monthYear.m}`
    );

    // Build list of FY months (YYYY-MM) from Apr(startYear) to selected month
    const fyMonths = buildFyMonthList(startYear, monthYear);
    const selectedMonthString = `${monthYear.y}-${pad2(monthYear.m)}`;

    // --------------------------------------------
    // 1) FY Data: aggregate from FY start to selected month
    //    based on period_month
    // --------------------------------------------
    const fyDataRaw = await collection
      .aggregate([
        {
          $match: {
            [PERIOD_FIELD]: { $in: fyMonths },
            // is_active: { $ne: false }, // uncomment if you want to skip inactive rows
          },
        },
        {
          $group: {
            _id: "$employee_id",
            employee_name: { $first: `$${NAME_FIELD}` },
            score: { $sum: `$${SCORE_FIELD}` },
            latestDate: { $max: "$updated_at" },
          },
        },
        { $sort: { score: -1 } },
      ])
      .toArray();

    if (fyDataRaw.length) {
      console.log("[LB] Top FY row preview:", {
        employee_id: fyDataRaw[0]._id,
        employee_name: fyDataRaw[0].employee_name,
        score: fyDataRaw[0].score,
      });
    }

    const fyData = fyDataRaw.map((d) => ({
      employee_id: d._id,
      employee_name: d.employee_name,
      score: d.score,
      updated_at: d.latestDate,
    }));

    // --------------------------------------------
    // 2) Monthly Data: aggregate only for selected month
    // --------------------------------------------
    const monthlyDataRaw = await collection
      .aggregate([
        {
          $match: {
            [PERIOD_FIELD]: selectedMonthString,
            // is_active: { $ne: false }, // same optional filter
          },
        },
        {
          $group: {
            _id: "$employee_id",
            employee_name: { $first: `$${NAME_FIELD}` },
            score: { $sum: `$${SCORE_FIELD}` },
            latestDate: { $max: "$updated_at" },
          },
        },
        { $sort: { score: -1 } },
      ])
      .toArray();

    console.log("[LB] Monthly aggregation returned rows:", monthlyDataRaw.length);
    if (monthlyDataRaw.length) {
      console.log("[LB] Top Monthly row preview:", {
        employee_id: monthlyDataRaw[0]._id,
        employee_name: monthlyDataRaw[0].employee_name,
        score: monthlyDataRaw[0].score,
      });
    }

    const monthlyData = monthlyDataRaw.map((d) => ({
      employee_id: d._id,
      employee_name: d.employee_name,
      score: d.score,
      updated_at: d.latestDate,
    }));

    // --------------------------------------------
    // Send both datasets to frontend
    // --------------------------------------------
    res.status(200).json({
      financialYear,
      uptoMonth: selectedMonthString,
      fyData,
      monthlyData,
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed for leaderbord");
    }
  }
};