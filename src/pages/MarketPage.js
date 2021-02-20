import React from "react";
import { Loading, Tabs, Icon } from "element-react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { getMarket } from "../graphql/queries";
import Error from "../components/Error";
import { Link } from "react-router-dom";
import Product from "../components/Product";
import NewProduct from "../components/NewProduct";

class MarketPage extends React.Component {
  state = {
    isLoading: true,
    market: null,
    isOwner: false,
  };
  componentDidMount = async () => {
    try {
      const input = {
        id: this.props.marketId,
      };
      const result = await API.graphql(graphqlOperation(getMarket, input));
      console.log(result);
      this.setState({ market: result.data.getMarket, isLoading: false }, () =>
        this.checkOwner()
      );
    } catch (err) {
      console.error("Error in loading market ", err);
      return <Error errors={err} />;
    }
  };
  checkOwner = async () => {
    //const loginUser = await Auth.currentAuthenticatedUser();
    const loginUser = this.props.user;
    console.log("loginUser = ", loginUser);
    if (loginUser.username === this.state.market.owner) {
      this.setState({ isOwner: true });
    } else {
      this.setState({ isOwner: false });
    }
  };
  render() {
    return this.state.isLoading ? (
      <Loading fullscreen={true} />
    ) : (
      <>
        <Link className="link" to="/">
          Back to Market List
        </Link>
        <span className="items-center pt-2">
          <h2 className="mb-mr">{this.state.market.name}</h2> -{" "}
          {this.state.market.owner}
        </span>
        <div className="items-center pt-2">
          <span style={{ color: "var(--lightSquidInk)", paddingBottom: "1em" }}>
            <Icon name="date" className="icon" />
            {this.state.market.createdAt}
          </span>
        </div>
        <Tabs type="border-card" value={this.state.isOwner ? "1" : "2"}>
          {this.state.isOwner && (
            <Tabs.Pane
              name="1"
              label={
                <>
                  <Icon name="plus" className="icon" />
                  Add Product
                </>
              }
            >
              <NewProduct />
            </Tabs.Pane>
          )}
          <Tabs.Pane
            name="2"
            label={
              <>
                <Icon name="menu" className="icon" />
                Products{" "}
                {this.state.market.products
                  ? this.state.market.products.items.length
                  : 0}
              </>
            }
          >
            <div className="product-list">
              {this.state.market.products.items.map((product) => (
                <Product prodcut={product} />
              ))}
            </div>
          </Tabs.Pane>
        </Tabs>
      </>
    );
  }
}

export default MarketPage;
