require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_APP_SK);
const app = express();
app.use(cors());
app.use(express.json());

//new lines are added for production
const path = require("path");

if(process.env.NODE_ENV === "production"){
  app.use(express.static("build"))
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "build", "index.html"))
  })
}

//it ends here

app.get("/",(req,res) =>{
    res.send("Welcome to eShop website")
})

const calculateOrderAmount = (items) => {
  const arr = [];
  items.map((item) => {
    return arr.push((item.cartQuantity * item.price))
  });
  const subtotal = arr.reduce((a, b) => {return a+b},0);

  return (subtotal * 100);
};

app.post("/create-payment-intent", async (req, res) => {
  const { items, shippingAddress, description } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    description,
    shipping: {
      address: {
        line1: shippingAddress.line1,
        line2: shippingAddress.line2,
        city: shippingAddress.city,
        country: shippingAddress.country,
        postal_code: shippingAddress.postal_code,
      },
      name: shippingAddress.name,
      phone: shippingAddress.phone
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

const port =  process.env.PORT || 4242;
app.listen(port, () => console.log("server is running on ", port));
