const { MongoClient } = require("mongodb");

const insuranceUri = process.env.MONGO_URI;
const dbName = "insurance-policy";
let insuranceDb; // global cached instance

// function to create and connect DB instance
async function dbInstanceConnect() {
  try {
    const client = new MongoClient(insuranceUri);
    await client.connect();
    console.log("Connected to insurance-policy DB");
    insuranceDb = client.db(dbName);
  } catch (err) {
    console.error("insurance-policy DB connection failed:", err.message);
  }
}
dbInstanceConnect(); // run once at module load

// ==============================================
// Main handler function
// ==============================================
async function postMessageData(req, res) {
  const waid = req.body.waid;
  if (!waid) {
    return res.status(400).json({ error: 'Missing "waid" in request body' });
  }

  try {
    // Milestone DB from middleware
    const db = req.milestoneDb;
    const mintCollection = db.collection("MintDb");
    const freshCollection = db.collection("FreshClients");

    // Projection for both collections
    const baseProjection = {
      PAN: 1,
      NAME: 1,
      EMAIL: 1,
      "FAMILY HEAD": 1,
      "RELATIONSHIP  MANAGER": 1,
      LANGUAGE: 1,
      USERNAME: 1,
      AUM: 1,
      Marketing1: 1,
      Marketing2: 1,
      MarketingTimeStamp: 1,
      CalcMode: 1,
      CalcType: 1,
      CalcStage: 1,
      Value1: 1,
      Value2: 1,
      Value3: 1,
      Value4: 1,
      Value5: 1,
      Value6: 1,
      Value7: 1,
      CalcTimeStamp: 1,
      _id: 0,
    };

    // Try MintDb first
    let selected = null;
    let mode = "existing";

    const mintDocs = await mintCollection
      .find({ MOBILE: waid }, { projection: baseProjection })
      .toArray();

    if (mintDocs.length > 0) {
      let highestAumDoc = null;
      for (const doc of mintDocs) {
        const aum = parseFloat(doc.AUM) || 0;
        if (doc["FAMILY HEAD"] === doc.NAME && aum > 0) {
          selected = doc;
          break;
        }
        if (!highestAumDoc || aum > (parseFloat(highestAumDoc.AUM) || 0)) {
          highestAumDoc = doc;
        }
      }
      if (!selected) selected = highestAumDoc;
    }

    // Fallback to FreshClients if not found
    if (!selected) {
      const freshDoc = await freshCollection.findOne(
        { MOBILE: waid },
        { projection: baseProjection }
      );
      if (freshDoc) {
        selected = freshDoc;
        mode = "fresh";
      } else {
        const emptyDoc = {
          MOBILE: waid,
          PAN: null,
          NAME: null,
          EMAIL: null,
          "FAMILY HEAD": null,
          "RELATIONSHIP  MANAGER": null,
          LANGUAGE: null,
          USERNAME: null,
          AUM: null,
          Marketing1: null,
          Marketing2: null,
          MarketingTimeStamp: null,
          CalcMode: null,
          CalcType: null,
          CalcStage: null,
          Value1: null,
          Value2: null,
          Value3: null,
          Value4: null,
          Value5: null,
          Value6: null,
          Value7: null,
          CalcTimeStamp: null,
        };
        const { insertedId } = await freshCollection.insertOne(emptyDoc);
        selected = { ...emptyDoc, _id: insertedId };
        mode = "fresh";
      }
    }

    // Fetch NAME and EMAIL using shared insuranceDb instance
    if (!insuranceDb) {
      console.warn("insurance-policy DB not connected yet, reconnecting...");
      await dbInstanceConnect();
    }

    const whatsappCollection = insuranceDb.collection("WhatsappLead");
    const leadDoc = await whatsappCollection.findOne(
      { MOBILE: waid },
      { projection: { NAME: 1, EMAIL: 1 } }
    );

    const NAME = leadDoc ? leadDoc.NAME || null : null;
    const EMAIL = leadDoc ? leadDoc.EMAIL || null : null;

    // Prepare response
    const responseData = {
      pan: selected.PAN || null,
      name: selected.NAME || null,
      email: selected.EMAIL || null,
      relationshipManager: selected["RELATIONSHIP  MANAGER"] || null,
      language: selected.LANGUAGE || null,
      username: selected.USERNAME || null,
      mode,
      marketing1: selected.Marketing1 || null,
      marketing2: selected.Marketing2 || null,
      marketingTimeStamp: selected.MarketingTimeStamp || null,
      NAME,
      EMAIL,
      calcMode: selected.CalcMode || null,
      calcType: selected.CalcType || null,
      calcStage: selected.CalcStage || null,
      values: [
        selected.Value1 || null,
        selected.Value2 || null,
        selected.Value3 || null,
        selected.Value4 || null,
        selected.Value5 || null,
        selected.Value6 || null,
        selected.Value7 || null,
      ],
      calcTimeStamp: selected.CalcTimeStamp || null,
      rmCode: selected["RELATIONSHIP  MANAGER"] || null,
    };

    res.json(responseData);
  } catch (err) {
    console.error("Error in postMessageData:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { postMessageData };
