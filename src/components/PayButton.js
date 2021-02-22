import React from "react";
import { Notification, Message } from "element-react";
import StripeCheckout from "react-stripe-checkout";
import { API } from "aws-amplify";

const stripeConfig = {
  currency: "USD",
  publishableAPIKey: "pk_test_TYooMQauvdEDq54NiTphI7jx",
};
const PayButton = ({ user, product }) => {
  const handleCharge = async (token) => {
    try {
      const result = await API.post("orderlambda", "/charge", {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
          },
        },
      });
      console.log({ result });
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <StripeCheckout
      token={handleCharge}
      stripeKey={stripeConfig.publishableAPIKey}
      currency={stripeConfig.currency}
      locale="auto"
      email={user.attributes.email}
      name={product.description}
      description={product.description}
      amount={product.price}
      shippingAddress={product.shipped}
      billingAddress={product.shipped}
      allowRememberMe={false}
    />
  );
};

export default PayButton;
