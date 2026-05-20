const db = require("./firebase");

async function test() {

  try {

    await db.collection("test")
      .doc("hello")
      .set({
        message: "Firestore connected!"
      });

    console.log("SUCCESS: Firestore connected!");

  } catch (e) {

    console.log("ERROR:", e);

  }

}

test();
