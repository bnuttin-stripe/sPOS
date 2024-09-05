// Should be deployed to a host like glitch.com or heroku.com

const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());
require("dotenv").config();

const PK = process.env.PK;
const SK = process.env.SK;
const PORT = process.env.PORT;
const stripe = require("stripe")(SK);

// TERMINAL MANAGEMENT --------------------------------------------------------
// Connection token
app.post("/connection_token", async (req, res) => {
  let connectionToken = await stripe.terminal.connectionTokens.create();
  res.json({ secret: connectionToken.secret });
});

// PRODUCTS -------------------------------------------------------------------
app.get("/products", async (req, res) => {
  console.time("products");
  let output = [];
  const products = await stripe.products.list({
      limit: 100,
      expand: ['data.default_price']
    }
  );
  products.data.map(row => {
    if (row.default_price.id) output.push(row);
  })
  console.timeEnd("products")
  res.send(output);
})

// PAYMENTS ------------------------------------------------------------------
app.get("/transactions", async (req, res) => {
  console.time("transactions");
  console.time("transactionsRaw");
  let output = [];
  const paymentIntents = await stripe.paymentIntents.list({
    //query: "status:'succeeded' AND metadata['app'] : 'sPOS'",
    limit: 50,
    expand: ['data.latest_charge']
  });
  console.timeEnd("transactionsRaw");
  paymentIntents.data.map(row => {
    if (row.status == 'succeeded' && row.metadata.app == 'sPOS') output.push(row);
  })
  console.timeEnd("transactions")
  res.send(output);
})

app.get("/transaction/:id", async (req, res) => {
  let output = [];
  const paymentIntent = await stripe.paymentIntents.retrieve(
    req.params.id, 
    {
      expand: ['latest_charge']
    }
  );
  res.send(paymentIntent);
})

// REFUNDS ------------------------------------------------------------------
app.post("/refund", async (req, res) => {
  const refund = await stripe.refunds.create({
    payment_intent: req.body.id,
    expand: ['payment_intent', 'payment_intent.latest_charge']
  });
  res.send(refund.payment_intent);
})

app.get("/", async (req, res) => {
  res.send("Site is up")
});

// Helper function to help manage resources when client app queries for payment intent status
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


app.listen(PORT);
