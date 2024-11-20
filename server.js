const express = require("express");
const session = require('express-session');
const app = express();
app.use(express.json());
// app.use(session({
//   secret: 'abcd',
//   resave: false,
//   saveUninitialized: false
// }))

const cors = require("cors");
app.use(cors());
require("dotenv").config();

const SK = process.env.SK_PLATFORM;
const PORT = process.env.PORT;
const stripe = require("stripe")(SK);

// ACCOUNT LOOKUP AND SESSION SETTING -----------------------------------------------------
// Given a reader's serial number, find the account object associated with it
const getAccountFromSerial = async (serial) => {
  const accounts = await stripe.accounts.list(
    { limit: 100 }
  );
  for (var i = 0; i < accounts.data.length; i++) {
    const readers = await stripe.terminal.readers.list(
      {
        serial_number: serial,
      },
      {
        stripeAccount: accounts.data[i].id
      });
    if (readers.data.length == 1) return accounts.data[i]
  }
  return '';
}

// Connection token - only endpoint for which the app won't send the account ID because it doesn't know it yet
app.post("/connection_token", async (req, res) => {
  const account = await getAccountFromSerial(req.body.serialNumber);
  if (!account.id) return;
  let connectionToken = await stripe.terminal.connectionTokens.create(
    {
      stripeAccount: account.id
    });
  res.json({ secret: connectionToken.secret });
});

app.get("/account/:serial", async (req, res) => {
  const stripeAccount = await getAccountFromSerial(req.params.serial);
  res.send(stripeAccount);
});

// PRODUCTS -------------------------------------------------------------------
app.get("/products/:currency/:productFilter?", async (req, res) => {
  console.log(req.headers);
  let output = [];
  let products = await stripe.products.list(
    {
      limit: 100,
      expand: ['data.default_price']
    },
    {
      stripeAccount: req.headers.account
    }
  );
  // Add only if product filter is met
  if (req.params.productFilter != undefined) {
    products.data = products.data.filter(product => product.metadata.filter == req.params.productFilter)
  }
  // Add the default price
  products.data.map(row => {
    if (row.default_price.id && row.default_price.currency == req.params.currency) output.push(row);
  })
  res.send(output);
})

// CUSTOMERS -----------------------------------------------------------------
app.get("/customers/:ltv/:searchTerm?", async (req, res) => {
  let output = [];
  console.log(req.params.searchTerm)
  const customers = req.params.searchTerm
    ? await stripe.customers.search(
      {
        query: "phone~'" + req.params.searchTerm + "'",
        limit: 100
      },
      {
        stripeAccount: req.headers.account
      }
    )
    : await stripe.customers.list(
      {
        limit: 100
      },
      {
        stripeAccount: req.headers.account
      }
    )

  if (req.params.ltv == 'ltv') {
    // Add LTV
    for (var i = 0; i < customers.data.length; i++) {
      const customer = customers.data[i];
      let ltv = 0;
      const payments = await stripe.paymentIntents.search(
        {
          query: "customer:'" + customer.id + "' AND status:'succeeded'",
          expand: ['data.latest_charge']
        },
        {
          stripeAccount: req.headers.account
        }
      )
      payments.data.map(payment => {
        ltv += payment.latest_charge.amount_captured - payment.latest_charge.amount_refunded
      })
      customer.ltv = ltv
      output.push(customer)
    }
  }
  res.send(customers.data);
})

app.get("/customer/:id", async (req, res) => {
  let output = [];
  const customer = await stripe.customers.retrieve(
    req.params.id,
    {
      stripeAccount: req.headers.account
    });
  // Add LTV
  let ltv = 0;
  const payments = await stripe.paymentIntents.search(
    {
      query: "customer:'" + customer.id + "' AND status:'succeeded'",
      expand: ['data.latest_charge']
    },
    {
      stripeAccount: req.headers.account
    }
  )
  payments.data.map(payment => {
    ltv += payment.latest_charge.amount_captured - payment.latest_charge.amount_refunded
  })
  customer.ltv = ltv
  res.send(customer);
})

app.get("/customers/:phone", async (req, res) => {
  let output = [];
  const customers = await stripe.customers.search(
    {
      query: "phone:'+1" + req.params.phone + "'"
    },
    {
      stripeAccount: req.headers.account
    }
  );
  res.send(customers.data);
})

app.post("/customer", async (req, res) => {
  const customer = await stripe.customers.create(
    {
      name: req.body.firstName + ' ' + req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: {
        line1: req.body.addressLine1,
        line2: req.body.addressLine2,
        city: req.body.city,
        state: req.body.state,
        postal_code: req.body.postalCode,
        country: 'US'
      }
    },
    {
      stripeAccount: req.headers.account
    }
  );
  res.send(customer);
})

// PAYMENTS ------------------------------------------------------------------
app.get("/transactions/:customer?", async (req, res) => {
  let output = [];
  let payload = {
    limit: 50,
    expand: ['data.customer', 'data.latest_charge.payment_method_details']
  }
  if (req.params.customer != undefined) payload.customer = req.params.customer;
  const paymentIntents = await stripe.paymentIntents.list(
    payload,
    {
      stripeAccount: req.headers.account
    });
  paymentIntents.data.map(row => {
    if (row.status == 'succeeded') output.push(row);
    // if (row.status == 'succeeded') output.push(row);
  })
  res.send(output);
})

app.get("/transaction/:id", async (req, res) => {
  let output = [];
  const paymentIntent = await stripe.paymentIntents.retrieve(
    req.params.id,
    {
      expand: ['customer', 'latest_charge']
    },
    {
      stripeAccount: req.headers.account
    }
  );
  res.send(paymentIntent);
})

app.get("/transactionsByFingerprint/:pm", async (req, res) => {
  let output = [];
  const pm = await stripe.paymentMethods.retrieve(req.params.pm);
  // console.log(pm.card_present.fingerprint);
  const charges = await stripe.charges.search(
    {
      query: "payment_method_details.card.fingerprint:'" + pm.card_present.fingerprint + "' AND status:'succeeded'",
      expand: ['data.payment_intent', 'data.payment_intent.latest_charge']
    },
    {
      stripeAccount: req.headers.account
    }
  );
  charges.data.map(row => {
    output.push(row.payment_intent);
  })
  res.send(output);
})

// TRANSACTION ACTIONS ------------------------------------------------------------------
app.post("/refund", async (req, res) => {
  const refund = await stripe.refunds.create(
    {
      payment_intent: req.body.id,
      expand: ['payment_intent', 'payment_intent.latest_charge']
    },
    {
      stripeAccount: req.headers.account
    }
  );
  res.send(refund.payment_intent);
})

app.post("/bopis", async (req, res) => {
  const pi = await stripe.paymentIntents.update(
    req.body.id,
    {
      metadata: {
        bopis: 'done'
      }
    },
    {
      stripeAccount: req.headers.account
    }
  );
  res.send(pi);
})

// TEST
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
