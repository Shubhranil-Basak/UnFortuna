import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { db } from "../../config/firebase";
import { doc, updateDoc, increment } from "firebase/firestore"; // Firestore functions
import { useAuth } from "../../AuthContext"; // Access user details
import { useNavigate } from "react-router-dom";
import "./AddFunds.css";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
); // Replace with your Stripe test key

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth(); // Get user details from context
  const [paymentStatus, setPaymentStatus] = useState("");
  const [amount, setAmount] = useState(0); // Amount to add
  const navigate = useNavigate(); // For navigation

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setPaymentStatus("Payment failed: " + error.message);
    } else {
      setPaymentStatus("Payment successful!");

      // Update user balance in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        balance: increment(amount), // Increment balance by the payment amount
      });

      // Navigate back to Account page
      setTimeout(() => navigate("/account"), 2000); // Delay to show payment success message
    }
  };

  return (
    <div className="payment-form-container">
      <form onSubmit={handleSubmit} className="payment-form">
        <h3 className="form-title">Add Funds</h3>
        <label htmlFor="amount" className="form-label">
          Enter Amount &nbsp; &nbsp;
          <input
            id="amount"
            type="number"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            min="1"
            required
          />
        </label>
        <div id="card-details" className="card-element-container">
          <CardElement className="card-element" />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            type="submit"
            className="form-button"
            disabled={!stripe || amount <= 0 || amount > 1000}
          >
            Pay {amount} Coins
          </button>

          <button
            type="submit"
            className="form-button"
          >
            <a href="/src/assets/cardinfo.txt" target="_blank" style={{textDecoration: "none", color: "inherit" }}>Fake card info</a>
          </button>
        </div>
        <p className="payment-status">{paymentStatus}</p>
      </form>
    </div>
  );
};

const AddFunds = () => (
  <Elements stripe={stripePromise}>
    <PaymentForm />
  </Elements>
);

export default AddFunds;
