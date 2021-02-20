import React from "react";
import { Loading, Card, Icon, Tag } from "element-react";
import { Connect } from "aws-amplify-react";
import { graphqlOperation } from "aws-amplify";
import { listMarkets } from "../graphql/queries";
import { onCreateMarket } from "../graphql/subscriptions";
import Error from "../components/Error";
import { Link } from "react-router-dom";

const MarketList = () => {
  const onNewMarket = (prevQuery, newData) => {
    let updateQuery = { ...prevQuery };
    updateQuery.listMarkets.items = [
      newData.onCreateMarket,
      ...prevQuery.listMarkets.items,
    ];
    return updateQuery;
  };
  return (
    <Connect
      subscription={graphqlOperation(onCreateMarket)}
      onSubscriptionMsg={onNewMarket}
      query={graphqlOperation(listMarkets)}
    >
      {({ data, loading, errors }) => {
        if (errors.length > 0) {
          return <Error errors={errors} />;
        }
        console.log("loading =", loading);
        if (loading) {
          return <Loading fullscreen={true} />;
        }

        return (
          <>
            <h2 className="header"> Markets</h2>
            {data.listMarkets.items.map((market) => (
              <div key={market.id} className="my-2">
                <Card
                  bodyStyle={{
                    padding: "0.7em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span className="flex">
                      <Link className="link" to={`/market/${market.id}`}>
                        {market.name}
                      </Link>
                      <span style={{ color: "var(--darkAmazonOrange" }}>
                        {market.products.items && market.products.items.length}
                      </span>
                      <Icon name="shopping cart" />
                      <div
                        className=""
                        style={{ color: "var(--lightSquidInk)" }}
                      >
                        {market.owner}
                      </div>
                    </span>
                  </div>
                  <div>
                    {market.tags &&
                      market.tags.map((tag, i) => (
                        <Tag key={i} type="danger" className="mx-1">
                          {tag}
                        </Tag>
                      ))}
                  </div>
                </Card>
              </div>
            ))}
          </>
        );
      }}
    </Connect>
  );
};

export default MarketList;
