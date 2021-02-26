import React from "react";
import { Loading, Card, Icon, Tag } from "element-react";
import { Connect } from "aws-amplify-react";
import { graphqlOperation } from "aws-amplify";
import { listMarkets } from "../graphql/queries";
import { onCreateMarket } from "../graphql/subscriptions";
import Error from "../components/Error";
import { Link } from "react-router-dom";

const MarketList = ({ searchResults }) => {
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
        const markets =
          searchResults.length > 0 ? searchResults : data.listMarkets.items;
        return (
          <>
            {searchResults.length > 0 ? (
              <h2 className="text-green">
                <Icon type="success" name="check" className="icon" />
                {searchResults.length}
              </h2>
            ) : (
              <h2 className="header"> Markets</h2>
            )}
            {markets.map((market) => (
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
