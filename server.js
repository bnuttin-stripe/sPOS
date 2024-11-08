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
  let output = [];
  const products = await stripe.products.list({
      limit: 100,
      expand: ['data.default_price']
    }
  );
  products.data.map(row => {
    if (row.default_price.id && row.default_price.currency == 'usd') output.push(row);
  })
  res.send(output);
})

app.get("/products/:currency/:productFilter?", async (req, res) => {
  let output = [];
  let products = await stripe.products.list({
      limit: 100,
      expand: ['data.default_price']
    }
  );
  // Add only if product filter is met
  if (req.params.productFilter != undefined){
    products.data = products.data.filter(product => product.metadata.filter == req.params.productFilter)
  }
  // Add the default price
  products.data.map(row => {
    if (row.default_price.id && row.default_price.currency == req.params.currency) output.push(row);
  })
  res.send(output);
})

// CUSTOMERS -----------------------------------------------------------------
app.get("/customers", async (req, res) => {
  let output = [];
  const customers = await stripe.customers.list({
      limit: 100,
    }
  );
  // Add LTV
  for (var i = 0; i<customers.data.length; i++){
    const customer = customers.data[i];
    let ltv = 0;
    const payments = await stripe.paymentIntents.search({
      query: "customer:'" + customer.id + "' AND status:'succeeded'",
      expand: ['data.latest_charge']
    })
    payments.data.map(payment => {
      ltv += payment.latest_charge.amount_captured - payment.latest_charge.amount_refunded
    })
    customer.ltv = ltv
    output.push(customer)
  }
  res.send(customers.data);
})

app.get("/customer/:id", async (req, res) => {
  let output = [];
  const customer = await stripe.customers.retrieve(req.params.id);
  // Add LTV
  let ltv = 0;
  const payments = await stripe.paymentIntents.search({
    query: "customer:'" + customer.id + "' AND status:'succeeded'",
    expand: ['data.latest_charge']
  })
  payments.data.map(payment => {
    ltv += payment.latest_charge.amount_captured - payment.latest_charge.amount_refunded
  })
  customer.ltv = ltv
  res.send(customer);
})

app.post("/customer", async (req, res) => {
  const customer = await stripe.customers.create({
      name: req.body.firstName + ' ' + req.body.lastName,
      email: req.body.email,
      address: {
        line1: req.body.addressLine1,
        line2: req.body.addressLine2,
        city: req.body.city,
        state: req.body.state,
        postal_code: req.body.postalCode,
        country: 'US'
      }
    });
  res.send(customer);
})

// PAYMENTS ------------------------------------------------------------------
app.get("/transactions/:customer?", async (req, res) => {
   let output = [];
  let payload = {
    limit: 50, 
    expand: ['data.latest_charge.payment_method_details']
  }
  if (req.params.customer != undefined) payload.customer = req.params.customer;
  const paymentIntents = await stripe.paymentIntents.list(payload);
  paymentIntents.data.map(row => {
    if (row.status == 'succeeded' && row.metadata.app == 'sPOS') output.push(row);
    // if (row.status == 'succeeded') output.push(row);
  })
  res.send(output);
})

app.get("/transaction/:id", async (req, res) => {
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
