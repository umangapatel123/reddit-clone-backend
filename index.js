const cors = require('cors');
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const { log } = require('console');
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

let subscribers_count = 0;


app.post('/subscription', async (req, res) => {
    try {

        const instance = new Razorpay({
            key_id: "rzp_test_OR8EFbTS6dG5B9",
            key_secret: "mAu7jl8q7LbrFK9rL2HNrZLE",
        });

        let toSend = {};

        const options =req.body;
        console.log(options);
        if (options.plan == 'Monthly') {
            toSend.amount = 10000;
            toSend.currency = 'INR';
            toSend.receipt = 'receipt#' + subscribers_count;
        }
        else if (options.plan == 'Yearly') {
            toSend.amount = 100000;
            toSend.currency = 'INR';
            toSend.receipt = 'receipt#' + subscribers_count;
        }

        const order = await instance.orders.create(toSend);

        console.log(order);

        if (!order) return res.status(500).send('Some error occured');

        // res.json(options);
        res.json(order);

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}
);

app.post('/subscription/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const shasum = crypto.createHmac('sha256', 'mAu7jl8q7LbrFK9rL2HNrZLE');
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);

        const digest = shasum.digest('hex');


        if (digest !== razorpay_signature) return res.status(400).json({ msg: 'Transaction not legit!' });

        res.json({ msg: 'success' });

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


