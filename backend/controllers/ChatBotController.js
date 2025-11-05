async function postMessageData(req, res) {
  const waid = req.body.waid;
  if (!waid) {
    return res.status(400).json({ error: 'Missing "waid" in request body' });
  }

  try {
    // grab the MongoDB Database instance you attached in middleware
    const db = req.milestoneDb;
    const mintCollection  = db.collection('MintDb');
    const freshCollection = db.collection('FreshClients');

    const projection = {
      PAN: 1,
      NAME: 1,
      'FAMILY HEAD': 1,
      EMAIL: 1,
      'RELATIONSHIP  MANAGER': 1,
      LANGUAGE: 1,
      USERNAME: 1,
      AUM: 1,
      Marketing: 1,
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
      _id: 0
    };

    // 1) Try MintDb
    const docs = await mintCollection.find({ MOBILE: waid }, { projection }).toArray();

    let selected = null;
    let highestAumDoc = null;

    for (const doc of docs) {
      const aum = parseInt(doc.AUM) || 0;
      if (doc['FAMILY HEAD'] === doc.NAME && aum > 0) {
        selected = doc;
        break;
      }
      if (!highestAumDoc || aum > (parseInt(highestAumDoc.AUM) || 0)) {
        highestAumDoc = doc;
      }
    }
    if (!selected) selected = highestAumDoc;

    // 2) Fallback to FreshClients
    let mode = 'existing';
    if (!selected) {
      var freshDoc =  await freshCollection.findOne({ MOBILE: waid }, { projection });
        if (freshDoc) {
            // use the existing fresh record
            selected = freshDoc;
            mode = 'fresh';
        } else {
            // 2) No fresh record: create a new one with null defaults
            const emptyDoc = {
            MOBILE: waid,
            PAN: null,
            NAME: null,
            'FAMILY HEAD': null,
            EMAIL: null,
            'RELATIONSHIP  MANAGER': null,
            LANGUAGE: null,
            USERNAME: null,
            AUM: null,
            Marketing: null,
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
            CalcTimeStamp: null
            };
            const { insertedId } = await freshCollection.insertOne(emptyDoc);
            selected = { ...emptyDoc, _id: insertedId };
            mode = 'fresh';
        }
    }
    // prepare and send response
    const responseData = {
      mode,
      pan: selected.PAN || null,
      name: selected.NAME || null,
      familyHead: selected['FAMILY HEAD'] || null,
      email: selected.EMAIL || null,
      relationshipManager: selected['RELATIONSHIP  MANAGER'] || null,
      language: selected.LANGUAGE || null,
      username: selected.USERNAME || null,
      marketing: selected.Marketing || null,
      marketingTimeStamp: selected.MarketingTimeStamp || null,
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
        selected.Value7 || null
      ],
      calcTimeStamp: selected.CalcTimeStamp || null
    };

    res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { postMessageData };